#![allow(non_snake_case, unused_imports, unused_macros)]

mod utils;

use pathfinding::prelude::{absdiff, astar, bfs, dijkstra};
use std::fmt;
use std::num::*;
use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

impl Grid {
    pub fn new(width: i32, height: i32, is_wall: Vec<bool>) -> Self {
        let mut blocks = Vec::<CityBlock>::new();
        assert_eq!(is_wall.len(), (width * height) as usize);
        for i in 0..width {
            for j in 0..height {
                blocks.push(CityBlock(i, j));
            }
        }
        Self { blocks, is_wall }
    }
    pub fn is_wall_there(&self, x: i32, y: i32) -> bool {
        let index = self.blocks.iter().position(|p| p.0 == x && p.1 == y);
        match index {
            Some(index) => self.is_wall[index],
            _ => false,
        }
    }

    pub fn width(&self) -> i32 {
        55 // hardcoded because of the frontend..
    }

    pub fn height(&self) -> i32 {
        22 // hardcoded because of the frontend..
    }
}

#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd)]
struct King(i32, i32);

#[wasm_bindgen]
impl King {
    fn distance(&self, other: &King) -> u32 {
        // Ord is not implemented for float types, so we must copy its
        // behaviour with u32 types, so we match on the distance of the node.
        // Zero is unchanged, diagonals are considered as distance 14, and
        // non-diagonal neighbors are considered as distance 10.
        // (Because what we really want is the relation of 1 and sqrt(2)..)
        // This approximation is enough to get the smooth feel in the frontend.

        match absdiff(self.0, other.0) + absdiff(self.1, other.1) {
            dist if dist == 0 => 0,
            dist if dist == 1 => 10,
            _ => 14,
        }
    }

    fn successors(&self, grid: Grid) -> Vec<(King, u32)> {
        let &King(x, y) = self;
        vec![
            King(x + 1, y + 1),
            King(x + 1, y),
            King(x + 1, y - 1),
            King(x, y - 1),
            King(x, y + 1),
            King(x - 1, y),
            King(x - 1, y + 1),
            King(x - 1, y - 1),
        ]
        .into_iter()
        .filter(|p| {
            !grid.is_wall_there(p.0, p.1) // don't walk on walls
            && p.1 >= 0 && p.0 >= 0  // don't walk beyond lower bounds
            && p.0 < grid.width() && p.1 < grid.height() // don't walk beyond upper bounds
        })
        .map(|p| (p.clone(), p.distance(&self))) // set the "real" euclidean distance
        .collect()
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub struct CityBlock(i32, i32);

#[derive(Debug)]
pub struct Grid {
    blocks: Vec<CityBlock>,
    is_wall: Vec<bool>,
}

#[wasm_bindgen]
impl CityBlock {
    fn distance(&self, other: &CityBlock) -> u32 {
        (absdiff(self.0, other.0) + absdiff(self.1, other.1)) as u32
    }

    fn successors(&self, grid: Grid) -> Vec<(CityBlock, u32)> {
        let &CityBlock(x, y) = self;
        vec![
            CityBlock(x + 1, y),
            CityBlock(x, y - 1),
            CityBlock(x, y + 1),
            CityBlock(x - 1, y),
        ]
        .into_iter()
        .filter(|p| {
            !grid.is_wall_there(p.0, p.1) // don't walk on walls
            && p.1 >= 0 && p.0 >= 0 // don't walk beyond lower bounds
            && p.0 < grid.width() && p.1 < grid.height() // dont't walk beyond upper bounds
        })
        .map(|p| (p, 1)) // all neighbors have uniform weight
        .collect()
    }
}

#[wasm_bindgen]
pub fn run_astar_king(
    width: i32,
    height: i32,
    is_wall: Vec<u8>,
    start_x: i32,
    start_y: i32,
    goal_x: i32,
    goal_y: i32,
) -> Vec<i32> {
    utils::set_panic_hook();
    let START: King = King(start_x, start_y);
    let GOAL: King = King(goal_x, goal_y);
    let z: Vec<bool> = is_wall.into_iter().map(|a| a != 0).collect();
    let result = astar(
        &START,
        |p| p.successors(Grid::new(width, height, z.clone())),
        |p| p.distance(&GOAL) / 3,
        |p| *p == GOAL,
    );

    match result {
        Some(r) => (r.0)
            .iter()
            .fold(Vec::with_capacity(r.0.len() * 2), |mut acc, p| {
                acc.push(p.0);
                acc.push(p.1);
                acc
            }),
        None => Vec::<i32>::new(),
    }
}

// pub fn run_astar_knight(start_x: i32, start_y: i32, goal_x: i32, goal_y: i32) -> Vec<i32> {
//     let START: Knight = Knight(start_x, start_y);
//     let GOAL: Knight = Knight(goal_x, goal_y);
//     let result = astar(
//         &START,
//         |p| p.successors(),
//         |p| p.distance(&GOAL) / 3,
//         |p| *p == GOAL,
//     );

//     let r = result.expect("...").0;
//     r.iter()
//         .fold(Vec::with_capacity(r.len() * 2), |mut acc, p| {
//             acc.push(p.0);
//             acc.push(p.1);
//             acc
//         })
// }

#[wasm_bindgen]
pub fn run_astar_cityblock(
    width: i32,
    height: i32,
    is_wall: Vec<u8>,
    start_x: i32,
    start_y: i32,
    goal_x: i32,
    goal_y: i32,
) -> Vec<i32> {
    utils::set_panic_hook();
    let START: CityBlock = CityBlock(start_x, start_y);
    let GOAL: CityBlock = CityBlock(goal_x, goal_y);
    let z: Vec<bool> = is_wall.into_iter().map(|a| a != 0).collect();
    let result = astar(
        &START,
        |p| p.successors(Grid::new(width, height, z.clone())),
        |p| p.distance(&GOAL) / 3,
        |p| *p == GOAL,
    );
    match result {
        Some(r) => (r.0)
            .iter()
            .fold(Vec::with_capacity(r.0.len() * 2), |mut acc, p| {
                acc.push(p.0);
                acc.push(p.1);
                acc
            }),
        None => Vec::<i32>::new(),
    }
}

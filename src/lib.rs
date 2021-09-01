mod utils;

use pathfinding::prelude::{absdiff, astar};
use std::fmt::Debug;
use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[allow(unused_macros)]
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

/// Generic trait for a 2D grid where you have distance
/// and some logic which cells are connected.
pub trait Searchable: 'static + Debug {
    fn successors(&self, grid: Grid) -> Vec<(Self, u32)>
    where
        Self: Sized + 'static;

    fn distance(&self, other: Self) -> u32
    where
        Self: Sized + 'static;
}

/// Struct representing the grid state.
#[derive(Debug)]
pub struct Grid {
    /// The cells of the grid.
    blocks: Vec<Box<dyn Searchable + 'static>>,
    /// The indicator whether the corresponding cell is a wall.
    is_wall: Vec<bool>,
}

impl Grid {
    pub fn new(width: i32, height: i32, is_wall: Vec<bool>) -> Self {
        let mut blocks = Vec::<Box<dyn Searchable>>::new();
        debug_assert_eq!(is_wall.len(), (width * height) as usize);
        for i in 0..width {
            for j in 0..height {
                blocks.push(Box::new(CityBlock(i, j)));
            }
        }
        Self { blocks, is_wall }
    }
    /// Check if there is a wall at (x, y).
    pub fn is_wall_there(&self, x: i32, y: i32) -> bool {
        let index = (x * self.height() as i32 + y) as usize;
        match index {
            i if i <= (self.height() * self.width() - 1) as usize => self.is_wall[i],
            _ => true,
        }
    }

    pub fn width(&self) -> i32 {
        55 // hardcoded because of the frontend..
    }

    pub fn height(&self) -> i32 {
        22 // hardcoded because of the frontend..
    }
}

/// Struct representing a moveable object on the grid allowing
/// diagonal steps too.
#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd, Copy)]
struct King(pub i32, pub i32);

impl Searchable for King {
    fn distance(&self, other: King) -> u32 {
        // Ord is not implemented for float types, so we must copy its
        // behaviour with u32 types, so we match on the distance of the node.
        // Zero is unchanged, diagonals are considered as distance 14, and
        // non-diagonal neighbors are considered as distance 10.
        // (Because what we really want is the relation of 1 and sqrt(2)..)
        // This approximation is good enough to get the smooth feel in the frontend.

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
        .map(|p| (p, p.distance(*self))) // set the "real" euclidean distance
        .collect()
    }
}

/// Struct representing a moveable object on the grid not allowing
/// diagonal steps.
#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd, Copy)]
pub struct CityBlock(pub i32, pub i32);

impl Searchable for CityBlock {
    fn distance(&self, other: CityBlock) -> u32 {
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
            && p.0 < grid.width() && p.1 < grid.height() // don't walk beyond upper bounds
        })
        .map(|p| (p, 1)) // all neighbors have uniform weight
        .collect()
    }
}

/// Run the A* algorithm on the grid with diagonals allowed.
#[allow(non_snake_case)]
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
        |p| p.distance(GOAL) / 3,
        |p| *p == GOAL,
    );

    if let Some(res) = &result {
        log!("cost is approximately {}", res.1 / 10);
    }
    
    match result {
        Some(r) => (r.0)
            .iter()
            .fold(Vec::with_capacity(r.0.len() * 2), |mut acc, p| {
                acc.push(p.0);
                acc.push(p.1);
                acc
            }),
        None => vec![],
    }
}

/// Run the A* algorithm on the grid with diagonals disabled.
#[allow(non_snake_case)]
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
        |p| p.distance(GOAL) / 3,
        |p| *p == GOAL,
    );
    if let Some(res) = &result {
        log!("cost is {}", res.1);
    }
    match result {
        Some(r) => (r.0)
            .iter()
            .fold(Vec::with_capacity(r.0.len() * 2), |mut acc, p| {
                acc.push(p.0);
                acc.push(p.1);
                acc
            }),
        None => vec![],
    }
}

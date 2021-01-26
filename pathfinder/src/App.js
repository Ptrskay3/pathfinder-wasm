import React, { useState, useEffect } from "react";
import "./App.css";
import Node from "./components/Node";
import Menubar from "./components/Menubar";

const zip = (a, b) => a.map((k, i) => [k, b[i]]);

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

const Loaded = ({ wasm }) => {
  const width = 25;
  const height = 25;

  const blocks = [];
  for (let j = 0; j < width * height; j++) {
    blocks.push(0);
  }
  // eslint-disable-next-line no-unused-vars
  const [walls, _setWalls] = useState(blocks);

  const build_universe = (width, height) => {
    const nodes = [];
    for (let x = 0; x < height; x++) {
      const currentRow = [];
      for (let y = 0; y < width; y++) {
        if (y === 0 && x === 0) {
          const node = {
            x: x,
            y: y,
            isStart: true,
            isFinish: false,
            isWall: walls[width * x + y],
            isVisited: false,
          };
          currentRow.push(node);
        } else {
          const node = {
            x: x,
            y: y,
            isStart: false,
            isFinish: false,
            isWall: walls[width * x + y],
            isVisited: false,
          };
          currentRow.push(node);
        }
      }
      nodes.push(currentRow);
    }
    return nodes;
  };

  const forceUpdate = useForceUpdate();

  const eraseGoalsCallback = () => {
    try {
      const finish = document.getElementsByClassName(`node is-finish`);
      for (let i = 0; i < finish.length; i++) {
        finish[i].className = "node";
      }
    } catch {}
  };
  const board = build_universe(width, height, eraseGoalsCallback);
  // const v = wasm.run_astar_cityblock(width, height, walls, 0, 0, GOALX, GOALY);
  // eslint-disable-next-line no-unused-vars
  const [universe, _setUniverse] = useState(board);
  // eslint-disable-next-line no-unused-vars
  // const [_path, _setPath] = useState(v);
  const [isPathThere, setIsPathThere] = useState(true);

  const fetchWallsCity = () => {
    const block = new Array(width * height);
    block.fill(0);
    const a = document.getElementsByClassName(`node is-really-wall`);
    for (let k = 0; k < a.length; k++) {
      const el = a[k].id.split("-");
      // console.log(`ez most wall lett x: ${el[1]} y: ${el[2]}`);
      block[parseInt(el[1]) * width + parseInt(el[2])] = 1;
    }
    const goal = getGoal();
    if (goal === undefined) {
      // console.log("no");
      return;
    } else {
      // console.log("goal set to", goal.x, goal.y);
    }
    const z = wasm.run_astar_cityblock(
      width,
      height,
      block,
      0,
      0,
      goal.x,
      goal.y
    );

    animateShortestPath(buildPath(z));
  };

  const clearWalls = () => {
    const lastpath = document.getElementsByClassName(`node`);
    // console.log("a hossza most", lastpath);
    for (let j = 0; j < lastpath.length; j++) {
      const node = lastpath[j];
      if (node.classList.contains("is-really-wall")) {
        node.className = "node";
      }
    }
  };

  const rebuild_universe = (withWalls = false) => {
    // const block = new Array(width * height);
    // block.fill(0);
    // const u = build_universe(width, height, block);

    const lastpath = document.getElementsByClassName(`node`);
    // console.log("a hossza most", lastpath);
    for (let j = 0; j < lastpath.length; j++) {
      const cond = withWalls
        ? false
        : lastpath[j].classList.contains("is-really-wall");
      if (cond) {
        continue;
      } else if (lastpath[j].classList.contains("is-start")) {
        lastpath[j].className = "node is-start";
      } else if (lastpath[j].classList.contains("is-finish")) {
        lastpath[j].className = "node is-finish";
      } else {
        lastpath[j].className = "node";
      }
    }
  };

  const fetchWallsKing = () => {
    const block = new Array(width * height);
    block.fill(0);
    const a = document.getElementsByClassName("node is-really-wall");
    for (let k = 0; k < a.length; k++) {
      const el = a[k].id.split("-");
      // console.log(`ez most wall lett x: ${el[1]} y: ${el[2]}`);
      block[parseInt(el[1]) * width + parseInt(el[2])] = 1;
    }
    const goal = getGoal();
    if (goal === undefined) {
      return;
    } else {
      // console.log("goal set to", goal.x, goal.y);
    }
    const z = wasm.run_astar_king(width, height, block, 0, 0, goal.x, goal.y);

    animateShortestPath(buildPath(z));
  };

  const getGoal = () => {
    try {
      const finish = document.getElementsByClassName(`node is-finish`);
      const el = finish[0].id.split("-");
      return { x: el[1], y: el[2] };
    } catch {
      return;
    }
  };

  // const clearInitialGoal = () => {
  //   try {
  //     const finish = document.getElementsByClassName(`node is-finish`);
  //     for (let i = 0; i < finish.length - 1; i++) {
  //       finish[i].className = "node";
  //     }
  //   } catch {
  //     console.log("skipped");
  //   }
  // };

  const buildPath = (p) => {
    const x_path = [];
    const y_path = [];
    if (p) {
      for (let i = 0; i < p.length; i++) {
        if (i % 2 === 0) {
          x_path.push(p[i]);
        } else {
          y_path.push(p[i]);
        }
      }
      const existing = zip(x_path, y_path);
      return existing;
    }
  };

  const animateShortestPath = (existing) => {
    if (existing.length === 0) {
      const el = document.getElementById("pathbutton");
      // console.log(el);
      el.innerHTML = "No path";
      el.classList.add("btn-inactive");
      setIsPathThere(false);
    }

    // cleanup last
    // const lastpath = document.getElementsByClassName("node is-visited");
    // console.log("ezek", lastpath);
    // for (let j = 0; j < lastpath.length; j++) {
    //   console.log("ezt megváltoztotta", lastpath[j]);
    //   lastpath[j].className = "node";
    // }
    rebuild_universe();

    for (let i = 0; i < existing.length; i++) {
      setTimeout(() => {
        const node = existing[i];
        try {
          const element = document.getElementById(`node-${node[0]}-${node[1]}`);
          if (element.classList.contains("is-start")) {
            element.className = "node is-start is-visited";
          } else if (element.classList.contains("is-finish")) {
            element.className = "node is-visited is-finish";
          } else {
            document.getElementById(`node-${node[0]}-${node[1]}`).className =
              "node is-visited";
          }
        } catch (e) {
          console.log(e);
        }
      }, 20 * i);
    }
    setIsPathThere(true);
  };

  return (
    <div className="cent">
      <Menubar
        findPathKing={fetchWallsKing}
        findPath={fetchWallsCity}
        clearUni={() => rebuild_universe(true)}
        clearWalls={() => clearWalls()}
        isPathThere={isPathThere}
      ></Menubar>
      <div id="cls" className="grid" align="center">
        {universe.map((row, rowIdx) => {
          return (
            <div>
              {row.map((node, nodeIdx) => {
                const { x, y, isFinish, isStart, isWall, isVisited } = node;
                return (
                  <Node
                    x={x}
                    y={y}
                    isStart={isStart}
                    isFinish={isFinish}
                    isVisited={isVisited}
                    isWall={isWall}
                    callback={eraseGoalsCallback}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Unloaded = ({ loading }) => {
  return loading ? <div>Laying down bricks...</div> : <div />;
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [wasm, setWasm] = useState(null);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        setLoading(true);
        const wasm = await import("pathfinder-wasm");
        setWasm(wasm);
      } finally {
        setLoading(false);
      }
    };
    loadWasm();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {wasm ? <Loaded wasm={wasm} /> : <Unloaded loading={loading} />}
      </header>
    </div>
  );
};

export default App;

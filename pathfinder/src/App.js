import React, { useState, useEffect } from "react";
import Node from "./components/Node";
import Menubar from "./components/Menubar";
import Welcome from "./components/Welcome";
import Legend from "./components/Legend";
import randomMazes from "./Mazes";
import "./App.css";

const zip = (a, b) => a.map((k, i) => [k, b[i]]);

const Unloaded = ({ loading }) => {
  return loading ? <div>Laying down cells..</div> : <div />;
};

const Loaded = ({ wasm }) => {
  const width = 55;
  const height = 22;

  const blocks = [];
  for (let j = 0; j < width * height; j++) {
    blocks.push(0);
  }
  // eslint-disable-next-line no-unused-vars
  const [walls, _setWalls] = useState(blocks);
  const [isModalOpen, toggleModal] = useState(false);

  const build_universe = (width, height) => {
    const nodes = [];
    for (let x = 0; x < height; x++) {
      const currentRow = [];
      for (let y = 0; y < width; y++) {
        if (y === 0 && x === 0) {
          const node = {
            x: y,
            y: x,
            isStart: true,
            isFinish: false,
            isWall: walls[width * y + x],
            isVisited: false,
          };
          currentRow.push(node);
        } else {
          const node = {
            x: y,
            y: x,
            isStart: false,
            isFinish: false,
            isWall: walls[width * y + x],
            isVisited: false,
          };
          currentRow.push(node);
        }
      }
      nodes.push(currentRow);
    }
    return nodes;
  };

  const eraseGoalsCallback = () => {
    try {
      const finish = document.getElementsByClassName(`node is-finish`);
      for (let i = 0; i < finish.length; i++) {
        finish[i].className = "node";
      }
    } catch {}
  };
  const board = build_universe(width, height);
  // eslint-disable-next-line no-unused-vars
  const [universe, _setUniverse] = useState(board);
  // eslint-disable-next-line no-unused-vars
  const [isPathThere, setIsPathThere] = useState(true);

  const setWallsFromArray = (walls) => {
    // cleanup
    rebuild_universe(true);
    const { blocks, startNode, finishNode } = walls();
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        document.getElementById(`node-${x}-${y}`).className =
          blocks[x * height + y] === 1 ? "node is-really-wall" : "node";
      }
    }
    document.getElementById(`node-${startNode[0]}-${startNode[1]}`).className =
      "node is-start";
    document.getElementById(
      `node-${finishNode[0]}-${finishNode[1]}`
    ).className = "node is-finish";
  };

  const fetchWallsCity = () => {
    const block = new Array(width * height).fill(0);
    const a = document.getElementsByClassName(`node is-really-wall`);
    for (let k = 0; k < a.length; k++) {
      const el = a[k].id.split("-");
      block[parseInt(el[1]) * height + parseInt(el[2])] = 1;
    }
    const goal = getGoal();
    if (goal === undefined) {
      return;
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
    for (let j = 0; j < lastpath.length; j++) {
      const node = lastpath[j];
      if (node.classList.contains("is-really-wall")) {
        node.className = "node";
      }
    }
  };

  const rebuild_universe = (withWalls = false) => {
    const lastpath = document.getElementsByClassName(`node`);
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

  const clearShortest = () => {
    const lastpath = document.getElementsByClassName(`node`);
    for (let j = 0; j < lastpath.length; j++) {
      if (lastpath[j].classList.contains("is-really-wall")) {
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
      block[parseInt(el[1]) * height + parseInt(el[2])] = 1;
    }
    const goal = getGoal();
    if (goal === undefined) {
      return;
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
      el.innerHTML = "No path";
      el.classList.add("btn-inactive");
      setIsPathThere(false);
    }

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
        clearShortest={() => clearShortest()}
        isPathThere={isPathThere}
        toggleModal={() => toggleModal(!isModalOpen)}
        randomWalls={() => setWallsFromArray(randomMazes)}
      ></Menubar>
      <div id="cls" className="grid" align="center">
        {universe.map((row, rowIdx) => {
          return (
            <div>
              {row.map((node, nodeIdx) => {
                const { x, y, isFinish, isStart, isWall, isVisited } = node;
                return (
                  <Node
                    key={nodeIdx * width + y}
                    x_={x}
                    y_={y}
                    isStart_={isStart}
                    isFinish_={isFinish}
                    isVisited_={isVisited}
                    isWall_={isWall}
                    callback_={eraseGoalsCallback}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      <Legend />
      {isModalOpen ? (
        <Welcome isOpen={isModalOpen} toggle={toggleModal} />
      ) : null}
    </div>
  );
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

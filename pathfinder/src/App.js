import React, { useState, useEffect } from "react";
import "./App.css";
import Node from "./components/Node";

const zip = (a, b) => a.map((k, i) => [k, b[i]]);

const build_universe = (width, height, goalx, goaly, blocks) => {
  const v = [];
  for (let x = 0; x < height; x++) {
    const currentRow = [];
    for (let y = 0; y < width; y++) {
      if (y === 0 && x === 0) {
        const c = (
          <Node
            x={x}
            y={y}
            isStart={true}
            isFinish={false}
            isWall={blocks[width * x + y]}
          />
        );
        currentRow.push(c);
      } else if (y === goaly && x === goalx) {
        const c = (
          <Node
            x={x}
            y={y}
            isStart={false}
            isFinish={true}
            isWall={blocks[width * x + y]}
          />
        );
        currentRow.push(c);
      } else {
        const c = (
          <Node
            x={x}
            y={y}
            isStart={false}
            isFinish={false}
            isWall={blocks[width * x + y]}
          />
        );
        currentRow.push(c);
      }
    }
    v.push(currentRow);
  }
  return v;
};

const Loaded = ({ wasm }) => {
  const width = 20;
  const height = 20;
  const GOALX = 11;
  const GOALY = 6;

  const blocks = [];
  for (let j = 0; j < width * height; j++) {
    blocks.push(0);
  }
  // eslint-disable-next-line no-unused-vars
  const [walls, _setWalls] = useState(blocks);
  const v = wasm.run_astar_cityblock(width, height, walls, 0, 0, GOALX, GOALY);
  const board = build_universe(width, height, GOALX, GOALY, blocks);
  // eslint-disable-next-line no-unused-vars
  const [universe, _setUniverse] = useState(board);
  // eslint-disable-next-line no-unused-vars
  const [_path, _setPath] = useState(v);

  const fetchWalls = () => {
    const block = new Array(width * height);
    block.fill(0);
    const a = document.getElementsByClassName(`node is-really-wall`);
    for (let k = 0; k < a.length; k++) {
      const el = a[k].id.split("-");
      console.log(`ez most wall lett x: ${el[1]} y: ${el[2]}`);
      block[parseInt(el[1]) * width + parseInt(el[2])] = 1;
    }
    const goal = getGoal();
    if (goal === undefined) {
      console.log("no");
      return;
    } else {
      console.log("goal set to", goal.x, goal.y);
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

  const getGoal = () => {
    try {
      const finish = document.getElementsByClassName(`node is-finish`);
      const el = finish[0].id.split("-");
      return { x: el[1], y: el[2] };
    } catch {}
  };

  const clearInitialGoal = () => {
    try {
      const finish = document.getElementsByClassName(`node is-finish`);
      for (let i = 0; i < finish.length; i++) {
        finish[i].className = "node";
      }
    } catch {
      console.log("skipped");
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
      console.log("There's no path ...");
      return;
    }

    // cleanup last
    const lastpath = document.getElementsByClassName(`node is-visited`);
    console.log("a hossza most", lastpath);
    for (let j = 0; j < lastpath.length - 1; j++) {
      console.log(lastpath[j]);
      lastpath[j].className = "node";
    }

    for (let i = 0; i < existing.length; i++) {
      setTimeout(() => {
        const node = existing[i];
        try {
          document.getElementById(`node-${node[0]}-${node[1]}`).className =
            "node is-visited";
        } catch {}
      }, 20 * i);
    }
  };

  return (
    <div
      id="cls"
      className="grid"
      align="center"
      onCompositionUpdate={clearInitialGoal}
    >
      <button className="btn" onClick={fetchWalls}>
        Find the way.
      </button>
      {universe.map((row, rowIdx) => {
        return <div>{row.map((node, nodeIdx) => node)}</div>;
      })}
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

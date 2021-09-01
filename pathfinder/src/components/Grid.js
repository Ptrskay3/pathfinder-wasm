import React, { useState } from "react";
import Node from "./Node";
import "./Grid.css";
import { width, height } from "../constants";

export const Grid = ({ wasm, onFinishClick, onStartClick }) => {
  const walls = Array(height * width).fill(0);

  // the default state of the grid
  const build_universe = (width, height, walls) => {
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

  const [universe] = useState(() =>
    build_universe(width, height, walls)
  );

  return (
    <div id="cls" className="grid container" align="center">
      {universe.map((row, rowIdx) => {
        return (
          <div className="gridRow" key={rowIdx}>
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
                  onFinishClick={onFinishClick}
                  onStartClick={onStartClick}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

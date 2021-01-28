import React from "react";

export default function Lenged() {
  return (
    <div id="wrapper">
      <p id="article">
        <div id="floating" className="legend-no is-legend-s">
          &nbsp;
        </div>
        Start Node
      </p>
      <p id="article">
        <div id="floating" className="legend-no is-legend-f">
          &nbsp;
        </div>
        Finish Node
      </p>
      <p id="article">
        <div id="floating" className="legend-no is-legend-w">
          &nbsp;
        </div>
        Wall
      </p>
      <p id="article">
        <div id="floating" className="legend-no is-legend-v">
          &nbsp;
        </div>
        Shortest path
      </p>
    </div>
  );
}

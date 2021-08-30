import React, { useEffect, useRef } from "react";
import ReactModal from "react-modal";
import Legend from "./Legend";

export const useClickOutside = (insideRefs, isVisible, onClose) => {
  useEffect(() => {
    const handleWindowClick = (event) => {
      const someRefContainTarget = insideRefs
        .filter((ref) => ref.current)
        .some((ref) => ref.current.contains(event.target));

      if (someRefContainTarget) {
        return;
      }

      if (!isVisible) {
        return;
      }

      if (onClose) {
        onClose();
      }
    };

    if (isVisible) {
      window.addEventListener("click", handleWindowClick);
    }

    return () => {
      if (isVisible) {
        window.removeEventListener("click", handleWindowClick);
      }
    };
  }, [isVisible, onClose]);
};

export default function Welcome({ isOpen, toggle }) {
  const ref = useRef(null);

  useClickOutside(ref, false, () => toggle(false));

  return (
    <div>
      <ReactModal
        style={{
          overlay: {
            position: "absolute",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
          content: {
            position: "absolute",
            top: "100px",
            left: "50px",
            right: "50px",
            bottom: "100px",
            border: "1px solid #ccc",
            background: "#3b4861",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: "4px",
            outline: "none",
            padding: "20px",
          },
        }}
        ref={ref}
        appElement={document.getElementById("root")}
        isOpen={isOpen}
        contentLabel="Minimal Modal Example"
      >
        <div align="center" ref={React.createRef()}>
          <Legend />
          <div>
            <p id="tutorial">
              Finish Node can be set by left-clicking on a cell.
            </p>
            <p id="tutorial">
              Pressing or holding W while hovering over a cell will toggle
              between free cell and wall.
            </p>
            <p id="tutorial">
              Diagonal adjacency can be turned on/off with the `Diagonal
              allowed/Diagonal disabled` button. When turned on, the cost of
              moving to diagonals is weighted as the "natural" eucledian
              distance.
            </p>
            <p id="tutorial">
              If there's no way to reach the finish node, the `Find Path` button
              will turn to red and will say `No path`.
            </p>
            <p id="tutorial">
              Randomize button will create a random solvable maze (currently
              only 2 separate mazes are available).
            </p>
            <p id="tutorial-sidenote">
              Sidenotes
              <ul>
                <li>
                  Start Node will also be moveable in the future, once I'll
                  figure out a nice way to interact with it.
                </li>
                <li>
                  For the time being the application uses A* algorithm to find
                  the shortest path.
                </li>
              </ul>
            </p>
          </div>

          <button className="btn-active" onClick={() => toggle(false)}>
            Got it
          </button>
        </div>
      </ReactModal>
    </div>
  );
}

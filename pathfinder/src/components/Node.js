import React from "react";
import { useState, useRef } from "react";
import { debounce } from "lodash";
import "./Node.css";

const useFocus = () => {
  const htmlElRef = useRef(null);
  const setFocus = () => {
    htmlElRef.current && htmlElRef.current.focus();
  };

  return [htmlElRef, setFocus];
};

export default function Node({
  x_,
  y_,
  isStart_,
  isFinish_,
  isVisited_,
  isWall_,
  callback_,
}) {
  const [x, setX] = useState(x_);
  const [y, setY] = useState(y_);
  const [isStart, setIsStart] = useState(isStart_);
  const [isFinish, setIsFinish] = useState(isFinish_);
  const [isVisited, setIsVisited] = useState(isVisited_);
  const [isWall, setIsWall] = useState(isWall_);

  const [nodeRef, setNodeFocus] = useFocus();

  const onMouseDown = () => {
    callback_();
    setIsFinish(true);
    setIsWall(false);
    setIsVisited(false);
  };

  const onKeyPressed = () => {
    if (isStart) return;
    setIsWall(!isWall);
    setIsFinish(false);
  };

  const extraClassName = isStart
    ? "is-start"
    : isFinish
    ? "is-finish"
    : isVisited
    ? "is-visited"
    : isWall
    ? "is-really-wall"
    : "";

  return (
    <div
      ref={nodeRef}
      tabIndex="0"
      onMouseDown={onMouseDown}
      onMouseEnter={setNodeFocus}
      onKeyDown={debounce(
        (event) => {
          if (event.key === "w") {
            onKeyPressed();
          }
        },
        10,
        { trailing: true, leading: false }
      )}
      className={`node ${extraClassName}`}
      id={`node-${x}-${y}`}
    />
  );
}

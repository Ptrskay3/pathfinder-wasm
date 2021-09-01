import React from "react";
import { useState, useRef } from "react";
import _ from "lodash";
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
  onFinishClick,
  onStartClick,
}) {
  const [x] = useState(x_);
  const [y] = useState(y_);
  const [isStart, setIsStart] = useState(isStart_);
  const [isFinish, setIsFinish] = useState(isFinish_);
  const [isVisited, setIsVisited] = useState(isVisited_);
  const [isWall, setIsWall] = useState(isWall_);

  const [nodeRef, setNodeFocus] = useFocus();

  const onMouseDown = (event) => {
    event.preventDefault();
    onFinishClick();
    event.nativeEvent.stopImmediatePropagation();
    setIsFinish(() => !isFinish);
    setIsWall(false);
    setIsStart(false);
    setIsVisited(false);
  };

  const onContextMenu = (event) => {
    event.preventDefault();
    onStartClick();
    event.nativeEvent.stopImmediatePropagation();
    setIsStart(() => !isStart);
    setIsFinish(false);
    setIsWall(false);
    setIsVisited(false);
  };

  const onKeyPressed = () => {
    setIsWall(() => !isWall);
    setIsFinish(false);
    setIsStart(false);
    setIsVisited(false);
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
      onClick={onMouseDown}
      onContextMenu={onContextMenu}
      onMouseEnter={setNodeFocus}
      onKeyDown={_.debounce(
        (event) => {
          if (event.key === "w") {
            onKeyPressed();
          }
        },
        500,
        { trailing: true, leading: true }
      )}
      className={`node ${extraClassName}`}
      id={`node-${x}-${y}`}
    />
  );
}

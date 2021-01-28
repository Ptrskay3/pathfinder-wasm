import React from "react";
import { useState, useRef, useCallback } from "react";
import "./Node.css";

const useFocus = () => {
  const htmlElRef = useRef(null);
  const setFocus = () => {
    htmlElRef.current && htmlElRef.current.focus();
  };

  return [htmlElRef, setFocus];
};

const debounce = (func, wait = 500) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
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

  const _onKeyPressed = () => {
    if (isStart) return;

    setIsWall(!isWall);
    setIsFinish(false);
  };

  // TODO: implement throttle
  const handler = useCallback(debounce(_onKeyPressed, 5), [
    isWall,
    isFinish,
    isStart,
  ]);

  const onKeyPressed = () => {
    handler();
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
      onKeyDown={onKeyPressed}
      className={`node ${extraClassName}`}
      id={`node-${x}-${y}`}
    />
  );
}

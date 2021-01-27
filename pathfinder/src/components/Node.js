import React from "react";
import "./Node.css";

// const zip = (a, b) => a.map((k, i) => [k, b[i]]);

const debounce = (func, wait = 500) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
};

const throttle = (fn, delay) => {
  let lastCalled = 0;
  return (...args) => {
    let now = new Date().getTime();
    if (now - lastCalled < delay) {
      return;
    }
    lastCalled = now;
    return fn(...args);
  };
};

export default class Node extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      x: this.props.x,
      y: this.props.y,
      isStart: this.props.isStart,
      isFinish: this.props.isFinish,
      isVisited: this.props.isVisited,
      isWall: this.props.isWall,
      dragging: false,
      callback: this.props.callback,
    };
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    // this.onMouseUp = this.onMouseUp.bind(this);
    this.onKeyPressed = this.onKeyPressed.bind(this);
    // this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  onMouseEnter() {
    this.node.focus();
  }

  onMouseDown(event) {
    this.state.callback();
    this.setState({ isFinish: true, isWall: false, isVisited: false });
  }

  onMouseLeave() {
    this.setState({ isFinish: false });
  }

  onKeyPressed(e) {
    if (this.state.isStart) return;
    this.setState({
      isWall: !this.state.isWall,
      isFinish: false,
    });
  }

  render() {
    const extraClassName = this.state.isStart
      ? "is-start"
      : this.state.isFinish
      ? "is-finish"
      : this.state.isVisited
      ? "is-visited"
      : this.state.isWall
      ? "is-really-wall"
      : "";
    return (
      <div
        ref={(inputEl) => (this.node = inputEl)}
        tabIndex="0"
        onClick={this.nodeClicked}
        onMouseDown={this.onMouseDown}
        onMouseEnter={this.onMouseEnter}
        onKeyDown={() => {
          throttle(this.onKeyPressed, 200)();
        }}
        className={`node ${extraClassName}`}
        id={`node-${this.state.x}-${this.state.y}`}
      />
    );
  }
}

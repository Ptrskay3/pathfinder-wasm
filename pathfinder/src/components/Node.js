import React from "react";
import "./Node.css";

// const zip = (a, b) => a.map((k, i) => [k, b[i]]);

export default class Node extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      x: this.props.x,
      y: this.props.y,
      isStart: this.props.isStart,
      isFinish: this.props.isFinish,
      isVisited: false,
      isWall: this.props.isWall,
      dragging: false,
    };
    this.nodeClicked = this.nodeClicked.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    // this.onMouseUp = this.onMouseUp.bind(this);
    this.onKeyPressed = this.onKeyPressed.bind(this);
    // this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  nodeClicked() {
    // this.setState({ isVisited: !this.state.isVisited });
    // this.setState({ isWall: !this.state.isWall });
    // console.log(`${this.state.x} ${this.state.y} :${this.state.isWall}`);
  }

  // checkVisited() {
  //   const x_path = [];
  //   const y_path = [];
  //   if (this.props.path) {
  //     for (let i = 0; i < this.props.path.length; i++) {
  //       if (i % 2 === 0) {
  //         x_path.push(this.props.path[i]);
  //       } else {
  //         y_path.push(this.props.path[i]);
  //       }
  //     }
  //     var exists = zip(x_path, y_path).filter((el) => el[0] === this.props.x);
  //   }

  //   var vis = false;
  //   if (exists) {
  //     for (let k = 0; k < exists.length; k++) {
  //       if (exists[k][1] === this.props.y) {
  //         vis = true;
  //       }
  //     }
  //   }
  //   return vis;
  // }

  onMouseEnter() {
    this.node.focus();
  }

  // onMouseUp() {
  //   this.setState({
  //     dragging: false,
  //   });
  // }

  onMouseDown(event) {
    this.setState({ isFinish: true });
    // if (event.code === 87) {

    // }
  }

  onMouseLeave() {
    // if (this.state.dragging) {
    //   this.setState({ isWall: !this.state.isWall });
    // }
    // this.setState({
    //   dragging: false,
    // });
    this.setState({ isFinish: false });
  }
  // vmi () {
  //    this.delayedCallback = _.debounce(function (e) {
  //      // `event.target` is accessible now
  //    }, 1000);
  // },

  onKeyPressed(e) {
    // e.persist();
    this.setState({ isWall: !this.state.isWall });
    // console.log(this.state.isWall);
    // this.setState({})
    // this.setState({ isWall: !this.state.isWall });
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
        // onMouseDown={this.onMouseDown}
        // onMouseUp={this.onMouseUp}
        onKeyDown={this.onKeyPressed}
        // onKeyUp={this.onKeyUp}
        // onDrag={this.onMouseDown}
        className={`node ${extraClassName}`}
        id={`node-${this.state.x}-${this.state.y}`}
      />
    );
  }
}

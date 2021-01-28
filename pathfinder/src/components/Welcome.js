import React from "react";
import ReactModal from "react-modal";
import Legend from "./Legend";

class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: this.props.modalActive,
    };

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }

  render() {
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
          isOpen={this.state.showModal}
          contentLabel="Minimal Modal Example"
        >
          <div align="center">
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
                moving to all 8 neighbors is equal.
              </p>
              <p id="tutorial">
                If there's no way to reach the finish node, the `Find Path`
                button will turn to red and will say `No Path`.
              </p>
              <p id="tutorial">
                Randomize button will create a random solvable maze.
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

            <button className="btn-active" onClick={this.handleCloseModal}>
              Got it
            </button>
          </div>
        </ReactModal>
      </div>
    );
  }
}

export default Welcome;
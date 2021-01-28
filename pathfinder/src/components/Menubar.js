import React, { useState, useEffect } from "react";
import "./Menubar.css";
import { CSSTransition } from "react-transition-group";
import Welcome from "./Welcome";

export default function Menubar({
  findPath,
  findPathKing,
  isPathThere,
  clearUni,
  clearWalls,
  clearShortest,
  toggleModal,
}) {
  const [isNavVisible, setNavVisibility] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isPath, setIsPath] = useState(isPathThere);
  const [king, setKing] = useState(false);
  // const [modalOpen, setModalOpen] = useState(toggleModal);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 700px)");
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    handleMediaQueryChange(mediaQuery);

    return () => {
      mediaQuery.removeListener(handleMediaQueryChange);
    };
  }, []);

  const handleMediaQueryChange = (mediaQuery) => {
    if (mediaQuery.matches) {
      setIsSmallScreen(true);
    } else {
      setIsSmallScreen(false);
    }
  };

  const toggleNav = () => {
    setNavVisibility(!isNavVisible);
  };

  const makePath = () => {
    if (!isPath) {
      king ? findPathKing() : findPath();
    } else {
      const el = document.getElementById("pathbutton");
      el.innerHTML = "Find Path";
      el.classList.add("btn-active");
      el.classList.remove("btn-inactive");
      king ? findPathKing() : findPath();
    }
  };

  const toggleKing = () => {
    setKing(!king);
    const el = document.getElementById("diag");
    if (king) {
      el.classList.remove("toggle");
      el.classList.add("btn-inactive");
    } else {
      el.classList.remove("btn-inactive");
      el.classList.add("toggle");
    }
  };

  return (
    <header className="Header">
      <CSSTransition
        in={!isSmallScreen || isNavVisible}
        timeout={350}
        classNames="NavAnimation"
        unmountOnExit
      >
        <nav className="Nav">
          <button
            className={isPath ? "btn-active" : "btn-inactive"}
            id="pathbutton"
            onClick={makePath}
          >
            {isPath ? "Find Path" : "No Path"}
          </button>
          <button
            className="btn-inactive toggle"
            id="diag"
            onClick={toggleKing}
          >
            {king ? "Diagonal allowed" : "Diagonal disabled"}
          </button>
          <button className="btn-active" id="clearer" onClick={clearUni}>
            Clear All
          </button>
          <button className="btn-active" id="clearer2" onClick={clearWalls}>
            Clear Walls
          </button>
          <button className="btn-active" id="clearer2" onClick={clearShortest}>
            Clear Path
          </button>
          <button className="btn-active" id="clearer2" onClick={toggleModal}>
            Help
          </button>
        </nav>
      </CSSTransition>
      <button onClick={toggleNav} className="Burger">
        ...
      </button>
    </header>
  );
}

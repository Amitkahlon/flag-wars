import React, { useState, useEffect } from 'react';
import '../../css/WelcomePage.css';
// @ts-ignore
import gameImg from '../../icons/google.png';
// @ts-ignore
import board from "../../icons/board.png";
import { Link } from 'react-router-dom'

export const WelcomePage = () => {
  const [popupStyle, showPopup] = useState("");

  useEffect(() => {
    showPopup("game-popup");
  }, []);

  return (
    <div className="background">
      <img className={"background"} src={board} alt={"background"}/>
      <div className="cover">
      <>
          <p className="welcome">welcome to flags war!</p>
          <div className={popupStyle}>
            <img className="image" src={gameImg} width={30} height={30} alt={"board"}/>
          </div>
          <div className="buttons">
            <Link className="links" to="/login">
              <button className="loginBtn">
                Login
              </button>
            </Link>
            <Link className="links" to="/register">
              <button className="registerBtn">
                Register
              </button>
            </Link>
          </div>
        </>
    </div>
    </div>
  );
};

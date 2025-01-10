import React from "react";
import { useAuth } from "./useAuthClient";
import "../style/auth.css";


function LoggedOut() {
  const { login } = useAuth();
  const containerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden", // Taşan kısımları gizler
    zIndex: 0, // Arka planda kalmasını sağlar
  };

  const beforeStyle = {
      content: "''",
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "100%",
      height: "100%",
      backgroundImage: "url('img/login-2.jpg')", // Arka plan resmi
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundSize: "cover",
      transform: "translate(-50%, -50%) scale(1.2)", // Resmi ortalar ve büyütür
      alignItems: "center",
      justifyContent: "center",
  };

  return (
    <div className="container" style={containerStyle}>
      <div style={beforeStyle}></div>
      <div className="LoginContainer">
      <div className="loginCard">
        <img src="img/logincard.jpg" alt="Dungeons and Dragons" />
        <h2 className="login-text">Enter The Dungeon</h2>
        <button type="button" className="login-button" onClick={login}>
          <img src="img/navbar-2.jpg" alt="" />
          Log In
        </button>
      </div>
      </div>
    </div>
  );
}

export default LoggedOut;

import React from "react";
import { useAuth } from "./useAuthClient";
import "../style/auth.css";


function LoggedOut() {
  const { login } = useAuth();

  return (
    <div className="container">
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

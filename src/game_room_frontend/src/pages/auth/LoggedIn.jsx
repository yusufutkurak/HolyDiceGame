import React from "react";
import { useAuth } from "./useAuthClient";

const whoamiStyles = {
  border: "1px solid #1a1a1a",
  marginBottom: "1rem",
};

function LoggedIn() {
  const [result, setResult] = React.useState("");

  const { game_roomActor, logout } = useAuth();

  const handleClick = async () => {
    try {
      const response = await game_roomActor.whoami();
      setResult(response.toString());
    } catch (error) {
      console.error("Failed to fetch identity:", error);
      setResult("Error fetching identity");
    }
  };

  return (
    <div className="container">
      <h1>Internet Identity Client</h1>
      <h2>You are authenticated!</h2>
      <p>To see how a canister views you, click this button!</p>
      <button
        type="button"
        id="whoamiButton"
        className="primary"
        onClick={handleClick}
      >
        Who am I?
      </button>
      <input
        type="text"
        readOnly
        id="whoami"
        value={result}
        placeholder="your Identity"
        style={whoamiStyles}
      />
      <button id="logout" onClick={logout}>
        log out
      </button>
    </div>
  );
}

export default LoggedIn;

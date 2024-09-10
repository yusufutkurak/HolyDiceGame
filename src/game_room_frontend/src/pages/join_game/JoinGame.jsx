import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/join_game.css";

function JoinGame() {
    const [roomId, setRoomID] = useState("");
    const navigate = useNavigate();

    const handleJoinRoom = () => {
        if (roomId) {
            window.location.href = `/room/${roomId}`;
        } else {
            alert("Please enter a Room ID");
        }
    };

    return (
        <div className="join-game-container">
            <div className="join-game-card">
                <h2 className="join-game-title">Join a Game</h2>
                <p className="join-game-description">Enter the Room ID to join the game.</p>
                <input 
                    className="nameInput" 
                    type="text" 
                    placeholder="Enter Room ID"
                    value={roomId} 
                    onChange={(e) => setRoomID(e.target.value)}
                />
                <button className="join-game-button" onClick={handleJoinRoom}>Join</button>
            </div>
        </div>
    );
}

export default JoinGame;

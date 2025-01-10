import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { game_room_backend } from 'declarations/game_room_backend';
import "../style/join_game.css";
import { useAuth } from "../auth/useAuthClient";

function JoinGame() {
    const [roomId, setRoomID] = useState("");
    const [ userId, setUserId ] = useState();
    const navigate = useNavigate();
    const { game_roomActor } = useAuth();

    const handleJoinRoom = () => {
        try {
            if (!roomId) {
                alert("Lütfen bir Oda ID'si girin.");
                return;
            }
            getUserId();
            console.log("Oda ID:", roomId, userId);

            
        } catch (error) {
            console.error("Odaya katılırken hata oluştu:", error);
            alert(`Odaya katılım hatası: ${error.message}`);
        }
    };

    useEffect(() =>{
        game_room_backend.add_room_player(userId, roomId);
        console.log("userıd",userId);
        if(userId != undefined){
            window.location.href = `/room/${roomId}`;
        }
    },[userId])
    
    const getUserId = async () => {
        const temp_id = await game_roomActor.whoami(); // Kullanıcı kimliği al
        const user_id = temp_id.toString(); // Principal string'e çevir
        setUserId(user_id);
    }

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
                <button className="join-game-button" onClick={handleJoinRoom} >Join</button>
            </div>
        </div>
    );
}

export default JoinGame;

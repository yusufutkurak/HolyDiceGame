import React, { useState } from 'react';
import { game_room_backend } from 'declarations/game_room_backend';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuthClient';

function CreateGame() {
    const [roomID, setRoomID] = useState('');
    const [dmID, setDmID] = useState('');
    const [players, setPlayers] = useState([]);
    const navigate = useNavigate();
    const { game_roomActor } = useAuth();

    const handleAddRoom = async (event) => {
        event.preventDefault();

        const newRoomId = Math.floor(Math.random() * 999).toString(); // roomID'yi string olarak ayarlıyoruz
        setRoomID(newRoomId);
        
        const dm_id = await game_roomActor.whoami(); // Asenkron fonksiyon için await kullanıyoruz
        const dm_id_str = dm_id.toString(); // Principal'ı string'e çeviriyoruz
        setDmID(dm_id_str);
        

        await game_room_backend.add_room(newRoomId, dm_id_str, players); // doğru parametre sırası
        //navigate(`/room/${newRoomId}`, { state: { dmID: dm_id_str } });
    }; 

    return (
        <div>
            <h1>Create a Game Room</h1>
            <form onSubmit={handleAddRoom}>
                <button type="submit">Add Room</button>
            </form>
        </div>
    );
}

export default CreateGame;

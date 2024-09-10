import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { game_room_backend } from "../../../../declarations/game_room_backend";
import { useAuth } from "../auth/useAuthClient";
import debounce from 'lodash.debounce';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import "../style/game_room.css"

function GameRoom({ ws }) {
    const { newRoomId } = useParams();
    const [players, setPlayers] = useState([]);
    const [dm, setDm] = useState();
    const [isDm, setIsDm] = useState(false);
    const [userId, setUserId] = useState();
    const [myCharacter, setMyCharacter] = useState();
    const [avatars, setAvatars] = useState();
    const [condition, setCondition] = useState("Standart");
    const [cid, setCid] = useState();
    const [myCondition, setMyCondition] = useState("Standart");
    const [d20, setD20] = useState(0); 
    const [p20, setP20] = useState(0); 
    const [t20, setT20] = useState(0); 
    const [rolling, setRolling] = useState(false); 
    const [activePlayer, setActivePlayer] = useState(null);
    const { game_roomActor } = useAuth();
    let tempCharacter = [];
    const [boxShadowColor, setBoxShadowColor] = useState("rgba(0, 0, 0, 0.3)"); // Box shadow için renk

    const getRandomColor = () => {
        // Rastgele RGB renk oluştur
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgba(${r}, ${g}, ${b}, 0.7)`;
    };
    useEffect(() => {
        getPlayers();
        if(userId === dm && userId !== undefined && dm!== undefined ){
            console.log("wtfff",userId, dm);
            setIsDm(true);
        }
        if(players){
            for(let i = 0; i<players.length; i++){
                if(players[i].user_id == userId){
                    setMyCharacter(players[i].player_id);
                }
            }
        }
    },[game_roomActor, players]);

    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };
    
    useEffect(() => {
        const sendJoinMessage = async () => {
            if (ws && ws.readyState === WebSocket.OPEN) { // Eğer WebSocket bağlıysa
                const joinMessage = {
                    message_type: "join",
                    content: {
                        Join: {
                            roomId: newRoomId,  // Oyun odasının ID'si
                            user_id: userId.toString(),
                            ready: false
                        }
                    },
                    timestamp: BigInt(Date.now()),
                };
        
                ws.send(joinMessage);
                console.log(`Sent join message for room ${newRoomId}:`, joinMessage);
            } else if (ws) {
                // WebSocket bağlanmamışsa tekrar denemek için bir dinleyici ekliyoruz
                ws.onopen = () => {
                    const joinMessage = {
                        message_type: "join",
                        content: {
                            Join: {
                                roomId: newRoomId,
                                user_id: userId.toString(),
                                ready: false
                            }
                        },
                        timestamp: BigInt(Date.now()),
                    };
        
                    ws.send(joinMessage);
                    console.log(`Sent join message for room ${newRoomId} after ws opened:`, joinMessage);
                };
            }
        };
    
        if (ws && userId) { // WebSocket ve userId varsa mesaj gönder
            sendJoinMessage();
        }
    }, [ws, userId, newRoomId]); // WebSocket, userId ve roomId değişirse yeniden çalışır
    

    useEffect(() => {
        if(userId === dm && userId !== undefined && dm!== undefined ){
            setIsDm(true);
        }

    },[isDm, userId]);

    useEffect(() => {
        if (players && players.length > 0) {
            players.forEach(async (player) => {
                const character_id = player.character.id;
                const user_id = player.user_id;

                try {
                    const data = await game_roomActor.get_character_by_user_id(character_id, user_id);
                    if (data && data.length > 0) {
                        const uri = arrayBufferToBase64(data[0].avatar[0]);
                        const imageUrl = `data:image/jpeg;base64,${uri}`;
                        // Avatars state'ini güncelleme
                        setAvatars(prevAvatars => ({
                            ...prevAvatars,
                            [user_id]: imageUrl
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching character data:", error);
                }
            });
        }
    },[players]);
    
    const getPlayers = async () => {
        try {
            if (!game_roomActor) {
                console.error('game_roomActor is not initialized.');
                return;
            }
    
            // Fetch the room data
            const temp = await game_room_backend.get_room(newRoomId);
    
            // Fetch the user ID from the actor
            const userId = await game_roomActor.whoami();
            setDm(temp[0].dm_id);  // Assuming temp[0] is the room data
            setUserId(userId.toString());
    
            // Initialize tempCharacter
            const tempCharacter = [];
    
            // Loop through characters array
            for (let i = 0; i < temp[0].characters[0].length; i++) {
                tempCharacter.push(temp[0].characters[0][i]);
            }
    
            // Set players state
            setPlayers(tempCharacter);
    
        } catch (error) {
            console.error('Error fetching players or user ID:', error);
        }
    }
    
    const handleActiveClick = debounce((player_id) => {
        if (activePlayer !== player_id && ws.readyState === WebSocket.OPEN) {
            setActivePlayer(player_id); 
        }
    }, 500); // 300 ms bekleme süresi
    
    const handleFinishClick = debounce((player_id) => {
        if (activePlayer === player_id && ws.readyState === WebSocket.OPEN) {
            setActivePlayer(null);
        }
    }, 500); // 300 ms bekleme süresi
    
    const diceRoller = () => {
        if (rolling) return; // Eğer zar dönüyorsa, yeni tıklamayı engelle
        setRolling(true); // Zarın dönmeye başladığını işaretle

        let rollCount = 0;
        const rollInterval = setInterval(() => {
            const randomDice = Math.floor(Math.random() * 20) + 1; // 1-20 arasında rastgele zar sonucu
            setD20(randomDice); // Zar güncelleme
            setBoxShadowColor(getRandomColor()); // Her seferinde rastgele renk oluştur

            rollCount++;
            if (rollCount > 5) { // 5 defa döndükten sonra durdur
                clearInterval(rollInterval);

                const finalDice = Math.floor(Math.random() * 20) + 1; // Son zar atışı
                setD20(finalDice);
                setRolling(false); // Dönmeyi durdur
            }
        }, 100); // Her 100ms'de bir döner
    };

    const diceRollerPlayer = () => {
        if (rolling) return; // Eğer zar dönüyorsa, yeni tıklamayı engelle
        setRolling(true); // Zarın dönmeye başladığını işaretle

        let rollCount = 0;
        const rollInterval = setInterval(() => {
            const randomDice = Math.floor(Math.random() * 20) + 1; // 1-20 arasında rastgele zar sonucu
            setP20(randomDice); // Zar güncelleme
            setBoxShadowColor(getRandomColor()); // Her seferinde rastgele renk oluştur

            rollCount++;
            if (rollCount > 5) { // 5 defa döndükten sonra durdur
                clearInterval(rollInterval);

                const finalDice = Math.floor(Math.random() * 20) + 1; // Son zar atışı
                setD20(finalDice);
                setRolling(false); // Dönmeyi durdur
            }
        }, 100); // Her 100ms'de bir döner
    };

    const handleChange = (event, playerId) =>{
        setCondition(event.target.value);
        setCid(playerId);
    }

    useEffect(()=>{
        console.log("AKTİF",activePlayer);
        if(isDm){
            if(activePlayer === null && ws && ws.readyState === WebSocket.OPEN){
                const activeMessage = {
                    message_type: "DONT_PANIC!",
                    content: {
                        Dont: { message: "null" }
                    },
                    timestamp: BigInt(Date.now()), 
                };
                ws.send(activeMessage);
                console.log("Mesaj gitti", activeMessage);
            }
            else if( ws && ws.readyState === WebSocket.OPEN){
                const activeMessage = {
                    message_type: "DONT_PANIC!",
                    content: {
                        Dont: { message: activePlayer.toString() }
                    },
                    timestamp: BigInt(Date.now()), 
                };
                ws.send(activeMessage);
                console.log("Mesaj gitti", activeMessage);
            }
        }
    
    },[activePlayer])

    useEffect(() => {
        if (ws) {
            ws.onmessage = (event) => {
                const message = event.data;
                console.log("Message received from WebSocket:", message);
            
                switch (message.message_type) {
                    case 'DONT_PANIC!':
                        const messageValue = message.content.Dont.message;
                        if(!messageValue.startsWith('d') && !messageValue.startsWith('c')) {
                            if (messageValue === "null") {
                                setActivePlayer(null);
                            } else {
                                const parsedValue = isNaN(parseInt(messageValue)) ? null : parseInt(messageValue);
                                console.log("DONT PONIC", parsedValue, activePlayer, parsedValue !== activePlayer, messageValue === "null" && activePlayer !== null);
                
                                if (parsedValue !== activePlayer) {
                                    setActivePlayer(parsedValue);
                                }
                            }
                        }          
                        else{
                            if(messageValue.startsWith('d')){
                                const newValue = messageValue.substring(1); // İlk karakteri (d) sil
                                setT20(newValue); // State'i güncelle
                            }
                            if(messageValue.startsWith('c')){
                                const condId = parseInt(messageValue.charAt(1)); // veya messageValue.substring(0, 1);
                                const newValue = messageValue.substring(2); // İlk karakteri (d) sil
                                if(condId == myCharacter){
                                    console.log("CONSDSD",condId, newValue);
                                    setMyCondition(newValue); // State'i güncelle
                                }
                                setCid(condId);
                            }
                        }
                        break;
            
                    case 'user_list':
                        break;
            
                    default:
                        console.log('Unknown message type:', message.message_type);
                }
            };
            

            ws.onclose = () => {
                console.log("WebSocket connection closed");
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        }

    }); 


    useEffect(()=>{
        if(ws){
            const dice = `d${p20}`;
            const diceMessage = {
                message_type: "DONT_PANIC!",
                content: {
                    Dont: { message: dice }
                },
                timestamp: BigInt(Date.now()), 
            };
            ws.send(diceMessage);
        }
    },[p20])

    useEffect(()=>{
        if(ws){
            const cond = `c${cid}${condition}`;
            const condMessage = {
                message_type: "DONT_PANIC!",
                content: {
                    Dont: { message: cond }
                },
                timestamp: BigInt(Date.now()), 
            };
            ws.send(condMessage);
        }
    },[condition])
    
    return (
        <div>
            {activePlayer !== null && (
                <div className="overlay"></div> /* Arka planı karartmak için overlay */
            )}
            { players && players.length>0 &&

                <div className="playerBox">
                <div className="floor">
                    {players.map(player => {
                        return (
                            <>
                                {isDm &&
                                    <button
                                    className={`playerButton ${activePlayer === player.player_id ? 'activePlayer' : ''}`} 
                                    key={player.user_id}
                                    onClick={() => handleActiveClick(player.player_id)} // Butona basıldığında player_id'yi kaydediyoruz
                                    >
                                    <div className={`playerContainer ${activePlayer === player.player_id ? '' : (activePlayer !== null ? 'dimmedCard' : '')}`}>
                                
                                    <div className="characterCard">
                                        <div className="imgFrameL">
                                            <img
                                                className="characterImg"
                                                src={avatars && avatars[player.user_id] ? avatars[player.user_id] : '/unknowch.webp'}
                                                alt={`${player.character.name}'s avatar`}
                                            />
                                        </div>
                                        <div className="cardContent">
                                            <div className="nameLabelL">
                                                <label>{player.character.name}</label>
                                            </div>
                                            <div className="raceClassL">
                                                <label className="raceLabelL rclabelL">{player.character.race}</label>
                                                <label className="classLabelL rclabelL">{player.character.class}</label>
                                            </div>
                                            <div className="abilityContentL">
                                                <div className="halfL">
                                                    {['strength', 'dexterity', 'constitution'].map((stat) => {
                                                        const abilityValue = player.character.abilitys[stat];
                                                        return (
                                                            <div className="abilityL" key={stat}>
                                                                <label className="lbl1L">{stat.charAt(0).toUpperCase() + stat.slice(1)}:</label>
                                                                <label className="lbl2L">
                                                                    {abilityValue !== undefined && abilityValue > -1
                                                                        ? `+${abilityValue}`
                                                                        : abilityValue !== undefined ? abilityValue : 'N/A'}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="halfL">
                                                    {['intelligence', 'wisdom', 'charisma'].map((stat) => {
                                                        const abilityValue = player.character.abilitys[stat];
                                                        return (
                                                            <div className="abilityL" key={stat}>
                                                                <label className="lbl1L">{stat.charAt(0).toUpperCase() + stat.slice(1)}:</label>
                                                                <label className="lbl2L">
                                                                    {abilityValue !== undefined && abilityValue > -1
                                                                        ? `+${abilityValue}`
                                                                        : abilityValue !== undefined ? abilityValue : 'N/A'}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    </div>
                                        
                                        {player.player_id == activePlayer &&
                                        <div className="playingBox">
                                            <div className="diceBox">
                                                <div className="diceItem">
                                                    <label className="diceLabel">DM Dice</label>
                                                    <img 
                                                        className={`dice ${rolling ? 'rolling' : ''}`} 
                                                        src={`img/d20/${d20}.png`} 
                                                        alt={`Dice shows ${d20}`} 
                                                        style={{ boxShadow: `0px 0px 20px ${boxShadowColor}` }} // Dinamik box shadow
                                                    />    
                                                </div>
                                                <div className="diceItem">
                                                    <label className="diceLabel">Player Dice</label>
                                                    <img 
                                                        className={`dice ${rolling ? 'rolling' : ''}`} 
                                                        src={`img/d20/${t20}.png`} 
                                                        alt={`Dice shows ${t20}`} 
                                                        style={{ boxShadow: `0px 0px 20px ${boxShadowColor}` }} // Dinamik box shadow
                                                    /> 
                                                </div>
                                            </div>
                                            <div className='lobiDropbox'>
                                            <FormControl variant="outlined" fullWidth>
                                                <InputLabel id="demo-simple-select-label">Select Conditions</InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    label="Select Conditions"
                                                    value={condition}
                                                    onChange={(event) => handleChange(event, player.player_id)}
                                                >
                                                    <MenuItem value="Blinded">Blinded</MenuItem>
                                                    <MenuItem value="Charmed">Charmed</MenuItem>
                                                    <MenuItem value="Frightened">Frightened</MenuItem>
                                                    <MenuItem value="Poisoned">Poisoned</MenuItem>
                                                </Select>
                                                </FormControl>
                                        </div>
                                            <div className="buttonBox">
                                                <button className="diceButton" onClick={diceRoller} disabled={rolling}>Dice Roll</button> {/* Zar dönerken buton devre dışı */}
                                                <button
                                                    className="diceButton"
                                                    key={player.user_id}
                                                    onClick={() => handleFinishClick(player.player_id)} 
                                                    >
                                                    Finish
                                                </button>
                                            </div>
                                        </div>
                                        }
                                    </button>
                                }
                                {!isDm &&
                                    <div
                                    className={`playerButton ${activePlayer === player.player_id ? 'activePlayer' : ''}`} 
                                    key={player.user_id}
                                >
                                    <div className={`playerContainer ${activePlayer === player.player_id ? '' : (activePlayer !== null ? 'dimmedCard' : '')}`}>
                                
                                    <div className="characterCard">
                                        <div className="imgFrameL">
                                            <img
                                                className="characterImg"
                                                src={avatars && avatars[player.user_id] ? avatars[player.user_id] : '/unknowch.webp'}
                                                alt={`${player.character.name}'s avatar`}
                                            />
                                        </div>
                                        <div className="cardContent">
                                            <div className="nameLabelL">
                                                <label>{player.character.name}</label>
                                            </div>
                                            <div className="raceClassL">
                                                <label className="raceLabelL rclabelL">{player.character.race}</label>
                                                <label className="classLabelL rclabelL">{player.character.class}</label>
                                            </div>
                                            <div className="abilityContentL">
                                                <div className="halfL">
                                                    {['strength', 'dexterity', 'constitution'].map((stat) => {
                                                        const abilityValue = player.character.abilitys[stat];
                                                        return (
                                                            <div className="abilityL" key={stat}>
                                                                <label className="lbl1L">{stat.charAt(0).toUpperCase() + stat.slice(1)}:</label>
                                                                <label className="lbl2L">
                                                                    {abilityValue !== undefined && abilityValue > -1
                                                                        ? `+${abilityValue}`
                                                                        : abilityValue !== undefined ? abilityValue : 'N/A'}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="halfL">
                                                    {['intelligence', 'wisdom', 'charisma'].map((stat) => {
                                                        const abilityValue = player.character.abilitys[stat];
                                                        return (
                                                            <div className="abilityL" key={stat}>
                                                                <label className="lbl1L">{stat.charAt(0).toUpperCase() + stat.slice(1)}:</label>
                                                                <label className="lbl2L">
                                                                    {abilityValue !== undefined && abilityValue > -1
                                                                        ? `+${abilityValue}`
                                                                        : abilityValue !== undefined ? abilityValue : 'N/A'}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {player.player_id != activePlayer && cid == myCharacter && cid == player.player_id &&
                                        <div className="condLabelBox">
                                            <label className="condLabel">Condition: {myCondition}</label>
                                        </div>
                                    }
                                    {player.player_id == activePlayer &&
                                        <div className="playingBox">
                                            <div className="diceBox">
                                                <div className="diceItem">
                                                <label className="diceLabel">Player Dice</label>
                                                {player.player_id == myCharacter &&
                                                     <img 
                                                     className={`dice ${rolling ? 'rolling' : ''}`} 
                                                     src={`img/d20/${p20}.png`} 
                                                     alt={`Dice shows ${p20}`} 
                                                     style={{ boxShadow: `0px 0px 20px ${boxShadowColor}` }} // Dinamik box shadow
                                                 /> 
                                                }
                                                {player.player_id != myCharacter &&
                                                     <img 
                                                     className={`dice ${rolling ? 'rolling' : ''}`} 
                                                     src={`img/d20/${t20}.png`} 
                                                     alt={`Dice shows ${t20}`} 
                                                     style={{ boxShadow: `0px 0px 20px ${boxShadowColor}` }} // Dinamik box shadow
                                                 /> 
                                                }
                                                </div>                                           
                                            </div>
                                            {player.player_id == myCharacter &&
                                                <div className="buttonBox">
                                                    <button className="diceButton" onClick={diceRollerPlayer} disabled={rolling}>Dice Roll</button> {/* Zar dönerken buton devre dışı */}
                                                </div>
                                            }
                                                
                                            
                                            
                                        </div>
                                    }
                                    </div>
                                    </div>
                                }
                            </>
                        );
                    })}
                </div>
                </div>
            
            }
        </div>
    );
       
}

export default GameRoom;

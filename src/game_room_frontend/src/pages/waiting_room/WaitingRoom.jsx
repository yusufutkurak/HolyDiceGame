
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuthClient';
import "../style/waiting_room.css"
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useLocation } from 'react-router-dom';
import { game_room_backend } from '../../../../declarations/game_room_backend';

function WaitingRoom({ ws }) {
    const { newRoomId } = useParams();
    const [usersInRoom, setUsersInRoom] = useState([]);
    const { game_roomActor } = useAuth();
    const [ ready, setReady ] = useState(false);
    const [ userId, setUserId ] = useState('');
    const [ names, setNames ] = useState();
    const [ characterId, setCharacterId ] = useState(null);
    const [ characters, setCharacters ] = useState();
    const [ charactersOther, setCharactersOther ] = useState([]);
    const [readyUser, setReadyUser] = useState({});
    const location = useLocation();
    const [ dmID, setDmID] = useState();
    const [ isDm, setIsDm ] = useState(false);
    const [avatars, setAvatars] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        console.log("characterId:", characterId, "ready:", ready, "game_roomActor:", game_roomActor);

        const fetchCharacter = async () => {
            if (game_roomActor && characterId !== null && characterId !== undefined) { 
                const selectedCharacter = await game_roomActor.get_character_by_id(characterId);
                setCharacters(selectedCharacter || []);
                console.log("Fetched character", selectedCharacter);
            }
        };
    
        if (ready && characterId !== null && characterId !== undefined) {
            fetchCharacter();
        }
    }, [characterId, ready]);
    
    useEffect(() => {
        if (ws) {
            ws.onmessage = (event) => {
                const message = event.data; 
                console.log("Message received from WebSocket:", message);
                let tempCharacter = [];
                
                switch (message.message_type) {
                    case 'user_list':
                        console.log('User List: ', message.content.UserList.users);
                        setUsersInRoom(message.content.UserList.users);
                        break;
                    case 'character_chosen':
                            if (message.content.Character.user_id === userId.toString()) {
                                break;
                            }
                            readyState(message.content.Character.user_id,message.content.Character.ready);
                            console.log("READY USER",readyUser);
                            console.log("READER",message.content.Character.user_id,message.content.Character.ready);
                            setCharactersOther(prevCharacters => {
                                // Aynı user_id'ye sahip bir kullanıcı olup olmadığını kontrol edin
                                const userExists = prevCharacters.some(character => character.user_id === message.content.Character.user_id);
                        
                                if (!userExists) {
                                    const updatedCharacters = [...prevCharacters];
                                    updatedCharacters.push(message.content.Character);
                                    return updatedCharacters;
                                }
                                // Eğer kullanıcı zaten varsa, state'i değiştirmeden geri dönün
                                return prevCharacters;
                            });
                            console.log("Güncellenmiş charactersOther", charactersOther);
                            break;
                        case 'DONT_PANIC!':
                            window.location.href = `/game/${newRoomId}`;
                            console.log("DONT PONIC",message);   
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

    }, [ws]); 

    useEffect(() => {
        const sendJoinMessage = async () => {
            getDmId();

            if (game_roomActor) {
                const user_id = await game_roomActor.whoami();
                setUserId(user_id);
                const joinMessage = {
                    message_type: "join",
                    content: {
                        Join: {
                            roomId: newRoomId,
                            user_id: user_id.toString(),
                            ready: false
                        }
                    },
                    timestamp: BigInt(Date.now()),
                };

                ws.send(joinMessage);
                console.log(`Sent join message for room ${newRoomId}:`, joinMessage);
                game_room_backend.add_room_player(user_id.toString(), newRoomId);
            }
        };

        if (ws && ws.readyState === WebSocket.OPEN) {
            console.log("WebSocket already open, sending join message immediately.");
            sendJoinMessage();
        } else if (ws) {
            ws.onopen = () => {
                console.log("WebSocket connection opened, sending join message.");
                sendJoinMessage();
            };
        }
    }, [ws]); 

    useEffect(() =>{
        if(userId.toString() == dmID){
            setIsDm(true);
        }
    },[dmID, userId, ws])


    //geçici
     useEffect(() => {
        console.log("3. EFFECT-------");
        const fetchNames = async () => {
            if (game_roomActor) { // game_roomActor'ın tanımlı olup olmadığını kontrol edin
                const fetchedNames = await game_roomActor.list_character_names();
                setNames(fetchedNames);
                console.log("names",names);
            }
        };

        fetchNames();

    }, [ws]);

    useEffect(() => {
        if (ready && characters && characters.length > 0) {
            sendCharacterInfo(); // Karakter bilgilerini gönder
        }
    }, [ready, characters]); // `ready` veya `characters` değiştiğinde çalışır
    

    useEffect(() => {
        if (charactersOther && charactersOther.length > 0) {
            charactersOther.forEach(async (character) => {
                const { character_id, user_id } = character;
                try {
                    const data = await game_roomActor.get_character_by_user_id(character_id, user_id);
                    if (data && data.length > 0) {
                        const uri = arrayBufferToBase64(data[0].avatar[0]);
                        const imageUrl = `data:image/jpeg;base64,${uri}`;
                        console.log("URLLL",imageUrl);
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
    }, [charactersOther]);
    
    
    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };
    
    
    const sendCharacterInfo = async () => {
        try {
            const selectedCharacter = characters[0];  // İlk karakteri alıyoruz
        
            // character_abilitys nesnesini {key: text, value: int} formatına dönüştürme
            const formattedAbilities = Object.entries(selectedCharacter.abilitys).map(([key, value]) => ({
                key: key,   // Burada text yerine key kullanılıyor
                value: value // Burada int yerine value kullanılıyor
            }));
            
            const chooseCharacterMessage = {
                message_type: "choose_character",
                content: {
                    Character: {
                        character_name: selectedCharacter.name,
                        abilitys: formattedAbilities,
                        character_class: selectedCharacter.classes,
                        character_race: selectedCharacter.race,
                        user_id: userId.toString(),
                        character_id: characterId,
                        ready: true
                    }
                },
                timestamp: BigInt(Date.now()), 
            };
            
            ws.send(chooseCharacterMessage);
        } catch (error) {
            console.error("Error sending character selection message:", error);
        }
    };
    
    

    const handleButtonClick = () => {
        setReady(!ready);
    };
    
    
    const getDmId = async () =>{
        const dm = await game_room_backend.get_room(newRoomId.toString());
        setDmID(dm[0].dm_id);
    }
    
   
    
    const readyState = (user, ready) => {
        setReadyUser(prevState => ({
            ...prevState,
            [user]: ready
        }));
    };
    
    const handleStartClick = async () => {
        for(let i = 0; i< charactersOther.length; i++){
            console.log("karakterlerim",charactersOther[i]);
            game_room_backend.add_room_player_character(
                {
                    user_id: charactersOther[i].user_id,
                    hp: [100], // Optional olduğu için array içinde veriyoruz
                    xp: [1000],
                    player_id: i,
                    saving: [1],
                    condition: ["Healthy"], // Optional olduğu için array içinde veriyoruz
                    character: {
                        id: charactersOther[i].character_id,
                        abilitys: {
                            dexterity: charactersOther[i].abilitys[0].value,
                            wisdom: charactersOther[i].abilitys[1].value,
                            strength: charactersOther[i].abilitys[2].value,
                            charisma: charactersOther[i].abilitys[3].value,
                            constitution: charactersOther[i].abilitys[4].value,
                            intelligence: charactersOther[i].abilitys[5].value
                        },
                        name: charactersOther[i].character_name,
                        race: charactersOther[i].character_race,
                        classes: charactersOther[i].character_class,
                        avatar: charactersOther[i].avatar ? Array.from(charactersOther[i].avatar) : [], // Optional olarak ayarlama
                    },
                },
                newRoomId // room_id'yi doğrudan string olarak gönderiyoruz
            );    
            
        }
        const startMessage = {
            message_type: "DONT_PANIC!",
            content: {
                Dont: { message: "Don't Panic!" }
            },
            timestamp: BigInt(Date.now()), 
        };
    
        console.log("Mesaj gitti", startMessage);
        ws.send(startMessage);
    }

    const handleChange = (event) => {
        const id = event.target.value;
        setCharacterId(id);
    };
    const lobiBoxStyle = {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        minWidth: "150px",
        minHeight: "150px",
        backgroundColor: "white",
        borderRadius: "10px",
        padding: "1rem",
        margin: "2rem",
        border: "solid 4px rgb(179, 248, 242)",
        boxShadow: "0px 0px 20px 0px rgb(119, 231, 201)",
        position: "relative",
        overflow: "hidden",
    };

    const backgroundStyle = {
        content: "''",
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        backgroundImage: "url('img/lobi1.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: "0.2",
        zIndex: 1,
    };

    const containerStyle = {
        display: "flex",
        flexDirection: "row",
        height: "100vh", // Tüm ekran yüksekliğini kaplar
    };

    const waitingImgFrameStyle = {
        backgroundImage: "url('img/wr2.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        boxShadow: "0px 0px 40px 0px rgb(234, 112, 37)",
        opacity: 0.9,
        width: "25%",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        backgroundColor: "#f0f0f0",
        overflow: "hidden",
        borderRight: "2px solid rgb(238, 236, 238)",
    };

    const contentStyle = {
        marginLeft: "25%", // Görselin genişliği kadar boşluk bırakır
        width: "75%", // Kalan genişliği kaplar
        display: "flex",
        flexDirection: "column",
        height: "100vh", // Yüksekliği ekran boyunca
    };



    return (
        <div className='waitingRoomContainer' style={containerStyle}>

            <div className='waitingImgFrame' style={waitingImgFrameStyle}>
            </div>

            <div className='waitingContent' style={contentStyle}>
            <label className='roomIdLabel'># Room ID: {newRoomId}</label>

            
            <div  className='lobiBox' style={lobiBoxStyle}>
            <div style={backgroundStyle}></div>
               {usersInRoom.map(user =>{
               
                console.log("asklsdds",user.user_id);

                if(user.user_id !== dmID) {
                    if(user.user_id === userId.toString() && user.user_id !== dmID) {                                         
                        return (
                            <>
                                {(() => {
                                    const myCharacter = charactersOther.find(character => character.user_id === userId.toString());
                                    const userlen = usersInRoom.length-2;
                                    const selectlen = charactersOther.length;
                                    const unknow = userlen-selectlen;
                                    const unknowElements = [];
                                    const unknowElements2 = [];

                                    console.log("Karakterim benim", myCharacter);    

                                    for (let i = 0; i < unknow; i++) {
                                        unknowElements.push(
                                            <div className='lobiUser'>
                                                <div className='lobiUserContent'>
                                                    <div className="characterCarduk">
                                                        <img className="characterImgL" src="img/unknowch.webp" alt="Unknown character"/>
                                                    </div>    
                                                    <div className={readyUser[user.user_id]  ? 'selecter' : 'notSelecter'}>
                                                        <label className='selecterLabel'>{readyUser[user.user_id] ? 'Ready!' : 'Not Ready!'}</label>
                                                    </div> 
                                                </div>
                                            </div>
                                        );
                                    }
                                    for (let i = 0; i < unknow+1; i++) {
                                        unknowElements2.push(
                                            <div className='lobiUser'>
                                                <div className='lobiUserContent'>
                                                    <div className="characterCarduk">
                                                        <img className="characterImgL" src="img/unknowch.webp" alt="Unknown character"/>
                                                    </div>    
                                                    <div className={readyUser[user.user_id]  ? 'selecter' : 'notSelecter'}>
                                                        <label className='selecterLabel'>{readyUser[user.user_id] ? 'Ready!' : 'Not Ready!'}</label>
                                                    </div> 
                                                </div>
                                                </div>
                                        );
                                    }
                                    if (myCharacter) {
                                        return (
                                            <>
                                            <div className='lobiUser'>
                                                <div className='lobiUserContent'>
                                                    <div className="characterCard">
                                                    <div className="imgFrameL">
                                                            <img
                                                                className="characterImg"
                                                                src={avatars[myCharacter.user_id]} 
                                                                alt={`${myCharacter.character_name}'s avatar`}
                                                            />
                                                       
                                                    </div>
                                                        <div className="cardContent">
                                                            <div className="nameLabelL">
                                                                <label>{myCharacter.character_name}</label>
                                                            </div>
                                                            <div className="raceClassL">
                                                                <label className="raceLabelL rclabelL">{myCharacter.character_race}</label>
                                                                <label className="classLabelL rclabelL">{myCharacter.character_class}</label>
                                                            </div>
                                                            <div className="abilityContentL">
                                                                <div className="halfL">
                                                                    {['strength', 'dexterity', 'constitution'].map((stat) => {
                                                                        const ability = myCharacter.abilitys.find(ability => ability.key === stat);
                                                                        return (
                                                                            <div className="abilityL" key={stat}>
                                                                                <label className="lbl1L">{stat.charAt(0).toUpperCase() + stat.slice(1)}:</label>
                                                                                <label className="lbl2L">
                                                                                    {ability && ability.value > -1 
                                                                                        ? `+${ability.value}` 
                                                                                        : ability ? ability.value : 'N/A'}
                                                                                </label>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <div className="halfL">
                                                                    {['intelligence', 'wisdom', 'charisma'].map((stat) => {
                                                                        const ability = myCharacter.abilitys.find(ability => ability.key === stat);
                                                                        return (
                                                                            <div className="abilityL" key={stat}>
                                                                                <label className="lbl1L">{stat.charAt(0).toUpperCase() + stat.slice(1)}:</label>
                                                                                <label className="lbl2L">
                                                                                    {ability && ability.value > -1 
                                                                                        ? `+${ability.value}` 
                                                                                        : ability ? ability.value : 'N/A'}
                                                                                </label>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='lobiDropbox'>
                                                        <FormControl variant="outlined" fullWidth>
                                                            <InputLabel id="demo-simple-select-label">Select Character</InputLabel>
                                                            <Select
                                                                labelId="demo-simple-select-label"
                                                                id="demo-simple-select"
                                                                label="Select Character"
                                                                value={characterId}
                                                                disabled={ready} // ready true ise dropbox devre dışı bırakılacak
                                                                onChange={handleChange}
                                                            >
                                                                {names && names.length > 0 ? (
                                                                    names.map((name) => (
                                                                        <MenuItem key={name.id} value={name.id}>
                                                                            {name.id} - {name.name}
                                                                        </MenuItem>
                                                                    ))
                                                                ) : (
                                                                    <MenuItem disabled>No names available</MenuItem>
                                                                )}
                                                            </Select>
                                                        </FormControl>
                                                    </div>
                                                    <div className='lobiButton'>
                                                        <button
                                                            className={ready ? 'readyButton' : 'notReadyButton'}
                                                            onClick={handleButtonClick}
                                                        >
                                                            {ready ? 'Waiting...' : 'Ready!'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            {unknowElements2}
                                            </>
                                        );
                                    } 
                                    else {
                                        return (
                                            <>
                                            <div className='lobiUser'>
                                                <div className='lobiUserContent'>
                                                    <div className="characterCarduk">
                                                        <img className="characterImgL" src="img/unknowch.webp" alt="Unknown character"/>
                                                    </div>    
                                                
                                                <div className='lobiDropbox'>
                                                    <FormControl variant="outlined" fullWidth>
                                                        <InputLabel id="demo-simple-select-label">Select Character</InputLabel>
                                                        <Select
                                                            labelId="demo-simple-select-label"
                                                            id="demo-simple-select"
                                                            label="Select Character"
                                                            value={characterId} 
                                                            disabled={ready} // ready true ise dropbox devre dışı bırakılacak
                                                            onChange={handleChange}
                                                        >
                                                            {names && names.length > 0 ? (
                                                                names.map((name) => (
                                                                    <MenuItem key={name.id} value={name.id}>
                                                                        {name.id} - {name.name}
                                                                    </MenuItem>
                                                                ))
                                                            ) : (
                                                                <MenuItem disabled>No names available</MenuItem>
                                                            )}
                                                        </Select>
                                                    </FormControl>
                                                    </div>
                                                    <div className='lobiButton'>
                                                        <button 
                                                            className={ready ? 'readyButton' : 'notReadyButton'}
                                                            onClick={handleButtonClick}
                                                        >
                                                            {ready ? 'Waiting...' : 'Ready!'}
                                                        </button>
                                                    </div>
                                                </div>
                                                </div>

                                                {unknowElements}
                                            </>    
                                        );
                                    }                             
                                })()} {/* Burada IIFE fonksiyonunu hemen çağırmayı unutmayın */}
                
                                
                            </>
                        );
                    } else {
                       //ben değilsem
                       return(
                        <div>
                            {charactersOther.map(character => {
                                if(character.user_id !== userId.toString() && userId.toString() !== dmID){
                                    return(
                                        <>
                                            <div className='lobiUser'>
                                                <div className='lobiUserContent'>
                                                    <div className="characterCard">
                                                    <div className="imgFrameL">
                                                            <img
                                                                className="characterImg"
                                                                src={avatars[character.user_id]} 
                                                                alt={`${character.character_name}'s avatar`}
                                                            />
                                                       
                                                    </div>
                                                        <div className="cardContent">
                                                            <div className="nameLabelL">
                                                                <label>{character.character_name}</label>
                                                            </div>
                                                            <div className="raceClassL">
                                                                <label className="raceLabelL rclabelL">{character.character_race}</label>
                                                                <label className="classLabelL rclabelL">{character.character_class}</label>
                                                            </div>
                                                            <div className="abilityContentL">
                                                                <div className="halfL">
                                                                    {['strength', 'dexterity', 'constitution'].map((stat) => {
                                                                        const ability = character.abilitys.find(ability => ability.key === stat);
                                                                        return (
                                                                            <div className="abilityL" key={stat}>
                                                                                <label className="lbl1L">{stat.charAt(0).toUpperCase() + stat.slice(1)}:</label>
                                                                                <label className="lbl2L">
                                                                                    {ability && ability.value > -1 
                                                                                        ? `+${ability.value}` 
                                                                                        : ability ? ability.value : 'N/A'}
                                                                                </label>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <div className="halfL">
                                                                    {['intelligence', 'wisdom', 'charisma'].map((stat) => {
                                                                        const ability = character.abilitys.find(ability => ability.key === stat);
                                                                        return (
                                                                            <div className="abilityL" key={stat}>
                                                                                <label className="lbl1L">{stat.charAt(0).toUpperCase() + stat.slice(1)}:</label>
                                                                                <label className="lbl2L">
                                                                                    {ability && ability.value > -1 
                                                                                        ? `+${ability.value}` 
                                                                                        : ability ? ability.value : 'N/A'}
                                                                                </label>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={readyUser[user.user_id]  ? 'selecter' : 'notSelecter'}>
                                                                    <label className='selecterLabel'>{readyUser[user.user_id] ? 'Ready!' : 'Not Ready!'}</label>
                                                                </div> 
                                                </div>
                                            </div>
                                        </>
                                    )
                                }
                                
                            })} 
                        </div>
                       )
                    }
                }
               })
               
               }
                {(() => {
                    if (userId.toString() === dmID) {
                        return (
                            <>
                                {usersInRoom.map(user => {
                                    const character = charactersOther.find(character => character.user_id === user.user_id);
                                    console.log("YAZZZ", user.user_id);

                                    if(user.user_id !== dmID){
                                        if (character) {
                                            return (
                                                <>
                                                    <div className='lobiUser'>
                                                        <div className='lobiUserContent'>
                                                            <div className="characterCard">
                                                            <div className="imgFrameL">
                                                                    <img
                                                                        className="characterImg"
                                                                        src={avatars[character.user_id]} 
                                                                        alt={`${character.character_name}'s avatar`}
                                                                    />
                                                            
                                                            </div>
                                                                <div className="cardContent">
                                                                    <div className="nameLabelL">
                                                                        <label>{character.character_name}</label>
                                                                    </div>
                                                                    <div className="raceClassL">
                                                                        <label className="raceLabelL rclabelL">{character.character_race}</label>
                                                                        <label className="classLabelL rclabelL">{character.character_class}</label>
                                                                    </div>
                                                                    <div className="abilityContentL">
                                                                        <div className="halfL">
                                                                            {['strength', 'dexterity', 'constitution'].map((stat) => {
                                                                                const ability = character.abilitys.find(ability => ability.key === stat);
                                                                                return (
                                                                                    <div className="abilityL" key={stat}>
                                                                                        <label className="lbl1L">{stat.charAt(0).toUpperCase() + stat.slice(1)}:</label>
                                                                                        <label className="lbl2L">
                                                                                            {ability && ability.value > -1 
                                                                                                ? `+${ability.value}` 
                                                                                                : ability ? ability.value : 'N/A'}
                                                                                        </label>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                        <div className="halfL">
                                                                            {['intelligence', 'wisdom', 'charisma'].map((stat) => {
                                                                                const ability = character.abilitys.find(ability => ability.key === stat);
                                                                                return (
                                                                                    <div className="abilityL" key={stat}>
                                                                                        <label className="lbl1L">{stat.charAt(0).toUpperCase() + stat.slice(1)}:</label>
                                                                                        <label className="lbl2L">
                                                                                            {ability && ability.value > -1 
                                                                                                ? `+${ability.value}` 
                                                                                                : ability ? ability.value : 'N/A'}
                                                                                        </label>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                                <div className={readyUser[user.user_id]  ? 'selecter' : 'notSelecter'}>
                                                                    <label className='selecterLabel'>{readyUser[user.user_id] ? 'Ready!' : 'Not Ready!'}</label>
                                                                </div> 
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        } else {
                                            return (
                                                <>
                                                <div className='lobiUser'>
                                                <div className='lobiUserContent'>
                                                    <div className="characterCarduk">
                                                        <img className="characterImgL" src="img/unknowch.webp" alt="Unknown character"/>
                                                    </div>
                                                    <div className={readyUser[user.user_id]  ? 'selecter' : 'notSelecter'}>
                                                        <label className='selecterLabel'>{readyUser[user.user_id] ? 'Ready!' : 'Not Ready!'}</label>
                                                    </div> 
                                                
                                                </div>
                                                </div>
                                                </>
                                            );
                                        } 
                                    }
                                })}
                            </>
                        );
                    }
                    // Eğer koşul sağlanmıyorsa hiçbir şey döndürmez
                    return null;
                })()}

               
            </div>

            {isDm && 
                <div className='waitingDm'>
                        <button className='readyButton' onClick={handleStartClick}>
                        START
                        </button>
                </div>
            }
            </div>
        </div>
    );
}

export default WaitingRoom;

//     const newReadyState = !ready;
//     setReady(newReadyState);

//     if (newReadyState && characters && characters.length > 0) {
//         try {
//             const selectedCharacter = characters[0];  // İlk karakteri alıyoruz
    
//             // character_abilitys nesnesini {key: text, value: int} formatına dönüştürme
//             const formattedAbilities = Object.entries(selectedCharacter.abilitys).map(([key, value]) => ({
//                 key: key,   // Burada text yerine key kullanılıyor
//                 value: value // Burada int yerine value kullanılıyor
//             }));
            
//             const chooseCharacterMessage = {
//                 message_type: "choose_character",
//                 content: {
//                     Character: {
//                         character_name: selectedCharacter.name,
//                         abilitys: formattedAbilities,
//                         character_class: selectedCharacter.classes,
//                         character_race: selectedCharacter.race,
//                         user_id: userId.toString(),
//                         character_id: characterId,
//                         ready: true
//                     }
//                 },
//                 timestamp: BigInt(Date.now()), 
//             };
            
//             ws.send(chooseCharacterMessage);
//         } catch (error) {
//             console.error("Error sending character selection message:", error);
//         }
//     }
// };
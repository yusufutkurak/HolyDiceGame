import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { game_room_backend } from "../../../../declarations/game_room_backend";
import { useAuth } from "../auth/useAuthClient";
import "../style/game_room.css";

function GameRoom({ ws }) {
    const { newRoomId } = useParams();
    const [roomData, setRoomData] = useState(null);
    const [userId, setUserId] = useState('');
    const [isDm, setIsDm] = useState(false);
    const [messages, setMessages] = useState([]); // Son 5 mesajı saklamak için
    const [characters, setCharacters] = useState(); // Son 5 mesajı saklamak için
    const [message, setMessage] = useState('');
    const [colorNumber, setColorNumber] = useState (null);
    const [chatName, setChatName] = useState ('');
    const [isPlaying, setIsPlaying] = useState(false); // Müzik oynuyor mu?
    const [volume, setVolume] = useState(0.5); // Ses seviyesi (0.0 - 1.0)
    const [imageNumber, setImageNumber] = useState(1); // Başlangıçta gp1
    const [dmImgNumber, setDmImgNumber] = useState(1); // Başlangıçta gp1
    const [musicDmNumber, setMusicDmNumber] = useState(1); 
    const [text, setText] = useState(''); // Anlık metin
    const [debouncedText, setDebouncedText] = useState(''); // Debounced metin
    const { game_roomActor } = useAuth();
    const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);
    const [isAudioActive, setIsAudioActive] = useState(false);
    const localStreamRef = useRef(null);
    const backgroundRef = useRef(null);
    const audioRef = useRef(new Audio()); // Audio referansı
    const isPlayingRef = useRef(isPlaying);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [avatars, setAvatars] = useState();

    const musicList = [
        "angry",
        "adventure",
        "oldschool",
        "beach",
        "europe",
        "festival",
        "good night",
        "beware",
        "thriller",
        "ottoman",
        "dramatic",
        "holiday",
        "love1"
    ];

    const colorMap = {
        1: '#FF5733', 2: '#33FF57', 3: '#3357FF', 4: '#FF33A8',
        5: '#A833FF', 6: '#33FFF2', 7: '#FF8C33', 8: '#57FF33',
        9: '#8C33FF', 10: '#33A8FF'
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const room = await game_room_backend.get_room(newRoomId.toString());
                console.log("📡 Oda Bilgisi:", room);
                setRoomData(room[0]);
                setCharacters(room[0].characters[0])
                if (game_roomActor) {
                    const user_id = await game_roomActor.whoami();
                    setUserId(user_id.toString());
                }
            } catch (error) {
                console.error("❌ Oda verisi çekilirken hata oluştu:", error);
            }
        };
        fetchData();
    }, [newRoomId, game_roomActor]);

    useEffect(() =>{
        if(userId && roomData){
            console.log("dmId", roomData.dm_id);
            if(userId.toString() == roomData.dm_id){
                setIsDm(true);
            }
        }
    }, [userId, roomData])

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        if (characters && characters.length > 0) {
            characters.forEach(async (player) => {
                const character_id = player.character.id;
                const user_id = player.user_id;
                console.log("Avatar calıstı", character_id, user_id);
                try {
                    const data = await game_roomActor.get_character_by_user_id(character_id, user_id);
                    if (data && data.length > 0) {
                        const uri = arrayBufferToBase64(data[0].avatar[0]);
                        const imageUrl = `data:image/jpeg;base64,${uri}`;

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
    },[characters]);


    const setIsPlayingAsync = (value) => {
        return new Promise((resolve) => {
            setIsPlaying(value);
            setTimeout(() => {
                isPlayingRef.current = value; // Referansı hemen güncelle
                resolve();
            }, 0);
        });
    };

    useEffect(() => {
        if (ws) {
            ws.onmessage = (event) => {
                const message = event.data; 
                console.log("Message received from WebSocket:", message);

                switch (message.message_type) {
                    case 'Chat':
                        if (message.content?.Chat?.name && message.content?.Chat?.message && message.content?.Chat?.color) {
                            const newMessage = {
                                name: message.content.Chat.name,
                                message: message.content.Chat.message,
                                color: colorMap[Number(message.content.Chat.color)] || '#000000'
                            };
                            console.log("DONT PONIC", newMessage);   
                            addMessage(newMessage);
                        }
                        break;

                    case 'Background': 
                        console.log("Background", message.content.Background.message);
                        setImageNumber(message.content.Background.message);
                        break;

                    case 'DmNote':
                        if (!isDm) {
                            console.log("Dm note", message.content.DmNote.message);
                            setText(message.content.DmNote.message);
                        }
                        break;

                    case 'Play':

                        const incomingMusicNumber = message.content.Play.music;

                        console.log("Play", isPlayingRef.current,incomingMusicNumber.toString() , musicDmNumber?.toString() );

                    
                        // Müzik zaten oynuyorsa ve aynı müzikse bir işlem yapma
                        if (isPlayingRef.current && incomingMusicNumber.toString() === musicDmNumber?.toString()) {
                            console.log("Müzik zaten çalıyor, tekrar başlatılmadı.");
                            break;
                        }

                        // Yeni müzik başlat
                        if (!isPlayingRef.current || incomingMusicNumber.toString() !== musicDmNumber?.toString()) {
                            console.log("Yeni müzik başlatılıyor:", incomingMusicNumber, musicDmNumber);

                            setMusicDmNumber(incomingMusicNumber); // Müzik numarasını güncelle

                            setIsPlayingAsync(true)
                                .then(() => {
                                    audioRef.current.src = `/music/${musicList[incomingMusicNumber - 1]}.mp3`;
                                    return audioRef.current.play();
                                })
                                .then(() => {
                                    console.log("Müzik başarıyla başlatıldı ve oynatılıyor.");
                                })
                                .catch((error) => {
                                    console.error("Müzik numarası güncellenirken hata oluştu:", error);
                                });
                        }
                        break;

                    case 'Stop':
                        console.log("Müzik durduruldu.");
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                        setIsPlayingAsync(false).then(() => {
                            console.log("Müzik tamamen durduruldu.");
                        });
                        break;
                }
            };

            ws.onclose = () => {
                console.log("WebSocket connection closed");
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        }
    }, [ws, musicDmNumber]);


    useEffect(() => {
        const sendJoinMessage = async () => {
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
                if(colorNumber == null){
                }
            };
        }
    }, [ws]);

    const toggleMicrophone = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMicrophoneOn(prevState => !prevState);
        }
    };

    const joinAudio = async () => {
        if (!isAudioActive) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = stream;
                console.log("🎤 Mikrofon erişimi başarılı!");
                setIsAudioActive(true);
            } catch (error) {
                console.error("❌ Mikrofon erişim hatası:", error);
            }
        }
    };

/////////////////////////////////////////////
///////////////
///////////////
/////////////////////////////////////////////

     // 🔄 Mevcut Müziği Güncelle
     useEffect(() => {
            console.log("Girdi", isPlaying);

            const currentMusic = `/music/${musicList[musicDmNumber - 1]}.mp3`;
            audioRef.current.src = currentMusic;
            audioRef.current.volume = volume;

            if (isPlaying) {
                audioRef.current.play();
                console.log("Müzik başarıyla oynatıldı.");
            }

            if (ws && isPlaying) {
                const startMessage = {
                    message_type: "Play",
                    content: {
                        Play: {
                            music: musicDmNumber.toString(),
                        },
                    },
                    timestamp: BigInt(Date.now()),
                };
                console.log("Mesaj gitti", startMessage);
                ws.send(startMessage);
            }

     }, [musicDmNumber, isPlaying]);
    

    // ▶️ Müzik Çal
    const handlePlayClick = () => {
        audioRef.current.play();
        setIsPlaying(true);
    };

    // ⏹️ Müzik Durdur
    const handleStopClick = async () => {
        try {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);

            await new Promise((resolve) => setTimeout(resolve, 0)); // State güncellemesini bekle
    
            if (ws) {
                const stopMessage = {
                    message_type: "Stop",
                    content: {
                        Stop: { 
                            message: "stop",
                        }
                    },
                    timestamp: BigInt(Date.now()), 
                }; 
                console.log("Mesaj gitti", stopMessage);
                ws.send(stopMessage);
            }
        } catch (error) {
            console.error("Müzik durdurma sırasında hata oluştu:", error);
        }
    };
    
    const addMessage = (newMessage) => {
        setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, newMessage];
            return updatedMessages.slice(-11); // Sadece son 5 mesajı tut
        });
    };

    const sendMessage = async () => {
        console.log("colorNumberr",colorNumber);
        if(colorNumber == null ){
            const color = await randomColor();

            if (message.trim() !== '') {
                console.log('Gönderilen Mesaj:', message);
                setMessage(''); 
                const startMessage = {
                    message_type: "Chat",
                    content: {
                        Chat: { 
                            message: message,
                            color: color.toString(), 
                            name: chatName,
                        }
                    },
                    timestamp: BigInt(Date.now()), 
                }; 
                console.log("Mesaj gitti", startMessage);
                ws.send(startMessage);
            }
        }else{
            if (message.trim() !== '') {
                console.log('Gönderilen Mesaj:', message);
                setMessage(''); 
                const startMessage = {
                    message_type: "Chat",
                    content: {
                        Chat: { 
                            message: message,
                            color: colorNumber.toString(), 
                            name: chatName,
                        }
                    },
                    timestamp: BigInt(Date.now()), 
                };
                console.log("Mesaj gitti", startMessage);
                ws.send(startMessage);
            }
        }
    };

    const changeName = async (newName) => {
        setChatName(newName);
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const randomColor = () => {
        return new Promise((resolve) => {
            const userColor = Math.floor(Math.random() * 10) + 1;
            console.log("userColor", userColor);
            setColorNumber(userColor); // state güncellenir
            resolve(userColor); // Renk değeri geri döner
        });
    };

    const handlesNextBg = () => {
        setDmImgNumber((prev) => (prev % 6) + 1);
    }

    const handleBackBg = () => {
        setDmImgNumber((prev) => (prev === 1 ? 6 : prev - 1));
    };    

    const setMusicDmNumberAsync = (newNumber) => {
        return new Promise((resolve) => {
            setMusicDmNumber((prev) => {
                resolve(newNumber); // State güncellemesi tamamlandığında resolve çağrılır
                return newNumber;
            });
        });
    };
    const handlesNextMs = async () => {
        if (isButtonDisabled) return; // Zaten devre dışıysa işlem yapma
    
        try {
            setIsButtonDisabled(true); // Butonu devre dışı bırak
            setMusicDmNumber((prev) => (prev % musicList.length) + 1);
            await new Promise((resolve) => setTimeout(resolve, 4000)); // 1250ms bekleme süresi
        } catch (error) {
            console.error("Sonraki müziğe geçerken hata oluştu:", error);
        } finally {
            setIsButtonDisabled(false); // Bekleme süresi sonunda butonu yeniden etkinleştir
        }
    };

    const getAvatar = () =>{}
    
    // Uint8Array'i Base64 string'e çeviren fonksiyon
    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };
    

    // Önceki Müzik
    const handleBackMs = async () => {
        if (isButtonDisabled) return; // Zaten devre dışıysa işlem yapma
    
        try {
            setIsButtonDisabled(true); // Butonu devre dışı bırak
            setMusicDmNumber((prev) => (prev === 1 ? musicList.length : prev - 1));
            await new Promise((resolve) => setTimeout(resolve, 4000)); // 250ms bekleme süresi
        } catch (error) {
            console.error("Önceki müziğe geçerken hata oluştu:", error);
        } finally {
            setIsButtonDisabled(false); // Bekleme süresi sonunda butonu yeniden etkinleştir
        }
    };
    
    const handleBackgroudnClick = () => {
        const startMessage = {
            message_type: "Background",
            content: {
                Background: { 
                    message: dmImgNumber.toString(),
                }
            },
            timestamp: BigInt(Date.now()), 
        }; 
        console.log("Mesaj gitti", startMessage);
        ws.send(startMessage);
    };
    
    useEffect(() => {
        if (backgroundRef.current) {
            backgroundRef.current.style.backgroundImage = `url('img/gp/gp${imageNumber}.webp')`;
        }
    }, [imageNumber]);

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId); // Önceki zamanlayıcıyı temizle
            timeoutId = setTimeout(() => func(...args), delay); // Belirtilen süre sonunda çalıştır
        };
    };

        
        useEffect(() => {
            if (debouncedText) {
                console.log('📝 Güncellenmiş metin sunucuya gönderiliyor:', debouncedText);
                const startMessage = {
                    message_type: "DmNote",
                    content: {
                        DmNote: { 
                            message: debouncedText,
                        }
                    },
                    timestamp: BigInt(Date.now()), 
                }; 
                console.log("Mesaj gitti", startMessage);
                ws.send(startMessage);
            }
        }, [debouncedText]);

        // ✅ Debounce edilmiş arrow function
        const handleTextChange = debounce((value) => {
            setDebouncedText(value);
        }, 500); // 500ms bekleme süresi

        // ✅ Textarea'da her değişim
        const handleChange = (e) => {
            setText(e.target.value); // Anlık state güncelle
            handleTextChange(e.target.value); // Debounce edilmiş güncelleme
        };
    
    return (
        <div className="game-room-container" ref={backgroundRef}>

        <div className="game-room-content">
            <h1>Oda: {newRoomId}</h1>

            

            <div className="game-zone">
            {characters?.length > 0 ? (
                <div className="allCharacterNft">
                    {characters.map((character, index) => {
                        // Yetenekleri kontrol et ve yedek değerler kullan
                        const abilities = character.character.abilitys || {
                            strength: 'N/A',
                            intelligence: 'N/A',
                            wisdom: 'N/A',
                            charisma: 'N/A',
                            constitution: 'N/A',
                            dexterity: 'N/A'
                        };

                        return (
                            <div className="nftCardGame" key={index}>
                                {/* Avatar Görseli */}
                                <div className="imgFrameGame">
                                    {character ? (
                                        <img
                                            className="characterImgGame"
                                            src={avatars && avatars[character.user_id] ? avatars[character.user_id] : '/unknowch.webp'}
                                            alt={`${character.character.name}'s avatar`}
                                        />
                                    ) : (
                                        <div>No Avatar</div>
                                    )}
                                </div>

                                {/* Karakter Bilgileri */}
                                <div className="nftCardStats">
                                    <div className="tripleContainer">
                                        <div className="labelTop">Name: {character.character?.name || 'Unknown'}</div>
                                        <div className="labelTop">Race: {character.character?.race || 'Unknown'}</div>
                                        <div className="labelTop">Class: {character.character?.classes || 'Unknown'}</div>
                                    </div>
                                    
                                    <div className="tripleContainer">
                                        <div className="statLabel">Strength: {abilities.strength}</div>
                                        <div className="statLabel">Intelligence: {abilities.intelligence}</div>
                                        <div className="statLabel">Wisdom: {abilities.wisdom}</div>
                                    </div>

                                    <div className="tripleContainer">
                                        <div className="statLabel">Charisma: {abilities.charisma}</div>
                                        <div className="statLabel">Constitution: {abilities.constitution}</div>
                                        <div className="statLabel">Dexterity: {abilities.dexterity}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p>No characters found.</p>
            )}
            </div>
            
            <div className="chatBox">
                <div className="textContentBox">
                <div className="audio-controls">
                    <div className="audioButtons">
                    <button className="connectMicButton" onClick={joinAudio} disabled={isAudioActive}>
                                {isAudioActive ? "Connected" : "Join Voice Chat"}
                            </button>
                            
                            <button className="micButton" onClick={toggleMicrophone} >
                                {isMicrophoneOn ? (
                                    <>
                                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M192 448h128m64-240v32c0 70.4-57.6 128-128 128h0c-70.4 0-128-57.6-128-128v-32m128 160v80"></path><path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 64a63.68 63.68 0 0 0-64 64v111c0 35.2 29 65 64 65s64-29 64-65V128c0-36-28-64-64-64z"></path></svg>
                                    </>
                                ) : (
                                    <>
                                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M432 400 96 64"></path><path d="M400 240v-31.55c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 368 208v32a111.58 111.58 0 0 1-2.45 23.31 4.05 4.05 0 0 0 1.07 3.69l21.82 21.81a2 2 0 0 0 3.29-.72A143.27 143.27 0 0 0 400 240zM256 352a112.36 112.36 0 0 1-112-112v-31.55c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 112 208v32c0 74 56.1 135.12 128 143.11V432h-47.55c-8.61 0-16 6.62-16.43 15.23A16 16 0 0 0 192 464h127.55c8.61 0 16-6.62 16.43-15.23A16 16 0 0 0 320 432h-48v-48.89a143.08 143.08 0 0 0 52-16.22 4 4 0 0 0 .91-6.35L307 342.63a4 4 0 0 0-4.51-.78A110.78 110.78 0 0 1 256 352zm0-272a47.18 47.18 0 0 1 48 48v74.72a4 4 0 0 0 1.17 2.82L332.59 233a2 2 0 0 0 3.41-1.42V128.91C336 85 301 48.6 257.14 48a79.66 79.66 0 0 0-68.47 36.57 4 4 0 0 0 .54 5l19.54 19.54a2 2 0 0 0 3.25-.63A47.44 47.44 0 0 1 256 80z"></path><path d="M207.27 242.9 179.41 215a2 2 0 0 0-3.41 1.42V239a80.89 80.89 0 0 0 23.45 56.9 78.55 78.55 0 0 0 77.8 21.19 2 2 0 0 0 .86-3.35l-24.91-24.91a4.08 4.08 0 0 0-2.42-1.15c-21.65-2.52-39.48-20.44-42.37-42.43a4 4 0 0 0-1.14-2.35z"></path></svg>
                                    </>
                                )}
                            </button>
                    </div>    
                </div>
                    <div className="chat-messages">
                            <ul>
                                {messages.map((msg, index) => (
                                    <li key={index}>
                                        <strong style={{ color: msg.color }}>{msg.name}:</strong> {msg.message}
                                    </li>
                                ))}
                            </ul>
                        <div className="chat-input">
                            <input 
                                className="name-input"
                                type="text" 
                                value={chatName} 
                                onChange={(e) => setChatName(e.target.value)} 
                                onKeyDown={handleKeyPress}
                                placeholder="Nick"
                            />
                            <input
                                className="message-input"
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Chat..."
                            />
                            <button onClick={sendMessage} className="sendButton">
                            <svg stroke="currentColor" fill="white" stroke-width="0" viewBox="0 0 512 512" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg"><path d="M48 448l416-192L48 64v149.333L346 256 48 298.667z"></path></svg>                        
                            </button>
                        </div>
                    </div>  

                    <div className="dmStoryBox">
                        <label className="dmLabel">DM Notes</label>
                        <textarea
                            className="dmTextArea"
                            name="story"
                            placeholder="Write your story..."
                            value={text}
                            onChange={handleChange}
                            readOnly={!isDm} 
                        />
                    </div>

                    <div className="dmSettingsBox">
                        <div className="bgSet">
                            <button className="bgButton" onClick={handleBackBg}><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M217.9 256L345 129c9.4-9.4 9.4-24.6 0-33.9-9.4-9.4-24.6-9.3-34 0L167 239c-9.1 9.1-9.3 23.7-.7 33.1L310.9 417c4.7 4.7 10.9 7 17 7s12.3-2.3 17-7c9.4-9.4 9.4-24.6 0-33.9L217.9 256z"></path></svg></button>
                            <div className="miniBg">
                                    <img src={`img/gp/gp${dmImgNumber}.webp`} className="miniBgImg"/>
                            </div>
                            <button className="bgButton" onClick={handlesNextBg}><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg></button>
                        </div>

                        <button className="setButton" onClick={handleBackgroudnClick}>Change background</button>

                        <div className="musicSet">
                        <button 
                            className="bgButton" 
                            onClick={handleBackMs} 
                            disabled={isButtonDisabled}
                        ><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M217.9 256L345 129c9.4-9.4 9.4-24.6 0-33.9-9.4-9.4-24.6-9.3-34 0L167 239c-9.1 9.1-9.3 23.7-.7 33.1L310.9 417c4.7 4.7 10.9 7 17 7s12.3-2.3 17-7c9.4-9.4 9.4-24.6 0-33.9L217.9 256z"></path></svg></button>
                                <div className="miniMusic">
                                    <label className="musicLabel">
                                        {musicDmNumber}. {musicList[musicDmNumber - 1]}
                                    </label>                                
                                </div>
                            <button className="bgButton" onClick={handlesNextMs} disabled={isButtonDisabled}><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg></button>
                        </div>
                        <div className="musicButtonBox">
                            <button className="setButton" onClick={handlePlayClick}>Play music</button>
                            <button className="setButton" onClick={handleStopClick}>Stop</button>
                        </div>
                    </div>
                </div>
                
            </div>
            
        </div>
    </div>
    );
}

export default GameRoom;

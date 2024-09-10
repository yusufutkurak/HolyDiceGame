import React, { useState, useEffect } from 'react';
import IcWebSocket, { createWsConfig, generateRandomIdentity } from "ic-websocket-js";
import { game_room_backend, canisterId } from '../../declarations/game_room_backend';
import { Routes, Route } from 'react-router-dom';
import CreateGame from './pages/create_game/CreateGame';
import Home from './pages/Home';
import Header from './components/Header';
import Authentication from './pages/auth/Authentication';
import { AuthProvider } from './pages/auth/useAuthClient';
import UserProfile from './pages/user_profile/UserProfile';
import WaitingRoom from './pages/waiting_room/WaitingRoom';
import CreateCharacter from './pages/create_character/CreateCharacter';
import MyCharacter from './pages/my_characters/MyCharacter';
import Footer from './components/Footer';
import { Ed25519KeyIdentity } from "@dfinity/identity";
import JoinGame from './pages/join_game/JoinGame';
import GameRoom from './pages/game_room/GameRoom';

const identity = Ed25519KeyIdentity.generate();

function App() {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Önceki bağlantıyı kapat
    if (ws) {
      ws.close();
    }

    const wsConfig = createWsConfig({
      canisterId: canisterId,
      canisterActor: game_room_backend,
      identity: identity,
      networkUrl:  "http://127.0.0.1:4943",
    });

    const socket = new IcWebSocket("ws://127.0.0.1:8080", undefined, wsConfig);

    socket.onopen = () => {
      console.log("IC WebSocket connection opened");
      setWs(socket);
    };

    socket.onclose = function(event) {
      console.log("WebSocket Closed: ");
      console.log("Code: " + event.code);
      console.log("Reason: " + event.reason);
      console.log("Was Clean: " + event.wasClean);
    };

    socket.onerror = (error) => {
      console.error("IC WebSocket error:", error);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [canisterId, game_room_backend]); // Dependency array güncellendi

  return (
    <AuthProvider>
     <Header/>

      <Routes>
        <Route path='/' element={<Home ws={ws}/>}/>
        <Route path='/creategame' element={<CreateGame />}/>
        <Route path='/auth' element={<Authentication />}/>
        <Route path='/profile' element={<UserProfile />}/>
        <Route path='/room/:newRoomId' element={<WaitingRoom ws={ws}/>}/>
        <Route path='/game/:newRoomId' element={<GameRoom ws={ws}/>}/>
        <Route path='/create-character' element={<CreateCharacter />}/>
        <Route path='/my-characters' element={<MyCharacter />}/>
        <Route path='/join-game' element={<JoinGame/>}/>
      </Routes>
      <Footer/>
    </AuthProvider>
  );
}

export default App;

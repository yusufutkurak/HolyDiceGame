import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../pages/auth/useAuthClient';
import { game_room_backend } from '../../../declarations/game_room_backend';

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const handleClick = () => {
    logout();
  };

  const [roomID, setRoomID] = useState('');
  const [dmID, setDmID] = useState('');
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();
  const { game_roomActor } = useAuth();

  const handleAddRoom = async (event) => {
    event.preventDefault();

    const newRoomId = Math.floor(Math.random() * 999).toString();
    setRoomID(newRoomId);

    const dm_id = await game_roomActor.whoami();
    const dm_id_str = dm_id.toString();
    setDmID(dm_id_str);

    await game_room_backend.add_room(newRoomId, dm_id_str, players);
    window.location.href = `/room/${newRoomId}`;

    setDropdownOpen(false); // Dropdown'u kapat
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        Holy Dice
      </div>
      <div className="navbar-links">
        <Link id="home-link" to="/">Home</Link>
        {isAuthenticated ? (
          <>
            <div className="dropdown" onClick={toggleDropdown}>
              <span className="dropbtn">Create <i className="arrow-down"></i></span>
              <div className={`dropdown-content ${dropdownOpen ? 'show' : ''}`}>
                <Link className="nav-link" onClick={handleAddRoom}>Create Game</Link>
                <Link className="nav-link" to="/create-character" onClick={() => setDropdownOpen(false)}>Create Character</Link>
              </div>
            </div>
            <Link className="nav-link" to="/join-game">Join Game</Link>
            <Link className="nav-link" to="/nft">Nft</Link>
            <Link className="nav-link" to="/my-characters">My Characters</Link>
            <Link className="nav-link" to="/profile">Profile</Link>
            <Link className="nav-link" to="/auth" onClick={handleClick}>Log Out</Link>
          </>
        ) : (
          <Link className="nav-link" to="/auth">Sign In</Link>
        )}
      </div>
    </nav>
  );
}

export default Header;

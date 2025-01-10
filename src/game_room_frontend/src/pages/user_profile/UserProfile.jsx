import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuthClient';
import '../style/profile.css';

function UserProfile() {
    const [result, setResult] = useState("");
    const [username, setUsername] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const { game_roomActor, isAuthenticated } = useAuth();
    const backgroundStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: "url('img/Banner6.webp')", // Arka plan resmi
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: -1, // Arka planda kalmasını sağlar
    };

    useEffect(() => {
        const fetchIdentity = async () => {
            if (isAuthenticated && game_roomActor) {
                try {
                    const response = await game_roomActor.whoami();
                    setResult(response.toString());

                    const exist = await game_roomActor.user_control(response.toString());
                    if (!exist) {
                        await game_roomActor.create_user(response.toString());
                    }

                    const usernameResponse = await game_roomActor.get_username(response.toString());
                    setUsername(usernameResponse.toString());
                } catch (error) {
                    console.error("Failed to fetch identity or username:", error);
                }
            }
        };
        fetchIdentity();
    }, [game_roomActor, isAuthenticated]);

    const handleChange = (event) => {
        setUsername(event.target.value);
    };

    const handleClick = async (event) => {
        event.preventDefault();
        try {
            await game_roomActor.update_user(result, username);
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    };

    return (
        <div className="user-profile">
            <div className="user-profile__background" style={backgroundStyle}></div>

            <form className="user-profile__form">
                <label className="user-profile__label">
                    UserId: 
                    <input 
                        type="text" 
                        value={isAuthenticated ? result : ""} 
                        readOnly 
                        className="user-profile__input"
                    />
                </label>
                <label className="user-profile__label">
                    UserName: 
                    <input 
                        type="text" 
                        value={username} 
                        onChange={handleChange} 
                        className="user-profile__input"
                    />
                </label>
                <button type="submit" onClick={handleClick} className="user-profile__button">Update</button>
            </form>

        </div>
    );
}

export default UserProfile;

import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuthClient";
import '../style/mycharacter.css';

function MyCharacter() {
    const [characters, setCharacters] = useState(null);  // Başlangıçta null
    const { game_roomActor } = useAuth();

    const getCharacters = async () => {
        if (game_roomActor) {
            const count = await game_roomActor.count_characters();
            console.log("Character Count:", count);

            const loadedCharacters = [];
            if (count !== 0) {
                for (let i = 0; i < count; i++) {
                    const tempCharacter = await game_roomActor.get_character_by_id(i);
                    if (tempCharacter) {
                        loadedCharacters.push(tempCharacter);
                    }
                }
            }
            console.log("Loaded Characters:", loadedCharacters);
            setCharacters(loadedCharacters.flat());  // Düzleştirilmiş dizi
        }
    };

    useEffect(() => {
        if (game_roomActor) {
            getCharacters();
        }
    }, [game_roomActor]);

    useEffect(() => {
        console.log("Characters updated:", characters);
    }, [characters]);

    // Uint8Array'i Base64 string'e çeviren fonksiyon
    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return `data:image/jpeg;base64,${window.btoa(binary)}`;

    }

    const backgroundStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1, // Arka planda kalmasını sağlar
        backgroundImage: `
            linear-gradient(135deg, rgba(255, 0, 0, 0.5), rgba(64, 0, 255, 0.5), rgba(0, 255, 85, 0.5)), 
            url('img/navbar-4.jpg')
        `,
        backgroundSize: "cover", // Resmi tüm alana yayar
        backgroundPosition: "center", // Resmi ortalar
        backgroundRepeat: "no-repeat", // Resmin tekrar etmesini engeller
        opacity: 0.2, // Arka planın opaklığını ayarlar
    };
    // Render kontrolü
    if (characters === null) {
        return(
            
            <div className="loading-container">
                <div className="characters">
                    <div className="background-2">
                </div>
                </div>
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        ) // Eğer characters null ise, yüklenme mesajı gösterilir
    }

    return (
        <div className="characters">
            <div className="background-2" style={backgroundStyle}>
            </div>


            <div className="characterList">
                {characters.length > 0 ? (
                    <div className="allCharacter">
                        {characters.map((character, index) => {
                            const avatarUrl = character.avatar && character.avatar.length > 0
                            ? arrayBufferToBase64(character.avatar[0])
                            : null;

                            const abilities = character.abilitys || {};

                            return (
                                <div className="characterCard" key={index}>
                                    <div className="imgFrame">
                                        {avatarUrl ? (
                                            <img className="characterImg" src={avatarUrl} alt={`${character.name}'s avatar`} />
                                        ) : (
                                            <div>No Avatar</div>
                                        )}
                                    </div>

                                    <div className="cardContent">
                                        <div className="nameLabel">
                                            <label>{character.name}</label>
                                        </div>
                                        <div className="raceClass">
                                            <label className="raceLabel rclabel">{character.race}</label>
                                            <label className="classLabel rclabel">{character.classes}</label>
                                        </div>
                                        <div className="abilityContent">
                                            <div className="half">
                                                <div className="ability">
                                                    <label className="lbl1">Strength:</label>
                                                    <label className="lbl2">{abilities.strength > -1 ? `+${abilities.strength}` : abilities.strength}</label>
                                                </div>
                                                <div className="ability">
                                                    <label className="lbl1">Dexterity:</label>
                                                    <label className="lbl2">{abilities.dexterity > -1 ? `+${abilities.dexterity}` : abilities.dexterity}</label>
                                                </div>
                                                <div className="ability">
                                                    <label className="lbl1">Constitution:</label>
                                                    <label className="lbl2">{abilities.constitution > -1 ? `+${abilities.constitution}` : abilities.constitution}</label>
                                                </div>
                                            </div>
                                            <div className="half">
                                                <div className="ability">
                                                    <label className="lbl1">Intelligence:</label>
                                                    <label className="lbl2">{abilities.intelligence > -1 ? `+${abilities.intelligence}` : abilities.intelligence}</label>
                                                </div>
                                                <div className="ability">
                                                    <label className="lbl1">Wisdom:</label>
                                                    <label className="lbl2">{abilities.wisdom > -1 ? `+${abilities.wisdom}` : abilities.wisdom}</label>
                                                </div>
                                                <div className="ability">
                                                    <label className="lbl1">Charisma:</label>
                                                    <label className="lbl2">{abilities.charisma > -1 ? `+${abilities.charisma}` : abilities.charisma}</label>
                                                </div>
                                            </div>
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
        </div>
    );
}

export default MyCharacter;


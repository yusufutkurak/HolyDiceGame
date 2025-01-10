import React from "react";

const RaceSelectionButton = ({activeButton, handleSelectRace, handlePrevClass, handleButtonClick, handleRaceClick}) => {
    return(
        <div className="item">
                        <button 
                            className={activeButton === "dragonborn" ? "itemButtonActive" : "itemButton" } 
                            onClick={handleSelectRace}
                            value={"dragonborn"}>
                            <div className="buttonImgContainer">
                                <img src="img/avatars/dragonborn1.jpg" className="buttonImg" alt="Dragonborn Avatar" />
                            </div>
                            <span className="buttonText">Dragonborn</span>
                            <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                        </button>

                        <button 
                            className={activeButton === "dwarf" ? "itemButtonActive" : "itemButton" } 
                            onClick={handleSelectRace} 
                            value={"dwarf"}>
                            <div className="buttonImgContainer">
                                <img src="img/avatars/dwarf.jpg" className="buttonImg" alt="Dwarf Avatar" />
                            </div>
                            <span className="buttonText">Dwarf</span>
                            <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                        </button>

                        <button
                            className={activeButton === "elf" ? "itemButtonActive" : "itemButton" } 
                            onClick={handleSelectRace}  
                            value={"elf"}>
                            <div className="buttonImgContainer">
                                <img src="img/avatars/elf1.jpg" className="buttonImg" alt="Elf Avatar" />
                            </div>
                            <span className="buttonText">Elf</span>
                            <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                    
                        </button>

                        <button 
                            className={activeButton === "gnome" ? "itemButtonActive" : "itemButton" } 
                            onClick={handleSelectRace}
                            value={"gnome"}>
                            <div className="buttonImgContainer">
                                <img src="img/avatars/gnome.jpg" className="buttonImg" alt="Gnome Avatar" />
                            </div>
                            <span className="buttonText">Gnome</span>
                            <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                        </button>

                        <button 
                            className={activeButton === "half-elf" ? "itemButtonActive" : "itemButton" } 
                            onClick={handleSelectRace}  
                            value={"half-elf"}>
                            <div className="buttonImgContainer">
                                <img src="img/avatars/half-elf6.jpg" className="buttonImg" alt="Half-Elf Avatar" />
                            </div>
                            <span className="buttonText">Half-Elf</span>
                            <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                    
                        </button>

                        <button 
                            className={activeButton === "halfing" ? "itemButtonActive" : "itemButton" } 
                            onClick={handleSelectRace}  
                            value={"halfing"}>
                            <div className="buttonImgContainer">
                                <img src="img/avatars/halfing1.jpg" className="buttonImg" alt="Halfing Avatar" />
                            </div>
                            <span className="buttonText">Halfing</span>
                            <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                    
                        </button>

                        <button
                            className={activeButton === "half-orc" ? "itemButtonActive" : "itemButton" } 
                            onClick={handleSelectRace}  
                            value={"half-orc"}>
                            <div className="buttonImgContainer">
                                <img src="img/avatars/half-orc2.jpg" className="buttonImg" alt="Half-Orc Avatar" />
                            </div>
                            <span className="buttonText">Half-Orc</span>
                            <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                        </button>

                        <button 
                            className={activeButton === "human" ? "itemButtonActive" : "itemButton" } 
                            onClick={handleSelectRace}
                            value={"human"}>
                            <div className="buttonImgContainer">
                                <img src="img/avatars/human2.jpg" className="buttonImg" alt="Human Avatar" />
                            </div>
                            <span className="buttonText">Human</span>
                            <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                        </button>

                        <button 
                            className={activeButton === "tiefling" ? "itemButtonActive" : "itemButton" } 
                            onClick={handleSelectRace} 
                            value={"tiefling"}>
                            <div className="buttonImgContainer">
                                <img src="img/avatars/tiefling3.jpg" className="buttonImg" alt="Tiefling Avatar" />
                            </div>
                            <span className="buttonText">Tiefling</span>
                            <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                        </button>

                        <div className="pagination">
                            <button className="nextButton" onClick={handlePrevClass}>Prev Step</button>
                            <button className="nextButton" onClick={handleButtonClick}>Next Step</button>
                        </div>
                    </div>
    )
}

export default RaceSelectionButton;
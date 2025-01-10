import React from 'react';

const ClassSelectionButtons = ({ activeButton, handleSelectClass, handleClassClick }) => {
    return (
        <div className="item">
                    <button 
                        className={activeButton === "barbarian" ? "itemButtonActive" : "itemButton" } 
                        onClick={handleSelectClass} 
                        value={"barbarian"}>
                        <div className="buttonImgContainer">
                            <img src="img/avatars/barbar2.jpg" className="buttonImg" alt="Barbarian Avatar" />
                        </div>
                        <span className="buttonText">Barbarian</span>
                        <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                    </button>

                    <button 
                        className={activeButton === "bard" ? "itemButtonActive" : "itemButton" } 
                        onClick={handleSelectClass}  
                        value={"bard"}>
                        <div className="buttonImgContainer">
                            <img src="img/avatars/bard2.jpg" className="buttonImg" alt="Bard Avatar" />
                        </div>
                        <span className="buttonText">Bard</span>
                        <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                    </button>
                    
                    <button 
                        className={activeButton === "cleric" ? "itemButtonActive" : "itemButton" } 
                        onClick={handleSelectClass} 
                        value={"cleric"}>
                        <div className="buttonImgContainer">
                            <img src="img/avatars/cleric1.jpg" className="buttonImg" alt="Cleric Avatar" />
                        </div>
                        <span className="buttonText">Cleric</span>
                        <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                    </button>
                    
                    <button 
                        className={activeButton === "druid" ? "itemButtonActive" : "itemButton" } 
                        onClick={handleSelectClass} 
                        value={"druid"}>
                        <div className="buttonImgContainer">
                            <img src="img/avatars/druid5.jpg" className="buttonImg" alt="Druid Avatar" />
                        </div>
                        <span className="buttonText">Druid</span>
                        <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                    </button>
                    
                    <button 
                        className={activeButton === "fighter" ? "itemButtonActive" : "itemButton" } 
                        onClick={handleSelectClass} 
                        value={"fighter"}>
                        <div className="buttonImgContainer">
                            <img src="img/avatars/fighter5.jpg" className="buttonImg" alt="Fighter Avatar" />
                        </div>
                        <span className="buttonText">Fighter</span>
                        <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                    </button>
                    
                    <button 
                        className={activeButton === "monk" ? "itemButtonActive" : "itemButton" } 
                        onClick={handleSelectClass} 
                        value={"monk"}>
                        <div className="buttonImgContainer">
                            <img src="img/avatars/monk5.jpg" className="buttonImg" alt="Monk Avatar" />
                        </div>
                        <span className="buttonText">Monk</span>
                        <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                    </button>
                   
                    <button 
                        className={activeButton === "paladin" ? "itemButtonActive" : "itemButton" } 
                        onClick={handleSelectClass} 
                        value={"paladin"}>
                        <div className="buttonImgContainer">
                            <img src="img/avatars/paladin1.jpg" className="buttonImg" alt="Paladin Avatar" />
                        </div>
                        <span className="buttonText">Paladin</span>
                        <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                    </button>
                   
                    <button 
                        className={activeButton === "ranger" ? "itemButtonActive" : "itemButton" } 
                        onClick={handleSelectClass} 
                        value={"ranger"}>
                        <div className="buttonImgContainer">
                            <img src="img/avatars/ranger1.jpg" className="buttonImg" alt="Ranger Avatar" />
                        </div>
                        <span className="buttonText">Ranger</span>
                        <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                    </button>
                   
                    <button 
                        className={activeButton === "rouge" ? "itemButtonActive" : "itemButton" } 
                        onClick={handleSelectClass} 
                        value={"rouge"}>
                        <div className="buttonImgContainer">
                            <img src="img/avatars/rouge1.jpg" className="buttonImg" alt="Rouge Avatar" />
                        </div>
                        <span className="buttonText">Rouge</span>
                        <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                    </button>

                    <button 
                        className={activeButton === "sorcerer" ? "itemButtonActive" : "itemButton" } 
                        onClick={handleSelectClass}
                        value={"sorcerer"}>
                        <div className="buttonImgContainer">
                            <img src="img/avatars/sorcerer2.jpg" className="buttonImg" alt="Sorcerer Avatar" />
                        </div>
                        <span className="buttonText">Sorcerer</span>
                        <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                    </button>

                    <button 
                        className={activeButton === "warlock" ? "itemButtonActive" : "itemButton" } 
                        onClick={handleSelectClass} 
                        value={"warlock"}>
                        <div className="buttonImgContainer">
                            <img src="img/avatars/warlock1.jpg" className="buttonImg" alt="Warlock Avatar" />
                        </div>
                        <span className="buttonText">Warlock</span>
                        <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                    </button>

                    <button 
                        className={activeButton === "wizard" ? "itemButtonActive" : "itemButton" } 
                        onClick={handleSelectClass} 
                        value={"wizard"}>
                        <div className="buttonImgContainer">
                            <img src="img/avatars/wizard2.jpg" className="buttonImg" alt="Barbarian Avatar" />
                        </div>
                        <span className="buttonText">Wizard</span>
                        <svg className="arrowIcon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path></svg>
                   
                   </button>
                        <div className="butonBox">
                            <button className="nextButton" onClick={handleClassClick}>Next</button>
                        </div>
                    </div> 
    );
}

export default ClassSelectionButtons;

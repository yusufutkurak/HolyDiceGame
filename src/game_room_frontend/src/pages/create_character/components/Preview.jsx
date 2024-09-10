import React from "react";

const Preview = (props) =>{
    const { baseScores, strength, wisdom, dexterity, intelligence, charisma, constitution, handlePrevDrop, handleSaveCharacter } = props;

    return(
        <div className="abilitylast">  
                    <div className="ability-half">
                        <div className="my-ability">
                            <div className="boxLabel">
                                <label className="card-label">Strength</label>
                            </div>
                            <div className="boxContent">
                                <div className="names">
                                    <div className="lbls">
                                        <label className="cardLabels">Total Score</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Modifier</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Base Score</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Racial Bonus</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Ability Improvements</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Misc Bonus</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Set Score</label>
                                    </div>
                                </div>
                                <div className="points">
                                    <div className="point-lbls">
                                        <label className="cardLabels"></label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">{strength}</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">{baseScores[0]}</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                </div>
                            </div>
                            <div className="other">
                                <label className="cardLabels">Other Modifier</label>
                                <input type="number" className="numberInput" placeholder="--" ></input>
                            </div>
                            <div className="other">
                                <label className="cardLabels">Override Score</label>
                                <input type="number" className="numberInput" placeholder="--" ></input>
                            </div>
                        </div>
        
                        <div className="my-ability">
                            <div className="boxLabel">
                                <label className="card-label">Dexterity</label>
                            </div>
                            <div className="boxContent">
                                <div className="names">
                                    <div className="lbls">
                                        <label className="cardLabels">Total Score</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Modifier</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Base Score</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Racial Bonus</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Ability Improvements</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Misc Bonus</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Set Score</label>
                                    </div>
                                </div>
                                <div className="points">
                                    <div className="point-lbls">
                                        <label className="cardLabels"></label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">{dexterity}</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">{baseScores[1]}</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                </div>
                            </div>
                            <div className="other">
                                <label className="cardLabels">Other Modifier</label>
                                <input type="number" className="numberInput" placeholder="--" ></input>
                            </div>
                            <div className="other">
                                <label className="cardLabels">Override Score</label>
                                <input type="number" className="numberInput" placeholder="--" ></input>
                            </div>
                        </div>
        
                        <div className="my-ability">
                            <div className="boxLabel">
                                <label className="card-label">Constitution</label>
                            </div>
                            <div className="boxContent">
                                <div className="names">
                                    <div className="lbls">
                                        <label className="cardLabels">Total Score</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Modifier</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Base Score</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Racial Bonus</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Ability Improvements</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Misc Bonus</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Set Score</label>
                                    </div>
                                </div>
                                <div className="points">
                                    <div className="point-lbls">
                                        <label className="cardLabels"></label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">{constitution}</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">{baseScores[2]}</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                </div>
                            </div>
                            <div className="other">
                                <label className="cardLabels">Other Modifier</label>
                                <input type="number" className="numberInput" placeholder="--" ></input>
                            </div>
                            <div className="other">
                                <label className="cardLabels">Override Score</label>
                                <input type="number" className="numberInput" placeholder="--" ></input>
                            </div>
                        </div>
                    </div>
        
                    <div className="ability-half">
                        <div className="my-ability">
                        <div className="boxLabel">
                                <label className="card-label">
                                    Intelligence
                                </label>
                            </div>
                            <div className="boxContent">
                                <div className="names">
                                    <div className="lbls">
                                        <label className="cardLabels">Total Score</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Modifier</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Base Score</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Racial Bonus</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Ability Improvements</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Misc Bonus</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Set Score</label>
                                    </div>
                                </div>
                                <div className="points">
                                    <div className="point-lbls">
                                        <label className="cardLabels"></label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">{intelligence}</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">{baseScores[3]}</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                </div>
                            </div>
                            <div className="other">
                                <label className="cardLabels">Other Modifier</label>
                                <input type="number" className="numberInput" placeholder="--" ></input>
                            </div>
                            <div className="other">
                                <label className="cardLabels">Override Score</label>
                                <input type="number" className="numberInput" placeholder="--" ></input>
                            </div>
                        </div>
        
                        <div className="my-ability">
                        <div className="boxLabel">
                                <label className="card-label">Wisdom</label>
                            </div>
                            <div className="boxContent">
                                <div className="names">
                                    <div className="lbls">
                                        <label className="cardLabels">Total Score</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Modifier</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Base Score</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Racial Bonus</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Ability Improvements</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Misc Bonus</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Set Score</label>
                                    </div>
                                </div>
                                <div className="points">
                                    <div className="point-lbls">
                                        <label className="cardLabels"></label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">{wisdom}</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">{baseScores[4]}</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                </div>
                            </div>
                            <div className="other">
                                <label className="cardLabels">Other Modifier</label>
                                <input type="number" className="numberInput" placeholder="--" ></input>
                            </div>
                            <div className="other">
                                <label className="cardLabels">Override Score</label>
                                <input type="number" className="numberInput" placeholder="--" ></input>
                            </div>
                        </div>
        
                        <div className="my-ability">
                            <div className="boxLabel">
                                <label className="card-label">Charisma</label>
                            </div>
                            <div className="boxContent">
                                <div className="names">
                                    <div className="lbls">
                                        <label className="cardLabels">Total Score</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Modifier</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Base Score</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Racial Bonus</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Ability Improvements</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Misc Bonus</label>
                                    </div>
                                    <div className="lbls">
                                        <label className="cardLabels">Set Score</label>
                                    </div>
                                </div>
                                <div className="points">
                                    <div className="point-lbls">
                                        <label className="cardLabels"></label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">{charisma}</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">{baseScores[5]}</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                    <div className="point-lbls">
                                        <label className="cardLabels">+3</label>
                                    </div>
                                </div>
                            </div>
                            <div className="other">
                                <label className="cardLabels">Other Modifier</label>
                                <input type="number" className="numberInput" placeholder="--" ></input>
                            </div>
                            <div className="other">
                                <label className="cardLabels">Override Score</label>
                                <input type="number" className="numberInput" placeholder="--" ></input>
                            </div>
                        </div>
                    </div>
                    <div className="pagination">
                            <button className="nextButton" onClick={handlePrevDrop}>Back</button>
                            <button className="nextButton" onClick={handleSaveCharacter}>Save Character</button>
                    </div>
        </div>
    )
}

export default Preview;
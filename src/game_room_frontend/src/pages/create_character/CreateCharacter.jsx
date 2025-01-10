import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAuth } from '../auth/useAuthClient';
import ClassSelectionButtons from "./components/ClassSelectionButton";
import RaceSelectionButton from "./components/RaceSelectionButton";
import Background from "./components/Background";
import { useEffect, useState } from "react";
import "../style/create_character.css"
import React from 'react';
import OpenAI from "openai";
import { useNavigate } from "react-router-dom";
import CharacterBox from "./components/CharacterBox";
import Preview from "./components/Preview";

function CreateCharacter () {
    let abilityPoints = []; // Yetenek puanları
    let abilityItems = [];
    let dicePoints = []; // Atılan 4 zar
    let diceSet = []; // Tüm 24 zar
    let temp;
    let point;

    const navigate = new useNavigate();
    const { game_roomActor, isAuthenticated } = useAuth();
    const [isPressed, setIsPressed] = useState(false);
    const [items, setItems] = useState(null);
    const [strength, setStrength] = useState(0);
    const [dexterity, setDexterity] = useState(0);
    const [constitution, setConstitution] = useState(0);
    const [intelligence, setIntelligence] = useState(0);
    const [wisdom, setWisdom] = useState(0);
    const [charisma, setCharisma] = useState(0);
    const [classes, setClasses] = useState();
    const [race, setRace] = useState();
    const [activeButton, setActiveButton] = useState();
    const [classForm, setClassForm] = useState(true);
    const [raceForm, setRaceForm] = useState(false);
    const [page, setPage] = useState(0);
    const [prompt, setPrompt] = useState("");
    const [imageUrl, setImageUrl] = useState(null);
    const [name, setName] = useState(""); 
    const [baseScores, setBaseScores] = useState([]);
    const [preview, setPreview] = useState(false);
    const [loading, setLoading] = useState(false);  // Yüklenme durumu için state
    const [balance, setBalance] = useState(1);
    const [balanceBool, setBalanceBool] = useState(true);

    function scrollToTop() {
        window.scrollTo({
            top: 300,  // Sayfanın en üstü
            behavior: 'smooth'  // Yumuşak bir kaydırma hareketi
        });
    }
    
    const generateImage = async () => {
        controlBalance();
      if(balance > 0 && isAuthenticated){
        try {
            const openai = new OpenAI({
                apiKey: "sk-u02A4It1TVSvKFrYe-3c6xdjWjjbT3dY9STZGZ6eBhT3BlbkFJA7Xmc86piR06IY8Vm0bWV0yMd6fbGxvTF59dnjiGcA",
                dangerouslyAllowBrowser: true, // Bu seçeneği etkinleştiriyoruz
              });          

              console.log("neww",process.env.CANISTER_ID_GAME_ROOM_FRONTEND);
      
            const response = await openai.images.generate({
              model: "dall-e-3",
              prompt: prompt,
              n: 1,
              size: "1024x1024",
              quality: "standard",
            });
    
            const imageUrl = response.data[0].url;
            console.log(response);
            setImageUrl(response.data[0].url);
      
          } catch (error) {
            console.error("Error generating image:", error);
          }
      }
    };
    
    const controlBalance = async () => {
        const currentBalance = await game_roomActor.get_balance();
        if(currentBalance > 0){
            await game_roomActor.decrease_balance();
            const increaseBalance = await game_roomActor.get_balance();
            setBalance(increaseBalance);
            console.log("BALANCE",increaseBalance);
        }
        else{
            console.log("BALANCE",currentBalance);
            setBalance(currentBalance);
        }
        if(currentBalance === 0 || currentBalance < 0){
            setBalanceBool(false);
        }

    };

    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const newItems = Array.from(items);

        const [reorderedItem] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, reorderedItem);

        setItems(newItems);

        items.forEach((item, index) => {
            const value = parseInt(item.content, 10);

            switch(index) {
                case 0:
                    setStrength(value);
                    break;
                case 1:
                    setDexterity(value);
                    break;
                case 2:
                    setConstitution(value);
                    break;
                case 3:
                    setIntelligence(value);
                    break;
                case 4:
                    setWisdom(value);
                    break;
                case 5:
                    setCharisma(value);
                    break;
                default:
                    break;
            }
        });
    };

    const handleButtonClick = () => {
        if(race != null){
            setRaceForm(false);

        diceSet = [];
        dicePoints = [];
        abilityPoints = [];

        for(let i = 0; i < 6; i++){
            for(let j = 0; j < 4; j++){
                temp = Math.floor((Math.random() * 6) + 1);
                dicePoints.push(temp);
            }
            diceSet[i] = dicePoints;
            point = calcPoint(dicePoints);
            abilityPoints.push(point);
            dicePoints = [];
        }
       
        const temp2 = [...abilityPoints]; 
        setBaseScores(temp2);

        abilityPoints = calcAbility(abilityPoints);

        for(let i = 0; i<6;i++){
            abilityItems.push({id: String(i), content: `${abilityPoints[i]}`});
        }

        setItems(abilityItems);
        setIsPressed(true);
        }
        scrollToTop();
    };

    const handlePrevDrop = () => {
        setPreview(false);
        setIsPressed(true);
    };

    const handleSaveCharacter = async () => {
        const abilitys = {
            strength: strength,
            dexterity: dexterity,
            constitution: constitution,
            intelligence: intelligence,
            wisdom: wisdom,
            charisma: charisma
        };

        setLoading(true);  // Yüklenme durumunu başlat
        try {
            console.log("Saving character...");
            await game_roomActor.save_character(
                name,
                race,
                classes,
                abilitys,
                imageUrl.toString()
            );
            navigate('/my-characters');
        } catch (error) {
            console.error("Error saving character:", error);
        } finally {
            setLoading(false);  // Yüklenme durumunu sonlandır
        }
    }
    
 
    const handleNextClick = () => {
        items.forEach((item, index) => {
            const value = parseInt(item.content, 10);

            switch(index) {
                case 0:
                    setStrength(value);
                    break;
                case 1:
                    setDexterity(value);
                    break;
                case 2:
                    setConstitution(value);
                    break;
                case 3:
                    setIntelligence(value);
                    break;
                case 4:
                    setWisdom(value);
                    break;
                case 5:
                    setCharisma(value);
                    break;
                default:
                    break;
            }
        });

        console.log("Strength:", strength);
        console.log("Dexterity:", dexterity);
        console.log("Constitution:", constitution);
        console.log("Intelligence:", intelligence);
        console.log("Wisdom:", wisdom);
        console.log("Charisma:", charisma);
        setIsPressed(false);
        setPreview(true);
        scrollToTop();
    }

    const calcPoint = (diceArray) => {
        const min = Math.min(...diceArray);
        const sum = diceArray.reduce((acc, val) => acc + val, 0);
        console.log(min);
        return sum - min;
    }

    const calcAbility = (abilitys) => {
        let tempArray = abilitys;

        for(let i = 0; i < tempArray.length; i++){
            if(tempArray[i] % 2 === 1){
                tempArray[i] = tempArray[i] - 1; 
            }
            if(tempArray[i] / 2 <= 5 && tempArray[i] / 2 !== 5){
                tempArray[i] = (5 - (tempArray[i] / 2)) * -1; 
            }
            if(tempArray[i] / 2 === 5){
                tempArray[i] = 0; 
            }
            if(tempArray[i] / 2 > 5){
                tempArray[i] = (Math.abs(5 - (tempArray[i] / 2))); 
            }
        }

        return tempArray;
    }

    const handleSelectClass = (event) => {
        const value = event.target.value;
        setClasses(value);
        if(activeButton === value){
            setActiveButton(null)
            setClasses(null);
        }
        else{
            setActiveButton(value);
        }
    }

    const handleClassClick = () => {
        if(classes != null){
            setClassForm(false);
            setRaceForm(true);
            scrollToTop();
        }
    }

    const handleSelectRace = (event) => {
        const value = event.target.value;
        setRace(value);
        if(activeButton === value){
            setActiveButton(null)
            setRace(null);
        }
        else{
            setActiveButton(value);
        }
    }

    const handleRaceClick = () => {
        if(race != null){
            setRaceForm(false);
            scrollToTop();

        }
    }

    const handlePrevClass = () => {
        setRaceForm(false);
        setClassForm(true);
        scrollToTop();
    }

    const handlePrevRace = () => {
        setRaceForm(true);
        setIsPressed(false);
        scrollToTop();
    }


    return(
        <div className="create-character">
             {loading && (
                <div className="loading-container">
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Saving character...</p>
                    </div>
                </div>
            )}
            <Background/>
            <CharacterBox
                {...{ imageUrl, name, setName, prompt, setPrompt, generateImage }}
            />

            {
                (classForm || raceForm) && (
                <div className="form">
                
                {classForm && 
                    <label className="item-label">Select Character Class</label>
                }
                {classForm &&
                    <ClassSelectionButtons
                        activeButton={activeButton}
                        handleSelectClass={handleSelectClass}
                        handleClassClick={handleClassClick}
                    />
                }

                {raceForm &&
                    <label className="item-label">Select Character Race</label>
                }
                {raceForm &&
                    <RaceSelectionButton
                        activeButton={activeButton}
                        handleRaceClick={handleRaceClick}
                        handleSelectRace={handleSelectRace}
                        handlePrevClass={handlePrevClass}
                        handleButtonClick={handleButtonClick}
                    />
                }
                </div>
                    
                )
            }
            
            {isPressed &&
                <label className="item-label">Select Character Class</label>
            }
            {isPressed &&
                    <div className="abilitySelect">
                        <div className="abilityBox">
                            <div className="abilitys">
                                <div className="abilityLabels">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg"><path d="M104 96H56c-13.3 0-24 10.7-24 24v104H8c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h24v104c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V120c0-13.3-10.7-24-24-24zm528 128h-24V120c0-13.3-10.7-24-24-24h-48c-13.3 0-24 10.7-24 24v272c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V288h24c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM456 32h-48c-13.3 0-24 10.7-24 24v168H256V56c0-13.3-10.7-24-24-24h-48c-13.3 0-24 10.7-24 24v400c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V288h128v168c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24z"></path></svg>
                                    <label className="abilityText">STRENGTH</label>
                                </div>
                                <div className="abilityLabels">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M501.1 395.7L384 278.6c-23.1-23.1-57.6-27.6-85.4-13.9L192 158.1V96L64 0 0 64l96 128h62.1l106.6 106.6c-13.6 27.8-9.2 62.3 13.9 85.4l117.1 117.1c14.6 14.6 38.2 14.6 52.7 0l52.7-52.7c14.5-14.6 14.5-38.2 0-52.7zM331.7 225c28.3 0 54.9 11 74.9 31l19.4 19.4c15.8-6.9 30.8-16.5 43.8-29.5 37.1-37.1 49.7-89.3 37.9-136.7-2.2-9-13.5-12.1-20.1-5.5l-74.4 74.4-67.9-11.3L334 98.9l74.4-74.4c6.6-6.6 3.4-17.9-5.7-20.2-47.4-11.7-99.6.9-136.6 37.9-28.5 28.5-41.9 66.1-41.2 103.6l82.1 82.1c8.1-1.9 16.5-2.9 24.7-2.9zm-103.9 82l-56.7-56.7L18.7 402.8c-25 25-25 65.5 0 90.5s65.5 25 90.5 0l123.6-123.6c-7.6-19.9-9.9-41.6-5-62.7zM64 472c-13.2 0-24-10.8-24-24 0-13.3 10.7-24 24-24s24 10.7 24 24c0 13.2-10.7 24-24 24z"></path></svg>
                                    <label className="abilityText">DEXTERITY</label>
                                </div>
                                <div className="abilityLabels">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12.9985 2L12.9979 3.278L17.9985 4.94591L21.631 3.73509L22.2634 5.63246L19.2319 6.643L22.3272 15.1549C21.2353 16.2921 19.6996 17 17.9985 17C16.2975 17 14.7618 16.2921 13.6699 15.1549L16.7639 6.643L12.9979 5.387V19H16.9985V21H6.99854V19H10.9979V5.387L7.23192 6.643L10.3272 15.1549C9.23528 16.2921 7.69957 17 5.99854 17C4.2975 17 2.76179 16.2921 1.66992 15.1549L4.76392 6.643L1.73363 5.63246L2.36608 3.73509L5.99854 4.94591L10.9979 3.278L10.9985 2H12.9985ZM17.9985 9.10267L16.5809 13H19.4159L17.9985 9.10267ZM5.99854 9.10267L4.58092 13H7.41592L5.99854 9.10267Z"></path></svg>               
                                    <label className="abilityText">CONSTITUTION</label>
                                </div>
                                <div className="abilityLabels">
                                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path></svg>                                    
                                    <label className="abilityText">INTELLIGENCE</label>
                                </div>
                                <div className="abilityLabels">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 256" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M208,32V192H72a24,24,0,0,0-24,24V56A24,24,0,0,1,72,32h40v96l32-24,32,24V32Z" opacity="0.2"></path><path d="M208,24H72A32,32,0,0,0,40,56V224a8,8,0,0,0,8,8H192a8,8,0,0,0,0-16H56a16,16,0,0,1,16-16H208a8,8,0,0,0,8-8V32A8,8,0,0,0,208,24ZM120,40h48v72L148.79,97.6a8,8,0,0,0-9.6,0L120,112Zm80,144H72a31.82,31.82,0,0,0-16,4.29V56A16,16,0,0,1,72,40h32v88a8,8,0,0,0,12.8,6.4L144,114l27.21,20.4A8,8,0,0,0,176,136a8.1,8.1,0,0,0,3.58-.84A8,8,0,0,0,184,128V40h16Z"></path></svg>
                                    <label className="abilityText">WISDOM</label>
                                </div>
                                <div className="abilityLabels">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M3 5a2 2 0 0 0-2 2v.5H.5a.5.5 0 0 0 0 1H1V9a2 2 0 0 0 2 2h1a3 3 0 0 0 3-3 1 1 0 1 1 2 0 3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-.5h.5a.5.5 0 0 0 0-1H15V7a2 2 0 0 0-2-2h-2a2 2 0 0 0-1.888 1.338A2 2 0 0 0 8 6a2 2 0 0 0-1.112.338A2 2 0 0 0 5 5zm0 1h.941c.264 0 .348.356.112.474l-.457.228a2 2 0 0 0-.894.894l-.228.457C2.356 8.289 2 8.205 2 7.94V7a1 1 0 0 1 1-1"></path></svg>
                                    <label className="abilityText">CHARISMA</label>
                                </div>
                            </div>

                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="droppable">
                            {(provided) => (
                                <div
                                className="drag" 
                                {...provided.droppableProps}
                                ref={provided.innerRef}  
                                >
                                {items.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided) => (
                                        <div
                                        className="dropable" 
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        >
                                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>
                                            <label className="dropableLable">
                                                {parseFloat(item.content) > -1 ? `+${item.content}` : item.content}
                                            </label>
                                        </div>
                                    )}
                                    </Draggable>                      
                                ))}
                                {provided.placeholder}
                                </div>
                            )}
                            </Droppable>
                            </DragDropContext> 
                        </div> 
                        <div className="pagination">
                            <button className="nextButton" onClick={handlePrevRace}>Prev</button>
                            <button className="nextButton" onClick={handleNextClick}>Next</button>
                        </div>
                    </div>
            }

            {preview &&
                <Preview
                    {...{ baseScores, strength, wisdom, dexterity, intelligence, charisma, constitution, handlePrevDrop, handleSaveCharacter }}
                />
            }
        
        </div>
    );
}

export default CreateCharacter;

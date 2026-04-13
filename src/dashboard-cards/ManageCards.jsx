import { useEffect, useState } from "react"
import "./Cards.css"

import CardBrief from "./CardBrief";
import CardFocus from "./CardFocus";

import plusIcon from "../assets/plus-icon.png"

const API = import.meta.env.VITE_API_URL;

export default function ManageCards({curFile, traverseBack}){

    const [cardsData, setCardsData] = useState(null);

    const [cardInFocus, setCardInFocus] = useState(null);
    const [question, setQuestion] = useState(null);
    const [answer, setAnswer] = useState(null);

    const [makingNewCard, SetMakingNewCard] = useState(false);

    async function saveCardDB() {

        const res = await fetch(`${API}/saveCard/${curFile}/${cardInFocus}`,{
            method: "PATCH",
            headers: {
                'Content-Type': "application/json",
                authorisation: localStorage.getItem('token')
            },
            body: JSON.stringify({
                question: question,
                answer: answer
            })
        })

        if (res.status !== 200){
            alert("Could Not Save.");
        }
        else{
            
            setCardsData(prev => Object.fromEntries(
                Object.entries(prev).map(([key, value]) => {
                    if (key == cardInFocus) {
                        return [key, { question, answer }];
                    }
                    return [key, value];
                })
            ));

            setCardInFocus(null)
            SetMakingNewCard(false);

        }
    }

    function changeFocus(cardIndex){

        setQuestion( cardsData[cardIndex].question );
        setAnswer( cardsData[cardIndex].answer );
        setCardInFocus(cardIndex);

        SetMakingNewCard(false);

    }

    async function makeNewCard() {
        
        const dataKeys = Object.keys(cardsData);
        let newCardId;

        if (dataKeys.length === 0){
            newCardId = 0; 
        }
        else{
            newCardId = Number(dataKeys[dataKeys.length - 1]) + 1;
        }

        const res = await fetch(`${API}/newCard/${curFile}/${newCardId}`,{
            method: "POST",
            headers: {
                'Content-Type':"application/json",
                authorisation: localStorage.getItem('token')
            }
        })

        if (res.status != 200){
            alert("Could Not Make A New Card");
        }
        else{

            setCardsData(prev => ({ ...prev, [newCardId]: { question: "", answer: "" } }));
            setQuestion("");
            setAnswer("");
            setCardInFocus(newCardId);
            SetMakingNewCard(true);
        }
    }

    async function deleteCard(cardIndex) {

        const res = await fetch(`${API}/deleteCard/${curFile}/${cardIndex}`,{
            method:"DELETE",
            headers: {
                'Content-Type':"application/json",
                authorisation: localStorage.getItem('token')
            }
        })

        if(res.status !== 200){
            alert("Could Not Delete Card");
        }
        else{

            setCardInFocus(null);
            console.log(cardsData[cardIndex]);
            setCardsData(prev => Object.fromEntries(
                Object.entries(prev).filter(([key]) => key != cardIndex)
            ));

        }
    }

    useEffect( () => {

        async function getCards(){

            const res = await fetch(`${API}/getCardsQA/${curFile}`,{
                method: "GET",
                headers: {
                    'Content-Type':"application/json",
                    authorisation: localStorage.getItem('token')
                }
            })

            if (res.status !== 200){
                alert("could not fetch cards");
            }
            else{
                const cards = await res.json();
                setCardsData(cards.data);
            }

        }

        getCards();


    },[])

    return(
        <div className="ManageCards">

            <div className="ManageCards-mainCardsSection">
                
                <div className="ManageCards-mainCardsSection-backButton" onClick={traverseBack} />
                
                <div className="ManageCards-mainCardsSection-Cards">
                    {
                        cardsData && Object.entries(cardsData).map( ([key, value]) => 
                            cardInFocus && key == cardInFocus ?
                            <CardFocus 
                                key={key}
                                question={question} setQuestion={setQuestion} 
                                answer={answer} setAnswer={setAnswer} 
                                saveCard={saveCardDB}
                            />  
                                :
                            <CardBrief 
                                key={key} 
                                displayText={value.question} 
                                onClick={() => changeFocus(key)} 
                                deleteCard={() => deleteCard(key)}
                            />
                        )
                    }

                    {
                        !makingNewCard &&
                        <div className="ManageCards-newButton" onClick={makeNewCard}>
                            <img src={plusIcon} />
                        </div>
                    }


                </div>

            </div>

        </div>
    )


}
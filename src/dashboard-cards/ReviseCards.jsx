import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Extension } from '@tiptap/core';
import { useState, useEffect } from 'react';

export default function ReviseCards({curFile, traverseBack}){

    const [cards, setCards] = useState(null);
    const [curCard, setCurCard] = useState(null);
    const [cardFace, setCardFace] = useState("question")
    const [headBarLight, setHeadBarLight] = useState(null);
    const [cardsLength, setCardsLength] = useState(null);

    function lightBar(dir = "flat", col = "white"){

        setHeadBarLight( e =>
            dir == "flat" ?
            { backgroundColor:"rgba(255,255,255,0.1)" } :
            { backgroundImage:`linear-gradient(
            to ${dir},
            rgba(255,255,255,0),
            rgba(${col==="red" || col==="white" ? "255" : "0"},${col==="green" || col==="white" ? "255" : "0"},${col==="white" ? "255" : "0"},0.15)
            )`}
        )

        setTimeout( () => setHeadBarLight(null), 300 );

    }

    useEffect( () => {

        const handleKeyDown = (e) => {

            const isMac = navigator.platform.toUpperCase().includes('MAC');
            const modKey = isMac ? e.metaKey : e.ctrlKey;

            // question traversal
            if (modKey && e.key === "ArrowRight"){
                lightBar("right");
                setCurCard( prev => prev+1 == cardsLength ? prev : prev + 1 );
                setCardFace("question");
            }
            if (modKey && e.key === "ArrowLeft"){
                console.log(curCard)
                lightBar("left");
                setCurCard( prev => prev == 0 ? prev : prev - 1 );
                setCardFace("question");
            }

            // question right or wrong
            if (modKey && e.key === ","){
                lightBar("right", "red");
                setCurCard( prev => prev+1 == cardsLength ? prev : prev + 1 );
                setCardFace("question");
            }
            if (modKey && e.key === ".") {
                lightBar("right", "green");
                setCurCard( prev => prev+1 == cardsLength ? prev : prev + 1 );
                setCardFace("question");
            }

            // flip the card
            if (modKey && e.key == "ArrowDown"){
                lightBar();
                setCardFace( prev => prev === "question" ? "answer" : "question" );
            }

        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    })

    useEffect( () => {

        async function fetchCards(){

            const res = await fetch(`/getCardsQA/${curFile}`, {
                method: "GET",
                headers: {
                    'Content-Type' : "application/json",
                    authorisation : localStorage.getItem('token')
                }
            })

            if (res.status !== 200){
                alert("Could Not Fetch Cards.");
            }
            else{
                const fetchedCards = await res.json();
                const newCards = fetchedCards.data;

                setCards(newCards);

                setCurCard( Number(Object.keys(newCards)[0]) );
                setCardsLength(Object.entries(newCards).length);
            }

        }

        fetchCards();

    },[])

     const PreventTabDefocus = Extension.create({
        addKeyboardShortcuts() {
            return {
                Tab: () => {
                    if (this.editor.isActive('listItem')) {
                        return this.editor.commands.sinkListItem('listItem');
                    }
                    this.editor.commands.insertContent('\t');
                    return true;
                },
                'Shift-Tab': () => {
                    if (this.editor.isActive('listItem')) {
                        return this.editor.commands.liftListItem('listItem');
                    }
                    return true;
                }
            };
        }
    });

    const editor = useEditor({
        extensions: [StarterKit, PreventTabDefocus],
        content: "",
    })

    return(

        <div className="ReviseCards-main">

            <div className="ReviseCards-topBar" onClick={traverseBack} style={headBarLight} />

            <div className="ReviseCards-card">

                <p>{curCard} : <b>{cardFace.toUpperCase()}</b></p>

                <div className="ReviseCards-card-inner" 
                    dangerouslySetInnerHTML={ cards && { __html: cards[Number( Object.keys(cards)[curCard] )][cardFace] }} 
                />
            </div>

            <EditorContent editor={editor} />

        </div>

    )

}
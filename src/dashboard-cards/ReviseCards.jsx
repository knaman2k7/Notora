import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Extension, InputRule } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Plugin } from '@tiptap/pm/state';
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
            const modKey = isMac ? e.altKey : e.ctrlKey;

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
                        this.editor.commands.sinkListItem('listItem');
                        return true;
                    }
                    this.editor.commands.insertContent({
                        type: 'text',
                        text: '\u2003',
                    })
                    return true;
                },
                'Shift-Tab': () => {
                    if (this.editor.isActive('listItem')) {
                        this.editor.commands.liftListItem('listItem');
                        return true;
                    }
                    return true;
                }
            };
        }
    });

    const PasteImage = Extension.create({
        addProseMirrorPlugins() {
            return [
                new Plugin({
                    props: {
                        handlePaste(view, event) {
                            const items = Array.from(event.clipboardData?.items || []);
                            const imageItem = items.find(item => item.type.startsWith('image/'));

                            if (!imageItem) return false; // not an image, handle paste normally

                            const file = imageItem.getAsFile();
                            const formData = new FormData();
                            formData.append('image', file);

                            fetch('/uploadImage', {
                                method: 'POST',
                                headers: {
                                    authorisation: localStorage.getItem('token')
                                },
                                body: formData
                            })
                            .then(res => res.json())
                            .then(({ url }) => {
                                const node = view.state.schema.nodes.image.create({ src: url });
                                const transaction = view.state.tr.replaceSelectionWith(node);
                                view.dispatch(transaction);
                            });

                            return true; // swallow the paste event
                        }
                    }
                })
            ];
        }
    });

    const shortcuts = [
    { pattern: /\\in\s$/, symbol: "∈" },
    { pattern: /\\notin\s$/, symbol: "∉" },
    { pattern: /\\subset\s$/, symbol: "⊂" },
    { pattern: /\\subseteq\s$/, symbol: "⊆" },
    { pattern: /\\cup\s$/, symbol: "∪" },
    { pattern: /\\cap\s$/, symbol: "∩" },
    { pattern: /\\forall\s$/, symbol: "∀" },
    { pattern: /\\exists\s$/, symbol: "∃" },
    { pattern: /\\nexists\s$/, symbol: "∄" },
    { pattern: /\\infty\s$/, symbol: "∞" },
    { pattern: /\\sum\s$/, symbol: "∑" },
    { pattern: /\\prod\s$/, symbol: "∏" },
    { pattern: /\\sqrt\s$/, symbol: "√" },
    { pattern: /\\pm\s$/, symbol: "±" },
    { pattern: /\\neq\s$/, symbol: "≠" },
    { pattern: /\\leq\s$/, symbol: "≤" },
    { pattern: /\\geq\s$/, symbol: "≥" },
    { pattern: /\\approx\s$/, symbol: "≈" },
    { pattern: /\\times\s$/, symbol: "×" },
    { pattern: /\\div\s$/, symbol: "÷" },
    { pattern: /\\emptyset\s$/, symbol: "∅" },
    { pattern: /\\pi\s$/, symbol: "π"},
    { pattern: /\\rho\s$/, symbol: "ρ"},
    { pattern: /\\sigma\s$/, symbol: "σ"},
    { pattern: /\\equiv\s$/, symbol: "≡"},
    { pattern: /\\join\s$/, symbol: "⋈"},
    { pattern: /\\ljoin\s$/, symbol: "⟕"},
    { pattern: /\\rjoin\s$/, symbol: "⟖"},
    { pattern: /\\ojoin\s$/, symbol: "⟗"},
    { pattern: /\-->\s$/, symbol: "→"}
    ];

    const MathShortcuts = Extension.create({
    name: "mathShortcuts",
    addInputRules() {
        return shortcuts.map(
        ({ pattern, symbol }) =>
            new InputRule({
            find: pattern,
            handler: ({ state, range }) => {
                const { tr } = state;
                tr.replaceWith(range.from, range.to, state.schema.text(symbol + " "));
            },
            })
        );
    },
    });

    const editor = useEditor({
        extensions: [
            StarterKit,
            PreventTabDefocus,
            Image,
            PasteImage,
            Subscript,
            Superscript,
            MathShortcuts
        ],
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
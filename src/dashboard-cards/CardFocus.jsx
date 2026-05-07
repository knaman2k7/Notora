import { useState, useEffect } from "react"

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Extension } from '@tiptap/core';

export default function CardFocus({question, answer, setQuestion, setAnswer, saveCard}){

    const [focusQuestion, setFocusQuestion] = useState(true);


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
        content: focusQuestion ? question : answer,
        onBlur: ({ editor }) => {
            if (focusQuestion){
                setQuestion(editor.getHTML());
            }
            else{
                setAnswer(editor.getHTML());
            }
        }
    })

    useEffect(() => {
        if (editor){
            editor.commands.setContent(focusQuestion ? question : answer);
        }
    }, [focusQuestion, editor]);

    return(

        <div className="Manage-Cards-cardFocus" >

            <div className="Manage-Cards-cardFocus-header">
                <p 
                    className={ focusQuestion ? "Manage-Cards-cardFocus-header-selected" : undefined } 
                    onClick={ () => setFocusQuestion(true) } 
                >Question</p>

                <p 
                    className={ !focusQuestion ? "Manage-Cards-cardFocus-header-selected" : undefined } 
                    onClick={ () => setFocusQuestion(false) } 
                >Answer</p>
            </div>

            <hr style={{borderColor:"rgba(255,255,255,0.05)"}} />

        
            <EditorContent editor={editor} />
            
            <button onClick={saveCard}>Save</button>

        </div>

    )

}
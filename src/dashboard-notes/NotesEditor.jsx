import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Extension } from '@tiptap/core';
import { InputRule } from "@tiptap/core";
import Image from '@tiptap/extension-image';
import { Plugin } from 'prosemirror-state';
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'

import "./Notes.css"
import { useEffect, useState } from 'react';

export default function NotesEditor({curFile}){

    const [notes, setNotes] = useState(null);

    function saveFile(newNotes){

        async function saveNotes(){

            const res = await fetch(`http://localhost:3000/notes/${curFile}`, {
                method:"POST",
                headers: {
                    'Content-Type':'application/json',
                    authorisation : localStorage.getItem('token')
                },
                body: JSON.stringify( { newNotes: newNotes } )
            })

            if(res.status != 200){
                alert("File cannot be saved right now. Check Connection")
            }

        }

        setNotes(newNotes);
        saveNotes();

    }

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

                            fetch('http://localhost:3000/uploadImage', {
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
        content: notes,
        onBlur: ({ editor }) => {
            saveFile(editor.getHTML());
        }
    })

    useEffect( () => {

        async function getNotes(){

            const res = await fetch( `http://localhost:3000/notes/${Number(curFile)}`,{
                headers: {
                    'Content-Type' : 'application/json',
                    authorisation: localStorage.getItem('token')
                }
            })

            const savedNotes = await res.json();
            setNotes(savedNotes.notes);

            editor?.commands.setContent(savedNotes.notes);

        }

        getNotes();

    }, [editor])


    return(
        
        <div className='NotesEditor-wrapper'>

            <EditorContent editor={editor} />
        
        </div>
    )

}
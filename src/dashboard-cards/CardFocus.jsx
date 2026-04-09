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
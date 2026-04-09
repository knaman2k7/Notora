import { useState } from "react"
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import FileBrowser from "../FileBrowser/FileBrowser";
import NotesEditor from "./NotesEditor"

export default function Notes(){

    const [inFile, setInFile] = useState(false);
    const [curFile, setCurFile] = useState(false);

    return (
        <div>

            <FileBrowser 
                revisionMethod="notes" 
                inFile={inFile} 
                setInFile={setInFile}
                setCurFile={setCurFile}
                />

            { inFile ? <NotesEditor curFile={curFile} /> : null}
                
        </div>
    )

}
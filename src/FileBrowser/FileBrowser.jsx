import { useEffect, useState } from "react"
import "./FileBrowser.css"

import FileBar from "./FileBar";
import FilePathLink from "./FilePathLink";
import plusIcon from "../assets/plus-icon.png"

export default function FileBrowser({revisionMethod, inFile, setInFile, setCurFile}){

    const [fileDirectoryMap, setFileDirectoryMap] = useState({});
    const[fileNameMap, setFileNameMap] = useState({});
    
    const [fileDirectory, setFileDirectory] = useState([""]);
    const [fileNumber, setFileNumber] = useState("");

    const[creatingFile, setCreatingFile] = useState(false);
    const[newFileName, setNewFileName] = useState("");

    const[filePath, setFilePath] = useState(["0"]);


    function selectFile(e, traverseForward = true){

        setFileNumber( e );
        setFileDirectory( fileDirectoryMap[e] );

        if (traverseForward){
            setFilePath( prev => [...prev, e] )
        }
        else{
            setFilePath( prev => prev.slice(0, prev.indexOf(e)+1) );
            setInFile(false);
        }

        setCreatingFile(false);
        setNewFileName("");


        if ( 
            (fileNameMap[e].slice(-3) == ".nt"  && revisionMethod==="notes") ||
            (fileNameMap[e].slice(-3) == ".cd"  && revisionMethod==="cards")
            )
        {
            setInFile(true);
            setCurFile(e);
        }


    }

    function createNewFile(newFileName){

        const key = Object.keys(fileNameMap).at(-1);
        
        async function addFileNoteDB(){

            const res = await fetch( `http://localhost:3000/newNotes/${Number(key)+1}`,{
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                    authorisation: localStorage.getItem('token')
                }
            })

            if (res.status !== 200){
                alert("New note file could not be created")
            }

        }

        
        async function addFileCardsDB(){

            const res = await fetch( `http://localhost:3000/newCard/${Number(key)+1}/0`,{
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                    authorisation: localStorage.getItem('token')
                }
            })

            if (res.status !== 200){
                alert("Card could not be saved. Try again later.")
            }

        }

        if (newFileName.slice(-3) == ".nt"){
            addFileNoteDB();
            
        }
        else if( newFileName.slice(-3) == ".cd"){
            // do nothing
        }
        

        setFileNameMap( prev => ({...prev, [Number(key)+1]: newFileName}) );
        setFileDirectoryMap( prev => ({...prev, [fileNumber]: [...prev[fileNumber], Number(key)+1] , [Number(key)+1]: [] }) );

    }

    function fileTypeCheck(name){

        if ( name && (name.slice(-3) === ".nt" || name.slice(-3) === ".cd") ){
            return name.slice(0,-3);
        }
        else{
            return name;
        }
    }

    useEffect( () => {

        async function sendNewMaps(){

            const res = await fetch( `http://localhost:3000/updateMaps/${revisionMethod}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorisation": localStorage.getItem("token")
                },
                body: JSON.stringify( { 
                    parent: {
                        fileNumber: `${fileNumber}`,
                        fileDirectory: fileDirectoryMap[fileNumber].map( file => `${file}` )
                    },
                    newFile: {
                        fileNumber: `${Object.keys(fileNameMap).at(-1)}`,
                        fileName: fileNameMap[Object.keys(fileNameMap).at(-1)],
                    }
                 })
            });
            

            if (res.status !== 200){
                alert("Error creating file. Please try again.");
            }

        }

        creatingFile && sendNewMaps();

        setFileDirectory( fileDirectoryMap[fileNumber] || [] );
        setCreatingFile(false);
        setNewFileName("");


    }, [fileNameMap] )

    useEffect(() => {

        async function fetchData(){

            // fetch file system from backend
            const resDr = await fetch(`http://localhost:3000/getMap/${revisionMethod}/directory`,{
                method:"GET",
                headers: {
                    "Content-Type": "application/json",
                    "authorisation": localStorage.getItem("token")
                }
            }).then( res => res.json());

            setFileDirectoryMap(resDr.data);

            // fetch file name map from backend
            const resN = await fetch(`http://localhost:3000/getMap/${revisionMethod}/names`,{
                method:"GET",
                headers: {
                    "Content-Type": "application/json",
                    "authorisation": localStorage.getItem("token")
                }
            }).then( res => res.json());

            setFileNameMap(resN.data);

            setFileDirectory(resDr.data['0']);
            setFileNumber('0'); 

        }

        fetchData();

    }, [])


    return(

        <div className="FileBrowser-wrapper">
            
            <div className="FileBrowser-header">

                <h2 className="FileBrowser-title">{ fileTypeCheck(fileNameMap[fileNumber]) }</h2>
                
                < div style={{ display: "flex" }} >
                    { filePath.map( (file) => 
                        <FilePathLink 
                            key={file} 
                            fileName={fileTypeCheck(fileNameMap[file])} 
                            onSelect={() => selectFile(file, false)} 
                            isLast={ file === filePath[filePath.length - 1] }
                        /> 
                    )}
                </div>

            </div>

            { !inFile && <>
                <div className="FileBrowser-mainPage">
                    {fileDirectory.map((file, index) => (
                        <FileBar key={index} folderName={ fileNameMap[file] } onSelect={ () => selectFile(file) } />
                    ))}
                </div>

                <div className="FileBrowser-filebar FileBrowser-newButton" onClick={ () => setCreatingFile(true) } >
                    {
                        creatingFile ? 
                        <input 
                            type="text" 
                            autoFocus
                            placeholder="Enter file name" 
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            style= {{ width:`${ newFileName.length*8 <150 ? 150 : newFileName.length*8 }px`, padding: "6px" }}
                            onKeyDown={ e => { if(e.key === "Enter") { createNewFile(newFileName); }}}
                        /> :
                        <img src={plusIcon} />
                    }
                </div>

            </>}

        </div>

    )

}
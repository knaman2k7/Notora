import { useEffect, useState } from "react"

import FileBrowser from "../FileBrowser/FileBrowser";
import CardsRoot from "./CardRoot"
import ManageCards from "./ManageCards";
import ReviseCards from "./ReviseCards";

export default function Cards(){

    const [curFile, setCurFile] = useState(false);
    const [inFile, setInFile] = useState(false);
    const [interfaceChoice, setInterfaceChoice] = useState("root")

    const interfaceMap = {
        root: <CardsRoot curFile={curFile} setInterfaceChoice={setInterfaceChoice} />,
        revise: <ReviseCards curFile={curFile} traverseBack={() => setInterfaceChoice("root")} />,
        manage: <ManageCards curFile={curFile} traverseBack={() => setInterfaceChoice("root")} />
    }

    useEffect( () => {
        setInterfaceChoice("root")
    },[inFile])

    return (
        <div>
        
            <FileBrowser 
                revisionMethod="cards" 
                inFile={inFile} 
                setInFile={setInFile}
                setCurFile={setCurFile}
                />

            { inFile && interfaceMap[interfaceChoice] }
                
        </div>
    )

}
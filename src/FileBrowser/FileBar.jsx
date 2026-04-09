import "./FileBrowser.css"

import folderIcon from "../assets/folder-icon.png"
import fileIcon from "../assets/file-icon.png"
import cardsIcon from "../assets/cardsIcon.png"

export default function FileBar({folderName, onSelect}){

    if (!folderName) return null;

    return(
        <div className="FileBrowser-filebar" onClick={onSelect}>

            <img 
            src = { folderName.slice(-3) === ".nt" ? fileIcon : 
               ( folderName.slice(-3) === ".cd" ? cardsIcon : folderIcon )
            } 
            />
            <p>{ ( folderName.slice(-3) === ".nt" || folderName.slice(-3) === ".cd" ) ? folderName.slice(0,-3) : folderName}</p>

        </div>
    )

}
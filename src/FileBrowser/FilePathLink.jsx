import "./FileBrowser.css"

export default function FilePathLink({fileName, onSelect, isLast}){

    return (
        <>
            <p className="FileBrowser-PathLink" onClick={onSelect}>
                {fileName}
            </p>
            { isLast ? null : <p>&nbsp; / &nbsp;</p> }
        </>
    )

}
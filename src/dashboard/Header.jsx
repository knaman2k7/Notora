import "./Dashboard.css"

function Header({onSelect, currentMethod}) {

    return (
        <div className="header-navbar">
        
            <h1>Notora</h1>
        
            <p onClick={() => onSelect("Cards")} style={ currentMethod === "Cards" ? {textDecoration: "underline"} : null } >Cards</p>
            <p onClick={() => onSelect("Notes")} style={ currentMethod === "Notes" ? {textDecoration: "underline"} : null }>Notes</p>

        </div>
    )

}

export default Header;
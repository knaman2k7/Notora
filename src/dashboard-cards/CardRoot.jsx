import "./Cards.css"

export default function CardsRoot({curFile, setInterfaceChoice}){

    return(
        <div className="CardsRoot">

            <div className="CardsRoot-Section" onClick={() => setInterfaceChoice("revise")}>
                <p>Revise Cards</p>
            </div>

            <div className="CardsRoot-Section" onClick={() => setInterfaceChoice("manage")}>
                <p>Manage Cards</p>
            </div>

            <div className="CardsRoot-Section-Stats">
                <p>STATS</p>
            </div>

        </div>
    )

}
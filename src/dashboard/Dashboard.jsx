import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "./Header";
import Notes from "../dashboard-notes/Notes";
import Cards from "../dashboard-cards/Cards";

function Dashboard() {

    const [revisionMethod, setRevisionMethod] = useState("Notes");

    return(
        <div className="Dashboard-mainPage">
        
            <Header onSelect={setRevisionMethod} currentMethod={revisionMethod}/>

            {
                revisionMethod === "Notes" ?
                <Notes /> :
                <Cards />
            }
        
        </div>
    )

}

export default Dashboard;
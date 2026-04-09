import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function ProtectedRoute({children}){

    const [authorised, setAuthorised] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect( () => {

        try {

            async function authorise(){

                const res = await fetch("http://localhost:3000/authenticate", {
                    method : "GET",
                    headers: {
                        'Content-Type' : "application/json",
                        authorisation: localStorage.getItem('token')}
                })

                const data = await res.json()

                if (res.ok){
                    setLoading(false);
                    setAuthorised(true);
                }
                else{
                    navigate("/");
                }
            }

            authorise();

        }
        catch (err){
            console.log(err);
            navigate("/");
        }

    },[]);

    if (loading) return <h1 style={{ color:"white" }} >Loading...</h1>
    return authorised ? children: null;
    
}

export default ProtectedRoute;
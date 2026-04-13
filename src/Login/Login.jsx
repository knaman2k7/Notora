import { useState } from "react"
import { useNavigate } from "react-router-dom"

import "./Login.css"
import moon from "../assets/moon.jpg"
import user_icon from "../assets/user-icon.png"
import key from "../assets/key.png"

import InputBox from "./InputBox"

const API = import.meta.env.VITE_API_URL ?? "";

function Login() {

    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [loginError, setLoginError] = useState(null);

    const navigate = useNavigate();

    function handleInput(e){
        if (e.target.placeholder == "Username"){
            setUsername(e.target.value);
        }
        else if (e.target.placeholder == "Password") {
            setPassword(e.target.value);
        }
    }

    async function attemptLogin(){

        try {

            const { token } = await fetch(`${API}/login`, 
                {
                    method: "POST",
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            )
            .then(res => res.json());

            if (!token){
                throw new Error("invalid credientials")
            }

            localStorage.setItem('token', token);

            console.log( "my token", localStorage.getItem('token') );

            navigate("/dashboard");

        } catch (err){
            setLoginError(true);
        }
        

    }

    return (

        <div className="login-page">

            <img src={moon} style={{ boxShadow: "10px 20px 20px rgba(0, 0, 0, 0.4)" }} />
            <div className="login-page-right">

                <h1>Notora</h1>
                <InputBox label="Username" icon={user_icon} placeholder="Username" onChange={handleInput} />
                <InputBox label="Password" icon={key} placeholder="Password" onChange={handleInput}/>
                <button onClick={attemptLogin}>Login</button>
                {loginError ? <p style={{ color:"red", marginTop:20 }}>Login Failed. Retry.</p> : null}
            </div>

        </div>

    )

}

export default Login
import "./Login.css"

function InputBox( {label, icon, placeholder, onChange} ){

    return (

        <div className="login-input-frame">
            <p>{label}</p>
            
            <div className="login-inputBox">

                <img src={icon} />
                <input type="text" placeholder={placeholder} onChange={ (e) => onChange(e)} />

            </div>

        </div>

    )

}

export default InputBox;
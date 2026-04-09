import binIcon from "../assets/binIcon.png"

export default function CardBrief({displayText, onClick, deleteCard}){

    return(
        <div className="Manage-Cards-cardBrief" onClick={onClick}>
            <div dangerouslySetInnerHTML={{ __html: displayText }} />
            <img 
                src={binIcon} 
                onClick={(e) => {
                    e.stopPropagation();
                    deleteCard();
                }} 
            />
        </div>
    )

}
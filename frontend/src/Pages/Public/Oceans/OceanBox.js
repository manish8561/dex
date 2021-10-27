import React from 'react'

function OceanBox(props) {
    return (
        <div className="oceanInfo">
        <div className="oceanInfoTop">
            <img src={props.mainimg} alt="img" />
            <a href="#">
                <img src={props.curIcon} alt="icon" />
            </a>
        </div>
        <div className="oceanInfoText">
            <h3><span>{props.title}</span> Ocean</h3>
            <p>{props.content}</p>
            <a href="#">Coming soon</a>
        </div>
    </div>
    )
}

export default OceanBox

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useHistory } from 'react-router-dom'
import Cookie from 'js-cookie'

function Teams(props) {

    console.log(props.gameData)

    return (
        <div>
            <p>Invite Link</p>
            <input type="text" value={window.location} readOnly />

            {/* <button onClick={handleClick}>Start</button> */}
        </div>
    );
}

export default Teams;

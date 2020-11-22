import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useHistory } from 'react-router-dom'
import Cookie from 'js-cookie'

import createGame from './useCases/createGame.js'
import joinGame from './useCases/joinGame.js'

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

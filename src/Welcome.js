import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useHistory } from 'react-router-dom'
import Cookie from 'js-cookie'

import createGame from './useCases/createGame.js'
import joinGame from './useCases/joinGame.js'

function Welcome(props) {

    const [playerName, setPlayerName] = useState("")
    const history = useHistory()

    let { gameId } = useParams();

    function handleChange(event) {
        setPlayerName(event.target.value)
    }

    async function handleClick() {
        const trimmedName = playerName.trim()

        setPlayerName(trimmedName)

        if (trimmedName == "") {
            alert("Please write your name")
            return
        }

        let playerId

        if (!gameId) {
            const gameData = await createGame(playerName)
            history.push(gameData.gameId)

            playerId = gameData.playerId
            gameId = gameData.gameId
        } else {
            playerId = await joinGame(playerName)
        }

        Cookie.set('playerId', playerId)
        Cookie.set('playerName', playerName)

        props.onStartGame({
            playerId: playerId,
            playerName: playerName,
            gameId: gameId
        })
    }

    return (
        <div>
            <p>Your name</p>
            <input type="text" value={playerName} onChange={handleChange} />

            <button onClick={handleClick}>Start</button>
        </div>
    );
}

export default Welcome;

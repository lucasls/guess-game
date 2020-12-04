import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom'
import Cookie from 'js-cookie'
import './Welcome.css'

import createGame from '../useCases/createGame.js'
import joinGame from '../useCases/joinGame.js'

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

        if (trimmedName === "") {
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
            playerId = await joinGame(gameId, playerName)
        }

        props.onStartGame({
            playerId: playerId,
            playerName: playerName,
            gameId: gameId
        })
    }

    return (
        <div className="components-body">
            <h1 className="blink-text"> Guess Game </h1>
            <h2>Welcome!</h2>
            <p>{!gameId ? "Please write your name down to create a new game." : "Please write your name down to join the game."}</p>
            <input 
            type="text" 
            value={playerName} 
            placeholder = "Your name or nickname"
            onChange={handleChange} />

            <button type="submit" onClick={handleClick}>{!gameId ? "Create Game" : "Join Game"}</button>
        </div>
    );
}

export default Welcome;

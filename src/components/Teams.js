import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useHistory } from 'react-router-dom'
import Cookie from 'js-cookie'

import Team from '../domain/Team'
import GameState from '../domain/GameState'
import setPlayerTeam from '../useCases/setPlayerTeam'
import findGame from '../useCases/findGame'
import setGameState from '../useCases/setGameState'
import './Teams.css'


function Teams(props) {
    const [game, setGame] = useState(props.gameData.game)
    const playerId = props.gameData.playerId

    const isHost = game.players
        .filter(it => it.isHost)
        .map(it => it.id)
        .includes(playerId)

    useEffect(() => {
        const interval = setInterval(async () => {
            const newGame = await findGame(game.id)

            if (newGame.currentState !== GameState.JOIN_GAME) {
                props.onTeamComplete(newGame)
            } else {
                setGame(newGame)
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const greenTeamPlayers = game.players
        .filter(it => it.team === Team.GREEN)

    const blueTeamPlayers = game.players
        .filter(it => it.team === Team.BLUE)

    async function movePlayer(player) {
        const newTeam = player.team === Team.GREEN ? Team.BLUE : Team.GREEN

        const newGame = await setPlayerTeam(game.id, player.id, newTeam)

        setGame(newGame)
    }

    function lines() {
        const max = Math.max(greenTeamPlayers.length, blueTeamPlayers.length)
        let result = []

        for (let i = 0; i < max; i++) {
            const greenPlayer = greenTeamPlayers[i]
            const bluePlayer = blueTeamPlayers[i]
            const greenIsMe = greenPlayer?.id === playerId
            const blueIsMe = bluePlayer?.id === playerId

            const hasGreen = greenPlayer != null
            const hasBlue = bluePlayer != null

            result.push(
                <tr key={i}>
                    <td style={{ fontWeight: greenIsMe ? "bold" : "normal", color:"green" }}>{greenPlayer?.name || ""}</td>
                    <td>{isHost && hasGreen ? <i class="fas fa-arrow-circle-right fa-arrow" onClick={() => movePlayer(greenPlayer)}></i> : ""}</td>
                    <td>{isHost && hasBlue ? <i class="fas fa-arrow-circle-left fa-arrow" onClick={() => movePlayer(bluePlayer)}></i> : ""}</td>
                    <td style={{ fontWeight: blueIsMe ? "bold" : "normal", color: "blue" }}>{bluePlayer?.name || ""}</td>
                </tr>
            )
        }

        return result
    }

    async function handleClick() {
        const newGame = await setGameState(game.id, GameState.ADD_WORDS)
        props.onTeamComplete(newGame)
    }

    return (
        <div className="components-body teams-component">
            <h2>Invite Link</h2>
            <input type="text" value={window.location} readOnly />
            <p className="p-invite">Invite your friends to play with you!</p>

            <h2>Teams</h2>
            <div className="team-table">
            <table>
                <thead>
                    <tr><th className="th-green">Green</th><th></th><th></th><th className="th-blue">Blue</th></tr>
                </thead>
                <tbody>
                    {lines()}
                </tbody>
            </table>
            </div>

            {isHost ? <button onClick={handleClick}>Start Game</button> : "Please wait for the host to start the game" }
        </div>
    );
}

export default Teams;

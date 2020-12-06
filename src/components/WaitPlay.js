import delay from 'delay';
import React, { useEffect, useState } from 'react';
import './WaitPlay.css'
import findGame from '../useCases/findGame'
import { startTurn } from '../useCases/useCases';


function WaitPlay(props) {
    const [game, setGame] = useState(props.gameData.game)

    const playerId = props.gameData.playerId
    const player = game.players.find(player => player.id === playerId)

    const phase = game.currentPhase

    let currentTurnStartedAt
    if (game.currentTurnInfo) {
        currentTurnStartedAt = Date.parse(game.currentTurnInfo.startedAt)
    } else {
        currentTurnStartedAt = null
    }

    async function updateGame() {
        const newGame = await findGame(game.id)
        setGame(newGame)
    }

    useEffect(() => {
        const interval = setInterval(async () => {
            updateGame()
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    function instructions() {

        let phaseText
        switch (phase) {
            case 0:
                phaseText = "One player receives one word/expression and have to explain for the team without saiyng exacly the word neither use synonyms;"
                break;
            case 1:
                phaseText = "One player receives one word/expression and have to explain for the team with just ONE word"
                break;
            case 2:
                phaseText = "One player receives one word/expression and have to explain for the team by mimicry"
                break;
        }
        console.log(game.currentPlayer)

        return <div>
            <p><i class="fas fa-user-alt"></i><b>{phaseText}</b></p>
            <p><i class="fas fa-users"></i>The player's team have to hit the word by writing it in the input box;</p>
            <p><i class="fas fa-user-plus"></i>When the answer is right the player receive a new world while there's time!</p>
            {/* <p>{game.currentTurn === 0 ? "The first player will be" : "Who's playing now is"} */}
            <h2 style={{ color: game.currentPlayer ? game.currentPlayer.team : "", textShadow: "2px 2px black"}}><b>
                {game.currentPlayer ? "Team " + game.currentPlayer.team + " will start this phase" : "Have no players yet"}</b></h2>

        </div>
    }

    const teamsTurn = <span 
        style={{ color: game.currentPlayer ? game.currentPlayer.team : "", textShadow: "2px 2px black"}}
        >Team {game.currentPlayer.team.toLowerCase()}</span>
        

    function playerAndTeam() {
        if (!game.currentTurnInfo) {
            return instructions()
        }

        if (game.currentPlayer.id === playerId) {
            return <div className="wait-play-player">
                <p>The word is</p>
                <h2>Happy Potter</h2>
                <button>Skip this word</button>
            </div>
        }
        if (game.currentPlayer.team === player.team) {
            return <div>
                <input />
                <button> Send </button>
            </div>
        }

        return <div className="wait-play-against-team">
            <h2>It's {teamsTurn} turn.</h2>
            <h2>Please, mute your mic!</h2>
            <i class="fas fa-microphone-slash fa-7x"></i>
        </div>

    }

    const greenPoints = 0
    const bluePoints = 0
    const remainingWords = 10

    async function handleStartTurnClick() {
        await startTurn(game.id)
        updateGame()
    }

    if (!game.currentPlayer) {
        return <div className="components-body wait-play-component">
            <p>Loading</p>
        </div>
    }

    function timer() {
        if (currentTurnStartedAt) {
            const countDown = game.turnDurationSeconds - Math.floor((new Date() - currentTurnStartedAt) / 1000)
            return <p>{countDown >= 0 ? countDown : 0}s</p>
        }
    }

    const playNowHTML = game.currentPlayer 
        ? <span><strong>Plays now: </strong>{game.currentPlayer.name}</span>
        : "Have no current player"

    const playNextHTML = game.nextPlayer 
        ? <span><strong>Plays next: </strong> {game.nextPlayer.name} </span>
        : ""

    return <div className="components-body wait-play-component">

        <div className="wait-play-header">
            <p>Remaining words: {remainingWords}</p>
            <p>Green <span>{greenPoints}</span> x <span>{bluePoints}</span> Blue</p>
        </div>

        <h1> Phase {phase + 1} </h1>

        {timer()}

        {playerAndTeam()}

        <div className="wait-play-information">
            <p>{playNowHTML}</p>
            <p>{playNextHTML}</p>
        </div>

        {player.isHost && !game.currentTurnInfo ? <button onClick={handleStartTurnClick}>Start Turn</button> : ""}

    </div>

}

export default WaitPlay;
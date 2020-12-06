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

    useEffect(() => {
        const interval = setInterval(async () => {
            const newGame = await findGame(game.id)
            setGame(newGame)
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
            <h2 style={{ color: game.currentPlayer ? game.currentPlayer.team:""}}><b>
                {game.currentPlayer ? "Team " + game.currentPlayer.team + " will start this phase" : "Have no players yet"}</b></h2>

        </div>
    }

    function playerAndTeam() {
        if (!game.currentTurnInfo) {
            return instructions()
        }

        if (game.currentPlayer.id === playerId) {
            return <div>
                {/* <p>{playWord}</p> */}
                <button>Skip</button>
            </div>
        }
        if (game.currentPlayer.team === player.team) {
            return <div>
                <input />
                <button> Send </button>
            </div>
        }


        return <div>
            <p>It's {game.currentPlayer.team.toLowerCase()} turn, mute your mic please!</p>
            <i class="fas fa-microphone-slash"></i>
        </div>

    }

    const greenPoints = 0
    const bluePoints = 0
    const remainingWords = 10

    async function handleStartTurnClick() {
        await startTurn(game.id)
        const newGame = await findGame(game.id)
        setGame(newGame)
    }

    if (!game.currentPlayer) {
        return <div className="components-body wait-play-component">
            <p>Loading</p>
        </div>
    }

    return <div className="components-body wait-play-component">

        <div className="wait-play-header">
            <p>Remaining words: {remainingWords}</p>
            <p>Green <span>{greenPoints}</span> x <span>{bluePoints}</span> Blue</p>
        </div>

        <h1> Phase {phase + 1} </h1>

        {playerAndTeam()}

        <div className="wait-play-information">
            <p>{game.currentPlayer ?"Plays now: " + game.currentPlayer.name : "Have no current player"}</p>
            <p>{game.nextPlayer ? "Plays next: "+ game.nextPlayer.name : ""}</p>
        </div>

        {player.isHost && !game.currentTurnInfo ? <button onClick={handleStartTurnClick}>Start Turn</button> : ""}

    </div>

}

export default WaitPlay;
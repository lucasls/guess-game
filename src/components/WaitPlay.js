import delay from 'delay';
import React, { useEffect, useState } from 'react';
import './WaitPlay.css'


function WaitPlay(props) {
    const game = props.gameData.game
    const playerId = props.gameData.playerId
    const player = game.players.find(player => player.id === playerId)

    const [instructionsTimer, setInstructionsTimer] = useState(7)
    const phase = game.currentPhase

    useEffect(
        async () => {
            
            let timer = instructionsTimer
            while(timer > 0) {
                await delay(1000)
                timer--
                setInstructionsTimer(timer)
            }

        }, []
    )

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

        return <div>
            <p>{phaseText}</p>
            <p>The player's team have to hit the word by writing it in the input box;</p>
            <p>When the answer is right the player receive a new world while there's time!</p>
            <p>{game.currentTurn === 0 ? "The first player will be" : "Who's playing now is"} {game.currentPlayer.name}</p>
            <p>Game starts in {instructionsTimer}s</p>
        </div>
    }

    function playerAndTeam() {
        if (instructionsTimer > 0) {
            return instructions()
        }

        if(game.currentPlayer.id === playerId) {
            return <div>
                {/* <p>{playWord}</p> */}
                <button>Skip</button>
            </div>
        }
        if(game.currentPlayer.team === player.team) {
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


    return <div className="components-body wait-play-component">
        <p>Green <span>{greenPoints}</span> x <span>{bluePoints}</span> Blue</p>
        <h1> Phase {phase + 1} </h1>
        <p>Remaining words: {remainingWords}</p>

        {playerAndTeam()}

        <p>Now: {game.currentPlayer.name}</p>
        <p>Next: {game.nextPlayer.name}</p>

    </div>

}

export default WaitPlay;
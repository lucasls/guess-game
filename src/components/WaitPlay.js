import delay from 'delay';
import React, { useEffect, useState } from 'react';
import './WaitPlay.css'
import findGame from '../useCases/findGame'
import { deletePlayer, guessWord, skipWord, startTurn } from '../useCases/useCases';
import Team from '../domain/Team';
import GameState from '../domain/GameState';


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

    function capitalizeTeam(teamName) {
        return teamName.charAt(0).toUpperCase() + teamName.slice(1).toLowerCase()
    }

    async function updateGame() {
        const newGame = await findGame(game.id)

        if (newGame.currentState === GameState.GAME_RESULTS) {
            props.onResult(newGame)
            return
        }
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
                phaseText = "Player: explains the word to the team using phrases"
                break;
            case 1:
                phaseText = "Player:explains the word to the team with just ONE word"
                break;
            case 2:
                phaseText = "Player: explains the word to the team by mimicry"
                break;
        }

        return <div>
            <p><i class="fas fa-user-alt"></i><b>{phaseText}</b></p>
            <p><i class="fas fa-users"></i>Team: has to guess the word;</p>
            <p><i class="fas fa-user-plus"></i>Player receives a new word until time's up!</p>
            <h2 style={{ color: game.currentPlayer ? game.currentPlayer.team : "", textShadow: "2px 2px black" }}>
                {game.currentPlayer ? "Team " + capitalizeTeam(game.currentPlayer.team) + " goes now" : "Have no players yet"}</h2>

        </div>
    }

    const teamsTurn = <span style={{ color: game.currentPlayer?.team || "", textShadow: "2px 2px black" }}>
        Team {capitalizeTeam(game.currentPlayer.team)}
    </span>

    async function handleSendClick() {
        const guessRight = await guessWord(game.id)
    }

    function playerAndTeam() {
        if (!game.currentTurnInfo || !game.wordToGuess) {
            return instructions()
        }

        if (game.currentPlayer.id === playerId) {
            function handleSkipClick() {
                skipWord(game.id, game.wordToGuess.id)
            }

            return <div className="wait-play-player">
                <p>The word is</p>
                <h2>{game.wordToGuess.content}</h2>

                <div className="guess-buttons">
                    <button className="button-guessed" onClick={handleSendClick}>Guessed!</button>
                    <button className="button-skip" onClick={handleSkipClick}>Skip word</button>
                </div>
            </div>
        }
        if (game.currentPlayer.team === player.team) {

            return <div className="player-team">
                <h2>Say what you think it is!</h2>
                <h2>The faster you figure out the better!</h2>
            </div>
        }

        return <div className="wait-play-against-team">
            <h2>It's {teamsTurn}'s turn.</h2>
            <h2>Please, mute your mic!</h2>
            <i class="fas fa-microphone-slash fa-7x"></i>
        </div>

    }

    const greenPoints = game.points[Team.GREEN] || 0
    const bluePoints = game.points[Team.BLUE] || 0

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

    function playersToRemove() {
        if (!game.players || !player.isHost) {
            return ""
        }

        async function handleRemoveClick(p) {
            if (window.confirm(`Are you sure you want do remove ${p.name}?`)) {
                await deletePlayer(game.id, p.id)
                alert(`${p.name} removed`)
            }
        }

        const items = game.players
            .filter(p => !p.isHost)
            .map(p => (<p>{p.name} <i class="fas fa-times-circle" onClick={() => handleRemoveClick(p)}></i></p>))

        return <div>
            <h2>Remove players</h2>
            <div className="remove-players">
                {items}
            </div>
        </div>
    }

    return <div className="components-body wait-play-component">

        <div className="wait-play-header">
            <p>Remaining words: {game.currentPhaseInfo.remainingWords}</p>
            <p>Green <span>{greenPoints}</span> x <span>{bluePoints}</span> Blue</p>
        </div>

        <h2 style={{ color: player.team, textShadow: "2px 2px black" }}>You are part of Team {capitalizeTeam(player.team)}</h2>
        <h1> Phase {phase + 1} </h1>

        {timer()}

        {playerAndTeam()}

        <div className="wait-play-information">
            <p>{playNowHTML}</p>
            <p>{playNextHTML}</p>
        </div>

        {player.isHost && !game.currentTurnInfo ? <button onClick={handleStartTurnClick}>Start Turn</button> : ""}

        {playersToRemove()}

    </div>

}

export default WaitPlay;
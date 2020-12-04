import React, { useEffect, useState } from 'react';
import Welcome from './Welcome.js'
import Teams from './Teams.js'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    useParams,
    useHistory
} from 'react-router-dom'
import Cookie from 'js-cookie'

import findGame from '../useCases/findGame'
import GameState from '../domain/GameState'
import AddWords from './AddWords.js';
import WaitPlay from './WaitPlay.js'

function App() {

    function Current() {
        const [game, setGame] = useState(null)

        const history = useHistory()
        let { gameId } = useParams();
        const playerId = Cookie.get("playerId")

        async function loadGame() {
            const game = await findGame(gameId)

            if (!game) {
                history.push("/")
            } else {
                setGame(game)
            }
        }

        const hasPlayer = () => game.players
            .map(it => it.id)
            .includes(playerId)

        let gameState

        if (!gameId || !playerId) {
            gameState = GameState.WELCOME
        } else if (!game) {
            gameState = GameState.LOADING_GAME
            loadGame()
        } else if (!hasPlayer()) {
            gameState = GameState.WELCOME
        } else {
            gameState = game.currentState
        }

        async function handleStartGame(newGameData) {
            Cookie.set('playerId', newGameData.playerId)
            
            const game = await findGame(newGameData.gameId)
            setGame(game)
        }

        function handleTeamComplete(game) {
            setGame(game)
        }

        function hanldeAllWordsSent() {
            const newGame = {...game}
            newGame.currentState = GameState.PLAYING
            setGame(newGame)
        }

        const gameData = {
            playerId: playerId,
            game: game
        }

        switch (gameState) {
            case GameState.LOADING_GAME: return (<div>Loading...</div>)
            case GameState.WELCOME: return (<Welcome onStartGame={handleStartGame} />)
            case GameState.JOIN_GAME: return (<Teams gameData={gameData} onTeamComplete={handleTeamComplete} />)
            case GameState.ADD_WORDS: return (<AddWords onAllWordsSent={hanldeAllWordsSent} />)
            case GameState.PLAYING: return (<WaitPlay />)
        }
    }

    return (
        <Router>
            <Switch>
                <Route path="/:gameId?" >
                    <Current />
                    <footer>Developed by Lucas and Nicole</footer>
                </Route>
            </Switch>
        </Router>
    );
}

export default App;

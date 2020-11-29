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

function App() {

    function Current() {
        const [gameState, setGameState] = useState(GameState.LOADING_GAME)
        const history = useHistory()

        let { gameId } = useParams();
        const playerId = Cookie.get("playerId")

        async function loadGame() {
            const game = await findGame(gameId)

            const hasPlayer = () => game.players
                .map(it => it.id)
                .includes(playerId)

            if (!game) {
                history.push("/")
            } else if (hasPlayer()) {
                setGameState(game.currentState)
            } else {
                setGameState(GameState.WELCOME)            
            }
        }

        if (gameState === GameState.LOADING_GAME) {
            if (!gameId || !playerId) {
                setGameState(GameState.WELCOME)
            } else {
                loadGame()
            }
        }

        function handleStartGame(newGameData) {

            Cookie.set('playerId', newGameData.playerId)

            setGameState(GameState.JOIN_GAME)
        }

        const gameData = {
            gameId: gameId,
            playerId: Cookie.get("playerId"),
            playerName: Cookie.get("playerName")
        }

        switch (gameState) {
            case GameState.LOADING_GAME: return (<div>Loading...</div>)
            case GameState.WELCOME: return (<Welcome onStartGame={handleStartGame} />)
            case GameState.JOIN_GAME: return (<Teams gameData={gameData} />)
            case GameState.ADD_WORDS: return (<div>Add your words</div>)
        }
    }

    return (
        <Router>
            <Switch>
                <Route path="/:gameId?" >
                    <Current />
                    <footer>Developed by Lu e Ni</footer>
                </Route>
            </Switch>
        </Router>
    );
}

export default App;

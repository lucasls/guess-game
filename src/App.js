import React, { useEffect, useState } from 'react';
import Welcome from './Welcome.js'
import Teams from './Teams.js'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    useParams
} from 'react-router-dom'
import Cookie from 'js-cookie'

function App() {

    const [currentPage, setCurrentPage] = useState("welcome")

    function Current() {
        let { gameId } = useParams();

        function handleStartGame(newGameData) {
            setCurrentPage("teams")
        }

        const gameData = {
            gameId: gameId,
            playerId: Cookie.get("playerId"),
            playerName: Cookie.get("playerName")
        }

        switch (currentPage) {
            case "welcome": return (<Welcome onStartGame={handleStartGame} />)
            case "teams": return (<Teams gameData={gameData} />)
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

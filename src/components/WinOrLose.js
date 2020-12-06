import React from 'react';
import './WinOrLose.css'

function WinOrLose(props) {
    const isWinner = "BLUE"
    const isLoser = "GREEN"
    const game = props.gameData.game
    const player = game.currentPlayer
    let text
    let img

    if (player.team === isWinner) {
        text = `Team ${isWinner} won!`
        img = <img src="https://media.giphy.com/media/FsWz0rmksvYUU/giphy-downsized.gif"></img>
    } else {
        text = `Team ${isLoser} lose`
        img = <img src="https://media.giphy.com/media/lKshIuRwlRooBiB6GG/giphy-downsized.gif"></img>
    }

    return <div className="components-body win-or-lose">
        <h1>{text}</h1>
        {img}

        <div>
            <button style={{ display: player.isHost ? "none" : "" }}>Play Again</button>
            <button>Close Game</button>
        </div>
    </div>


}

export default WinOrLose;

import React from 'react';
import './WinOrLose.css'
import ImagePreloader from 'image-preloader'
import Team from '../domain/Team';

const IMG_WIN = "https://media.giphy.com/media/FsWz0rmksvYUU/giphy-downsized.gif"
const IMG_LOSE = "https://media.giphy.com/media/lKshIuRwlRooBiB6GG/giphy-downsized.gif"

function WinOrLose(props) {
    const game = props.gameData.game
    const playerId = props.gameData.playerId
    const player = game.players.find(player => player.id === playerId)
    let text
    let img

    const greenPoints = game.points[Team.GREEN] || 0
    const bluePoints = game.points[Team.BLUE] || 0

    let winner
    if (greenPoints > bluePoints) {
        winner = Team.GREEN
    } else if (greenPoints < bluePoints) {
        winner = Team.BLUE
    } else {
        winner = null
    }
    

    if (player.team === winner) {
        text = `Team ${player.team} wins!`
        img = <img src={IMG_WIN}></img>
    } else {
        text = `Team ${player.team} loses`
        img = <img src={IMG_LOSE}></img>
    }

    return <div className="components-body win-or-lose">
        <h1>{text}</h1>
        <p>Green <span>{greenPoints}</span> x <span>{bluePoints}</span> Blue</p>
        {img}
    </div>


}

WinOrLose.preloadImages = function() {
    ImagePreloader.simplePreload(IMG_WIN)
    ImagePreloader.simplePreload(IMG_LOSE)
}

export default WinOrLose;

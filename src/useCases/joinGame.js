import axios from 'axios'

const apiUrl = process.env.REACT_APP_API_URL

async function joinGame(gameId, playerName) {
    let response = await axios.post(`${apiUrl}/games/${gameId}/players/`, {
        playerName: playerName
    })

    return response.data.playerId
}

export default joinGame
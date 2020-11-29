import axios from 'axios'

const apiUrl = process.env.REACT_APP_API_URL

async function setGameState(gameId, state) {
    const response = await axios.post(`${apiUrl}/games/${gameId}/set-state`, {
        state: state
    })

    return response.data
}

export default setGameState
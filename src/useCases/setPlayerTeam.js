import axios from 'axios'

const apiUrl = process.env.REACT_APP_API_URL

async function setPlayerTeam(gameId, playerId, team) {
    const response = await axios.post(`${apiUrl}/games/${gameId}/players/${playerId}/set-team`, {
        team: team
    })

    return response.data
}

export default setPlayerTeam
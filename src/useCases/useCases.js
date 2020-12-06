import axios from 'axios'

const apiUrl = process.env.REACT_APP_API_URL

export async function addWords(gameId, playerId, words) {
    const response = await axios.post(`${apiUrl}/games/${gameId}/players/${playerId}/words/`, {
        words: words
    })

    return response.data
}

export async function findPlayerWords(gameId, playerId) {
    const response = await axios.get(`${apiUrl}/games/${gameId}/players/${playerId}/words/`)
    return response.data.words
}

export async function findPlayersWithoutWords(gameId) {
    const response = await axios.get(`${apiUrl}/games/${gameId}/players/without-words`)
    return response.data.players
}

export async function startTurn(gameId) {
    await axios.post(`${apiUrl}/games/${gameId}/start-turn`)
}

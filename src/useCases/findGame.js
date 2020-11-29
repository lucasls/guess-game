import axios from 'axios'
import delay from 'delay'

const apiUrl = process.env.REACT_APP_API_URL

async function findGame(gameId) {

    let response = await axios.get(`${apiUrl}/games/${gameId}`)

    return response.data
}

export default findGame
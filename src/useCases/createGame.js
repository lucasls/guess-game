
import {v4 as uuidV4} from 'uuid'
import axios from 'axios'

const apiUrl = process.env.REACT_APP_API_URL

async function createGame(playerName) {

    let response = await axios.post(`${apiUrl}/games/`, {
        playerName: playerName
    })

    return response.data
}

export default createGame
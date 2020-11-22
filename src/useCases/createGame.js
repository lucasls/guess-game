
import {v4 as uuidV4} from 'uuid'
import axios from 'axios'

async function createGame(playerName) {

    let response = await axios.post("/games/", {
        playerName: playerName
    })

    return response.data
}

export default createGame
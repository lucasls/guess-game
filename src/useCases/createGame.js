
import {v4 as uuidV4} from 'uuid'

function createGame(playerName) {
    // TODO call backend

    return {
        gameId: uuidV4(),
        playerId: uuidV4()
    }
}

export default createGame
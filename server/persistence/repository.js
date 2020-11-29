const MongoClient = require('mongodb').MongoClient;

const url = process.env.MONGO_URL

const connPromise = init()

async function init() {
    const conn = await MongoClient.connect(url)
    const db = conn.db()
    await db.collection("games").createIndex({ id: 1 })
    return conn
}

exports.createGame = async function (game) {
    const conn = await connPromise
    const db = conn.db()

    await db.collection("games").insertOne(game)
}

exports.joinGame = async function (gameId, player) {
    const conn = await connPromise
    const db = conn.db()

    await db.collection("games").updateOne(
        { id: gameId },
        {
            $push: {
                players: player
            }
        }
    )
}
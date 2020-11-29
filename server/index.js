require('dotenv').config()
const express = require("express");
const path = require('path');
const bodyParser = require('body-parser')
const cors = require('cors')
const createGame = require('./useCases/createGame')
const joinGame = require('./useCases/joinGame')
const findGame = require('./useCases/findGame')

const app = express();

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../build')));

if (process.env.USE_CORS) {
    app.use(cors())
}

function handle(block) {
    return async (req, res, next) => {
        try {
            res.json(await block(req))
        } catch (e) {
            next(e)
        }
    }
}

app.post(
    '/games/',
    handle(async req => await createGame(req.body.playerName))
)

app.post(
    '/games/:gameId/players/', 
    handle(async req => await joinGame(req.params.gameId, req.body.playerName))
)

app.get(
    '/games/:gameId',
    handle(async req => await findGame(req.params.gameId))
)

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});
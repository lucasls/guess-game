const express = require("express");
const path = require('path');
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../build')));

app.post('/games/',  (req, res) => {
    console.log(`O jogadador ${req.body.playerName} iniciou o jogo`)
    
    res.json({
        gameId: uuidv4(),
        playerId: uuidv4()
    })
});

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});
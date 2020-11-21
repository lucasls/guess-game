const express = require("express");
const path = require('path');
const app = express(); // create express app

const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, '../build')));

app.get('/backend/players',  (req, res) => {
    res.json("a")
});

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});
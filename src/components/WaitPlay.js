import React, { useState } from 'react';

function WaitPlay() {

    const [round, setRound] = useState([1])

    // if all the players tiverem terminado -função que estará nas palavras
    // retornar a tela de ready e dar setTime out para comecar o jogo

    // se for a vez do jogador retornar as palavras

    // se for a vez do meu time

    // se não for a vez do meu time



    return <div className="components-body">
        <h1> Round {round} </h1>
        <ul>
            {/* <li>{roundText}</li> */}
            <li>One player receives one word/expression and have to explain for the team without saiyng exacly the word neither use synonyms; </li>
            <li>The player's team have to hit the word by writing it in the input box;</li>
            <li>When the answer is right the player receive a new world while there's time!</li>
        </ul>
        <p>Atention!</p>
        <ul>
            <li>Each player's turn lasts 5 minutes;</li>
            <li>If the word is too hard, it can be skiped but the player will lose 2 seconds</li>
        </ul>

        <p>First player: Nicole</p>

    </div>
}

export default WaitPlay;
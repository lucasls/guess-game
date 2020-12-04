import { set } from 'js-cookie';
import React, { useState } from 'react';
import GameState from '../domain/GameState';
import setGameState from '../useCases/setGameState';
import './AddWords.css'


const NUM_WORDS = 5

function AddWords(props) {

    const [words, setWords] = useState(Array(NUM_WORDS).fill(""))
    const [ready, setReady] = useState(false)

    function wordInput(word, i) {
        function handleChange(event) {
            const newWords = [...words]
            newWords[i] = event.target.value
            setWords(newWords)
        }

        function handleBlur() {
            const newWords = [...words]

            let newWord = newWords[i].trim()
            newWord = newWord.charAt(0).toUpperCase() + newWord.slice(1)
            newWords[i] = newWord
            setWords(newWords)
        }

        return <p key={i}>
            <input type="text" value={word} onChange={handleChange} onBlur={handleBlur} />
        </p>
    }

    // if the gamer didn't write 5 words, alert she or he if had goes to the wait room

    function handleClick() {
        const emptyInput = words.some(word => word === "")

        if(emptyInput) {
            alert("mano tya vazia")
        } else {
            setReady(true)
        }

        // TODO replace with real code
        if (words[0] === "PLAY") {
            props.onAllWordsSent()
        }
    }

    if(ready) {
        // while all the gamers didn't finished to send the words
        // return <div className="components-body">
        //     <h2>We'll start soon</h2>
        //     <p> Please wait until all the gamers finish sending the words.</p>
        //     <img src="https://media.giphy.com/media/UuebWyG4pts3rboawU/giphy-downsized.gif"></img>
        // </div>
        // when all the gamers finish
        return <div className="components-body">
            <h2 className="ready-text">Everybody ready?</h2>
            <h2> Let's start!</h2>
            <img src="https://media.giphy.com/media/qzJPSZ0mClSUw/giphy-downsized.gif"></img>
        </div>
    }
    return (
        <div className="components-body">
            <h2>Add {NUM_WORDS} words or expressions</h2>
            <p>Please write international references otherwise the other players might not know about what it is!</p>
            <p className="p-tip"> Tips: singers, songs, movies, companies, actors/actresses, characters, politicians, etc </p>
            {words.map(wordInput)}
            <button type="submit" onClick={handleClick}> Send words</button>
        </div>
    );
}

export default AddWords;

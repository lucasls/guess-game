import { set } from 'js-cookie';
import React, { useState, useEffect } from 'react';
import GameState from '../domain/GameState';
import setGameState from '../useCases/setGameState';
import './AddWords.css'
import WaitPlay from './WaitPlay';
import delay from 'delay'
import { addWords, findPlayerWords, findPlayersWithoutWords } from '../useCases/useCases'



const NUM_WORDS = 5

function AddWords(props) {

    const [words, setWords] = useState([])
    const [ready, setReady] = useState(false)
    const [remainingPlayers, setRemainingPlayers] = useState(null)

    const playerId = props.gameData.playerId
    const gameId = props.gameData.game.id

    useEffect(async () => {
        const words = await findPlayerWords(gameId, playerId)

        if (words.length === 5) {
            setWords(words)
            await wordsReady()
        } else {
            setWords(Array(NUM_WORDS).fill(""))
        }
    }, [])

    async function wordsReady() {
        setReady(true)

        let playersWithoutWords
        do {
            playersWithoutWords = await findPlayersWithoutWords(gameId)
            setRemainingPlayers(playersWithoutWords)
            await delay(1000)
        } while(playersWithoutWords.length !== 0)

        await delay(2000)

        props.onAllWordsSent()
    }

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

    async function handleClick() {
        const emptyInput = words.some(word => word === "")

        if (emptyInput) {
            alert(`Please write all ${NUM_WORDS} words`)
            return
        }
        
        await addWords(gameId, playerId, words)
        
        await wordsReady()
    }


    if (ready && remainingPlayers) {

        if (remainingPlayers.length !== 0) {
            return <div className="components-body gif-text">
                <h2 className="add-words-text">We'll start soon</h2>
                <p> Please wait until all the gamers finish sending the words.</p>
                <img src="https://media.giphy.com/media/UuebWyG4pts3rboawU/giphy-downsized.gif"></img>
                <ul>
                    { remainingPlayers.map(p => <p> {p.name} didn't send their words </p>) }
                </ul>
            </div>
        }

        return <div className="components-body gif-text">
            <h2 className="ready-text">Everybody ready?</h2>
            <h2> Let's start!</h2>
            <img src="https://media.giphy.com/media/qzJPSZ0mClSUw/giphy-downsized.gif"></img>
        </div>
    }

    if (words.length === 0) {
        return (
            <div className="components-body">
                Loading...
            </div>
        )
    }

    return (
        <div className="components-body add-words">
            <h2>Add {NUM_WORDS} words or expressions</h2>
            <p className="add-words-sub">Please write international references otherwise the other players might not know about what it is!</p>
            <p className="p-tip"> Tips: singers, songs, movies, companies, actors/actresses, characters, politicians, etc </p>
            {words.map(wordInput)}
            <button type="submit" onClick={handleClick}> Send words</button>
        </div>
    );


}

export default AddWords;

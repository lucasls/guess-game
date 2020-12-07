import { set } from 'js-cookie';
import React, { useState, useEffect } from 'react';

import './AddWords.css'
import delay from 'delay'
import { addWords, findPlayerWords, findPlayersWithoutWords } from '../useCases/useCases'
import ImagePreloader from 'image-preloader'


const NUM_WORDS = 5
const IMG_WAITING = "https://media.giphy.com/media/UuebWyG4pts3rboawU/giphy-downsized.gif"
const IMG_START = "https://media.giphy.com/media/qzJPSZ0mClSUw/giphy-downsized.gif"

function AddWords(props) {

    const [words, setWords] = useState([])
    const [ready, setReady] = useState(false)
    const [remainingPlayers, setRemainingPlayers] = useState(null)
    const [emptyWords, setEmptyWords] = useState(false)

    const playerId = props.gameData.playerId
    const gameId = props.gameData.game.id

    useEffect(async () => {
        ImagePreloader.simplePreload(IMG_WAITING)
        ImagePreloader.simplePreload(IMG_START)

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

        await delay(3000)

        props.onAllWordsSent()
    }

    function wordInput(word, i) {
        function handleChange(event) {
            const newWords = [...words]
            newWords[i] = event.target.value
            setWords(newWords)
            setEmptyWords(false)
        }

        function handleBlur() {
            const newWords = [...words]

            let newWord = newWords[i].trim()
            newWord = newWord.charAt(0).toUpperCase() + newWord.slice(1)
            newWords[i] = newWord
            setWords(newWords)
        }


        return <p key={i}>
            <input 
            type="text" value={word} 
            onChange={handleChange} 
            onBlur={handleBlur} />
        </p>
    }

    async function handleClick() {
        const emptyInput = words.some(word => word === "")

        if (emptyInput) {
            setEmptyWords(true)
            return
        }
        
        await addWords(gameId, playerId, words)
        
        await wordsReady()
    }


    if (ready && remainingPlayers) {

        if (remainingPlayers.length !== 0) {
            return <div className="components-body gif-text">
                <h2 className="add-words-text">We'll start soon</h2>
                <p> Please wait for the other players to finish sending their words.</p>
                <img src={IMG_WAITING}></img>
                <ul>
                    { remainingPlayers.map(p => <p> {p.name} didn't send their words </p>) }
                </ul>
            </div>
        }

        return <div className="components-body gif-text">
            <h2 className="ready-text">Everybody ready?</h2>
            <h2> Let's start!</h2>
            <img src={IMG_START}></img>
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
            <p className="add-words-sub">Please use international references, otherwise the other players might not know what it is about!</p>
            <p className="p-tip"> Tips: singers, songs, movies, companies, actors/actresses, characters, politicians, etc </p>
            <p className="alert-words" style={{visibility:emptyWords? "" : "hidden"}}>There are some empty entries!</p>
            {words.map(wordInput)}
            <button type="submit" onClick={handleClick}> Send words</button>
        </div>
    );


}

export default AddWords;

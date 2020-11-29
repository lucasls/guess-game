import React, { useState } from 'react';

const NUM_WORDS = 5

function AddWords(props) {

    const [words, setWords] = useState(Array(NUM_WORDS).fill(""))

    console.log(words)

    function wordInput(word, i) {
        function handleChange(event) {
            const newWords = [...words]
            newWords[i] = event.target.value
            setWords(newWords)
        }

        return <p key={i}>
            <input type="text" value={word} onChange={handleChange} />
        </p>
    }
    
    return (
        <div>
            <h1>Add {NUM_WORDS} words or expressions</h1>
            {words.map(wordInput)}
        </div>
    );
}

export default AddWords;

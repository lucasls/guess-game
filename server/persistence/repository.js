const { Pool } = require('pg')

const pool = new Pool()

async function init() {
    await pool.query(`
        create table if not exists game (
            game_id uuid primary key,
            current_state text,
            current_phase int,
            current_turn int
        )
    `)

    await pool.query(`
        create table if not exists player (
            game_id uuid,
            player_id uuid,
            name text,
            is_host bool,
            primary key(game_id, player_id)
        )
    `)

    await pool.query(`
        create table if not exists word (
            game_id uuid,
            word_id uuid,
            content text,
            player_id uuid,
            primary key(game_id, word_id)
        )
    `)

    await pool.query(`
        create table if not exists turn_player_word (
            game_id uuid,
            phase int,
            turn int,
            player_id uuid,
            word_id uuid,
            guessed bool,
            primary key(game_id, phase, turn)
        )
    `)
}

init()

async function createPlayer(gameId, player) {
    await pool.query(`
        insert into player values(
            $1, $2, $3, $4
        )`,
        [gameId, player.id, player.name, player.isHost]
    )
}

exports.createGame = async function (game) {
    await pool.query(`
        insert into game values(
            $1, $2, $3, $4
        )`,
        [game.id, game.currentState, game.currentPhase, game.currentTurn]
    )

    for (player of game.players) {
        await createPlayer(game.id, player)
    }
}

exports.joinGame = async function (gameId, player) {
    await createPlayer(gameId, player)
}
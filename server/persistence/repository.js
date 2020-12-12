const { Pool } = require('pg')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

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
            team text,
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
        drop table if exists turn_player_word
    `)

    await pool.query(`
        create table if not exists turn (
            game_id uuid,
            phase int,
            turn_order int,
            player_id uuid,
            player_order int,
            started_at timestamptz,
            primary key(game_id, phase, turn_order)
        )
    `)

    await pool.query(`
        create table if not exists turn_word (
            game_id uuid,
            phase int,
            turn_order int,
            word_order int,
            word_id uuid,
            guessed bool,
            skips int,
            primary key(game_id, phase, turn_order, word_order)
        )
    `)

}

init()

async function createPlayer(gameId, player) {
    await pool.query(`
        insert into player values(
            $1, $2, $3, $4, $5
        )`,
        [gameId, player.id, player.name, player.isHost, player.team]
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

exports.findGame = async function (gameId) {
    const res = await pool.query(`
        select * from game g
        join player p on p.game_id = g.game_id
        where g.game_id = $1`,
        [gameId]
    )

    if (res.rows.length === 0) {
        return null
    }

    const gameRow = res.rows[0]

    return {
        id: gameRow.game_id,
        currentPhase: gameRow.current_phase,
        currentTurn: gameRow.current_turn,
        currentState: gameRow.current_state,
        players: res.rows.map(playerRow => (
            {
                id: playerRow.player_id,
                name: playerRow.name,
                isHost: playerRow.is_host,
                team: playerRow.team
            }
        ))
    }
}

exports.setPlayerTeam = async function (gameId, playerId, team) {
    await pool.query(`
        update player p
        set team = $1
        where p.game_id = $2
        and p.player_id = $3`,
        [
            team, gameId, playerId
        ]
    )
}

exports.setGameState = async function (gameId, state) {
    await pool.query(`
        update game g
        set current_state = $1
        where g.game_id = $2`,
        [
            state, gameId
        ]
    )
}

exports.addWords = async function(gameId, words) {
    await pool.query(`
        delete from word w
        where w.game_id = $1 and w.player_id = $2
        `,
        [
            gameId, words[0].playerId
        ]
    )

    for (let word of words) {
        await pool.query(`
            insert into word values(
                $1, $2, $3, $4
            )`,
            [
                gameId, word.id, word.content, word.playerId
            ]
        )
    }
}

exports.findPlayerWords = async function(gameId, playerId) {
    const res =  await pool.query(`
        select * from word w
        where w.game_id = $1 and w.player_id = $2
        `,
        [
            gameId, playerId
        ]
    )

    return res.rows.map(row => ({
        id: row.word_id,
        playerId: playerId,
        content: row.content
    }))
}

exports.findPlayersWithoutWords = async function(gameId) {
    const res =  await pool.query(`
        select * from player p
        where p.game_id = $1
        and p.player_id not in (
            select w.player_id from word w
            where w.game_id = p.game_id
        )
        `,
        [gameId]
    )

    return res.rows.map(row =>  ({
        id: row.player_id,
        name: row.name,
        isHost: row.is_host,
        team: row.team
    }))
}

exports.findTurn = async function(gameId, phase, turnOrder) {
    const res =  await pool.query(`
        select * from turn t
        where t.game_id = $1
        and t.phase = $2
        and t.turn_order = $3
        `,
        [gameId, phase, turnOrder]
    )

    if (res.rows.length === 0) {
        return null
    }

    return res.rows.map(row =>  ({
        order: row.turn_order,
        playerId: row.player_id,
        playerOrder: row.player_order,
        startedAt: row.started_at
    }))[0]
}

exports.createTurn = async function(gameId, phase, turn) {
    await pool.query(`
        insert into turn values(
            $1, $2, $3, $4, $5, $6
        )`,
        [gameId, phase, turn.order, turn.playerId, turn.playerOrder, turn.startedAt]
    )
}

exports.updateGameTurn = async function(gameId, turn) {
    await pool.query(`
        update game
        set current_turn = $1
        where game_id = $2`,
        [turn, gameId]
    )
}

exports.updateGamePhaseAndTurn = async function(gameId, phase, turn) {
    await pool.query(`
        update game
        set current_phase = $1,
        current_turn = $2
        where game_id = $3`,
        [phase, turn, gameId]
    )
}

exports.findNumRemainingWordsInPhase = async function(gameId, phase) {
    const res =  await pool.query(`
        select count(*) from word w
        where true
        and (w.game_id, w.word_id) not in (
            select game_id, word_id
            from turn_word tw
            where w.game_id = tw.game_id
            and w.word_id = tw.word_id
            and tw.phase = $1
            and tw.guessed
        )
        and w.game_id = $2`,
        [phase, gameId]
    )

    return parseInt(res.rows[0].count)
}

exports.findRemainingWordsInPhaseRandomly = async function(gameId, phase) {
    const res =  await pool.query(`
        select w.* from word w
        where true
        and (w.game_id, w.word_id) not in (
            select game_id, word_id
            from turn_word tw
            where w.game_id = tw.game_id
            and w.word_id = tw.word_id
            and tw.phase = $1
            and tw.guessed
        )
        and w.game_id = $2
        order by random()`,
        [phase, gameId]
    )

    return res.rows.map(row => ({
        id: row.word_id,
        playerId: row.player_id,
        content: row.content
    }))
}


exports.addWordsToTurn = async function(gameId, phase, turnOrder, words) {
    for (let i=0; i < words.length; i++) {
        await pool.query(`
            insert into turn_word values(
                $1, $2, $3, $4, $5, $6, $7
            )`,
            [
                gameId, phase, turnOrder, i, words[i].id, false, 0
            ]
        )
    }
}


exports.findNextWord = async function(gameId, phase, turnOrder) {

    const res =  await pool.query(`
        select w.* from word w
        join turn_word tw
        on w.game_id = tw.game_id
        and w.word_id = tw.word_id
        where tw.game_id = $1
        and tw.phase = $2
        and tw.turn_order = $3
        and tw.guessed = $4
        order by tw.skips, tw.word_order
        limit 1`,
        [gameId, phase, turnOrder, false]
    )

    if (res.rows.length === 0) {
        return null
    }

    return res.rows.map(row =>  ({
        id: row.word_id,
        playerId: row.player_id,
        content: row.content
    }))[0]
    
}

exports.setWordIsGuessed = async function(gameId, phase, turnOrder, wordId) {
    await pool.query(`
        update turn_word
        set guessed = $1
        where game_id = $2
        and phase = $3
        and turn_order = $4
        and word_id = $5`,
        [
            true, gameId, phase, turnOrder, wordId
        ]
    )
}

exports.skipWord = async function(gameId, phase, turnOrder, wordId) {
    await pool.query(`
        update turn_word
        set skips = skips + 1
        where game_id = $1
        and phase = $2
        and turn_order = $3
        and word_id = $4`,
        [
            gameId, phase, turnOrder, wordId
        ]
    )
}

exports.calculatePoints = async function(gameId) {
    const res =  await pool.query(`
        select case (t.turn_order % 2)
            when 0 then 'GREEN'
            else 'BLUE'
        end team, sum(tw.phase + 1) total_points
        from turn_word tw
        join turn t
            on t.game_id = tw.game_id
            and t.phase = tw.phase
            and t.turn_order = tw.turn_order
        where tw.game_id = $1
        and tw.guessed = true
        group by t.turn_order % 2`,
        [gameId]
    )

    const map = {}

    res.rows.forEach(row => {
        map[row.team] = parseInt(row.total_points)s
    })

    return map
}

exports.deletePlayer = async function(gameId, playerId) {
    await pool.query(`
        delete from player p
        where p.game_id = $1 and p.player_id = $2
        `,
        [
            gameId, playerId
        ]
    )
}
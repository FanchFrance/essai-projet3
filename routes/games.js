const express = require('express');
const router = express.Router();
const connection = require('../config');



router.get('/', (req, res) => {

    connection.query('SELECT * FROM games', (err, results) => {
        if (err) {
            return res.status(500).json({
                error : err.message,
                sql: err.sql
            })
        }
        return res.json(results)
    })

});

router.get('/:id', (req, res) => {

    connection.query('SELECT * FROM games WHERE id = ?', req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({
                error : err.message,
                sql: err.sql
            })
        }
        
        if (results.length === 0) {
           return res.status(404).send("Le jeu n'a pas pu être récupéré")
        }

        return res.json(results[0]);
    })

})

router.get('/:id/objects', (req, res) => {

    connection.query('SELECT o.* FROM objects AS o JOIN games AS g ON g.id = o.games_id WHERE g.id = ?', req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql: err.sql
            })
        }

        if (results.length === 0) {
            return res.status(404).send("Le jeu n'a pas pu être récupéré")
        } 

        return res.json(results);
    })
})

router.get('/:id/messages', (req, res) => {

    connection.query('SELECT m.* FROM messages AS m JOIN games AS g ON g.id = m.games_id WHERE g.id = ?', req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql: err.sql
            })
        }

        if (results.length === 0) {
            return res.status(404).send("Le jeu n'a pas pu être récupéré")
        } 

        return res.json(results);
    })
})

router.post('/', (req, res) => {

    if (req.body.title) {

        connection.query('SELECT * FROM games WHERE title = ?', req.body.title, (err, results) => {
            if (err) {
                return res.status(500).json({
                    error : err.message,
                    sql: err.sql,
                })
            } else {

                if (results[0] != undefined) {
                    return res.send('Ce jeu est déjà dans la base de donnée')
                } else {

                    connection.query('INSERT INTO games SET ?', req.body, (err, results) => {
                        if (err) {
                            return res.status(500).json({
                                error : err.message,
                                sql: err.sql,
                            })
                        }

                        return connection.query('SELECT * FROM games WHERE id = ?', results.insertId, (err2, records) => {
                            if (err2) {
                                return res.status(500).json({
                                    error : err2.message,
                                    sql: err2.sql,
                                })
                            }

                            return res.json(records[0]);

                        })
                    })

                }

            }
        })

    } else {
        return res.send("Le titre du jeu est requis");
    }

})

router.put('/:id', (req, res) => {

    connection.query('UPDATE games SET ? WHERE id = ?', [req.body, req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({
                error : err.message,
                sql: err.sql,
            })
        }

        return connection.query('SELECT * FROM games WHERE id = ?', req.params.id, (err2, records) => {
            if(err2) {
                return res.status(500).json({
                    error : err2.message,
                    sql: err2.sql,
                })
            } 
            return res.json(records[0]);
        })
    })
})

router.delete('/:id', (req, res) => {

    connection.query('DELETE FROM games WHERE id = ?', req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({
                error : err.message,
                sql: err.sql
            })
        } else {
            return res.status(200).json({ status : "Le jeu a été supprimé"});
        }
    })

})

module.exports = router;

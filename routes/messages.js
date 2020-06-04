const express = require('express');

const router = express.Router();
const connection = require('../config');

router.get('/', (req, res) => {

    connection.query('SELECT * FROM messages', (err, results) => {
        if (err) {
            res.status(500).json({
                error: err.message,
                sql: err.sql
            })
        } else {
            res.json(results);
        }
    })
})

router.get('/:id', (req, res) => {

    connection.query('SELECT * FROM messages WHERE id = ?', req.params.id, (err, results) => {
        if (err) {
            res.status(500).json({
                error: err.message,
                sql: err.sql,
            });
        } 

        if (results.length === 0) {
            res.status(404).send("Le message de prévention n'a pas pu être récupéré.");
        }

        return res.json(results[0]);
        
    })
})

router.post('/', (req, res) => {

    if (req.body.title) {

        connection.query('SELECT * FROM messages WHERE title = ?', req.body.title, (err, results) => {
            if (err) {
                return res.status(500).json({
                    error : err.message,
                    sql: err.sql,
                })
            } else {

                if (results[0] != undefined) {
                    res.send('Ce message de prévention est déjà dans la base de donnée')
                } else {

                    connection.query('INSERT INTO messages SET ?', req.body, (err, results) => {
                        if (err) {
                            return res.status(500).json({
                                error : err.message,
                                sql: err.sql,
                            })
                        }

                        return connection.query('SELECT * FROM messages WHERE id = ?', results.insertId, (err2, records) => {
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
        return res.send("Le nom de l'objet est requis");
    }

})

router.put('/:id', (req, res) => {

    connection.query('UPDATE messages SET ? WHERE id = ?', [req.body, req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({
                error : err.message,
                sql: err.sql,
            })
        }

        return connection.query('SELECT * FROM messages WHERE id = ?', req.params.id, (err2, records) => {
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

    connection.query('DELETE FROM messages WHERE id = ?', req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({
                error : err.message,
                sql: err.sql
            })
        } else {
            return res.status(200).json({ status : "Message de prévention Supprimé"});
        }
    })

})

module.exports = router;
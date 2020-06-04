const express = require('express');

const router = express.Router();
const connection = require('../config');

router.get('/', (req, res) => {

    connection.query('SELECT * FROM objects', (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql: err.sql
            })
        } else {
            return res.json(results);
        }
    })
})

router.get('/:id', (req, res) => {

    connection.query('SELECT * FROM objects WHERE id = ?', req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql: err.sql,
            });
        } 

        if (results.length === 0) {
            return res.status(404).send("L'objet n'a pas pu être récupéré.");
        }

        return res.json(results[0]);
        
    })
})

router.post('/', (req, res) => {

    if (req.body.name) {

        connection.query('SELECT * FROM objects WHERE name = ?', req.body.name, (err, results) => {
            if (err) {
                return res.status(500).json({
                    error : err.message,
                    sql: err.sql,
                })
            } else {

                if (results[0] != undefined) {
                    return res.send('Cet objet est déjà dans la base de donnée')
                } else {

                    connection.query('INSERT INTO objects SET ?', req.body, (err, results) => {
                        if (err) {
                            return res.status(500).json({
                                error : err.message,
                                sql: err.sql,
                            })
                        }

                        return connection.query('SELECT * FROM objects WHERE id = ?', results.insertId, (err2, records) => {
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

    connection.query('UPDATE objects SET ? WHERE id = ?', [req.body, req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({
                error : err.message,
                sql: err.sql,
            })
        }

        return connection.query('SELECT * FROM objects WHERE id = ?', req.params.id, (err2, records) => {
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

    connection.query('DELETE FROM objects WHERE id = ?', req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({
                error : err.message,
                sql: err.sql
            })
        } else {
            return res.status(200).json({ status : "Objet Supprimé"});
        }
    })

})

module.exports = router;
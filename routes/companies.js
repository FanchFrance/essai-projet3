const express = require('express');

const router = express.Router();
const { check, validationResult } = require('express-validator');
const connection = require('../config');


const userValidationMiddlewares = [
    check('siret').isInt().isLength({ min: 14, max: 14 }).withMessage('le SIRET doit contenir 14 chiffres'),
    check('cp').isInt().isLength({ min: 5, max: 5 }).withMessage('Le code postal doit être composé de 5 chiffres'),
];

router.get('/', (req, res) => {

    connection.query('SELECT * FROM companies', (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql : err.sql
            });
        } else {
            return res.json(results);
        }
    })
})

router.get('/:companyId', (req, res) => {
    const idCompany = req.params.companyId;

    connection.query('SELECT * FROM companies WHERE id = ?', [idCompany], (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql : err.sql
            });
        } 
        
        if (results.length === 0) {
            return res.status(404).send("l'entreprise n'a pas pu être trouvée")
        }
        return res.status(200).json(results[0]);
    })
})

router.get('/:companyId/users', (req, res) => {

    connection.query('SELECT * FROM users WHERE companies_id = ?', req.params.companyId, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql: err.sql
            })
        } else if (results.length === 0)  {
            return res.status(500).send("L'entreprise n'a pas pu être récupérée") 
        }
        
        return res.json(results);
    })

});

router.post('/', userValidationMiddlewares, (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    if(req.body.name) {

        connection.query('SELECT * FROM companies WHERE name = ?', [req.body.name], (err, results) => {
            if (err) {
                return res.status(500).json({error: err.message});
            } else {

                if (results[0] != undefined) {
                    return res.send("L'entreprise est déjà dans la base de donnée")
                } else {

                    connection.query('INSERT INTO companies SET ?', req.body, (err, results) => {
                        if (err) {
                            return res.status(500).json({
                                error: err.message,
                                sql: err.sql
                            });
                        }

                        return connection.query('SELECT * FROM companies WHERE id = ?', results.insertId, (err2, records) => {
                            if (err2) {
                                return res.status(500).json({
                                    error : err2.message,
                                    sql: err2.sql
                                });
                            }

                            return res.json(records[0])

                        })

                    })
                }
            }
        })
    } else {
        return res.send("Le nom de l'entreprise est requis")
    }
})

router.put('/:id', userValidationMiddlewares, (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    connection.query('UPDATE companies SET ? WHERE id = ?', [req.body, req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql: err.sql
            });
        }

        return connection.query('SELECT * FROM companies WHERE id = ?', req.params.id, (err2, records) => {
            if (err2) {
                return res.status(500).json({
                    error: err2.message,
                    sql: err2.sql
                });
            }
            return res.status(200).json(records[0]);
        })
    })
})

router.delete('/:companyId', (req, res) => {

    connection.query('DELETE FROM companies WHERE id = ?', req.params.companyId, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql: err.sql
            });
        } else {
            return res.status(200).json({statut: "L'entreprise a été supprimé"})
        }
    })
})

module.exports = router;
const express = require('express');

const router = express.Router();
const { check, validationResult } = require('express-validator');
const connection = require('../config');

router.get('/', (req, res) => {

    connection.query('SELECT * FROM admin', (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql : err.sql
            });
        } 

        return res.status(200).json(results);

    })
})

router.get('/:id', (req, res) => {

    connection.query('SELECT * FROM admin WHERE id = ?', req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql : err.sql
            });
        } 
        
        if (results.length === 0) {
            return res.status(404).send("l'administrateur n'a pas pu être trouvé")
        }
        const insertedAdmin = results[0];
        const { password, ...admin } = insertedAdmin;
        return res.status(200).json(admin);
    })
})

const userValidationMiddlewares = [
    // email must be valid
    check('email').isEmail().withMessage('email pas valable'),
    // password must be at least 8 chars long
    check('password').isLength({ min: 8 }).withMessage('le mot de passe doit contenir au moins 8 caractères'),
    // let's assume a name should be 2 chars long
    check('firstname').isLength({ min: 2 }),
];

router.post('/',userValidationMiddlewares, (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    if(req.body.email) {

        connection.query('SELECT * FROM admin WHERE email = ?', [req.body.email], (err, results) => {
            if (err) {
                return res.status(500).json({error: err.message});
            } else {

                if (results[0] != undefined) {
                    return res.send("Cet email est déjà pris")
                } else {

                    connection.query('INSERT INTO admin SET ?', req.body, (err, results) => {
                        if (err) {
                            return res.status(500).json({
                                error: err.message,
                                sql: err.sql
                            });
                        }
                        return connection.query('SELECT * FROM admin WHERE id = ?', results.insertId, (err2, records) => {
                            if (err2) {
                                return res.status(500).json({
                                    error: err2.message,
                                    sql: err2.sql,
                                });
                            }
                            const insertedAdmin = records[0];
                            const { password, ...admin } = insertedAdmin;
                            const host = req.get('host');
                            const location = `http://${host}${req.url}/${admin.id}`;
                            return res
                            .status(201)
                            .set('Location', location)
                            .json(admin);
                        })
                    })
                }
            }
        })
    } else {
        return res.send("L'email est requis")
    }
})

router.put('/:id', userValidationMiddlewares, (req, res) => {

    connection.query('UPDATE admin SET ? WHERE id = ?', [req.body, req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql: err.sql
            });
        }

        return connection.query('SELECT * FROM admin WHERE id = ?', req.params.id, (err2, records) => {
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

router.delete('/:id', (req, res) => {

    connection.query('DELETE FROM admin WHERE id = ?', req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql: err.sql
            });
        } else {
            return res.status(200).json({statut: `Administrateur ${req.params.id} supprimé`})
        }
    })
})

module.exports = router;
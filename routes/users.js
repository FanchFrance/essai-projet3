const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');
const connection = require("../config");

// Test
router.get("/", (req, res) => {
  connection.query('SELECT * FROM users', (err, results) => {
    if (err) {
        return res.status(500).json({
            error: err.message,
            sql: err.sql
        })
    } else {
        return res.json(results);
    }
})
});

router.get('/:id', (req, res) => {

  connection.query('SELECT * FROM users WHERE id = ?', req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql: err.sql
            })
        } 

        if (results.length === 0) {
            return res.send("L'utilisateur n'a pas pu etre trouvé")
        }
        
        return res.json(results[0]);
    })
})

router.get('/:id/companies', (req, res) => {

    const sql = 'SELECT c.* FROM companies AS c JOIN users AS u ON c.id = u.companies_id WHERE u.id = ?'
    connection.query(sql, req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql: err.sql
            })
        }

        if (results.length === 0) {
            return res.send("L'utilisateur n'a pas pu etre trouvé")
        }

        return res.json(results);
    })

})

const userValidationMiddlewares = [
  // email must be valid
check('email').isEmail().withMessage('email pas valable'),
  // let's assume a name should be 2 chars long
check('firstname').isLength({ min: 2 }),
];

router.post('/', userValidationMiddlewares, (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    if(req.body.email) {

      connection.query('SELECT * FROM users WHERE email = ?', [req.body.email], (err, results) => {
            if (err) {
                return res.status(500).json({
                    error : err.message,
                    sql: err.sql,
                })
            } else {

                if (results[0] != undefined) {
                    return res.send('Cet email est déjà pris.')
                } else {

                    connection.query('INSERT INTO users SET ?', req.body, (err, results) => {
                        if (err) {
                            return res.status(500).json({
                                error : err.message,
                                sql: err.sql,
                            })
                        } 
                        
                        return connection.query('SELECT * FROM users WHERE id = ?', results.insertId, (err2, records) => {
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
        return res.send("l'email est requis");
    }
})

router.put('/:id', userValidationMiddlewares, (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    connection.query('UPDATE users SET ? WHERE id = ?', [req.body, req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({
                error : err.message,
                sql: err.sql,
            })
        }

        return connection.query('SELECT * FROM users WHERE id = ?', req.params.id, (err2, records) => {
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

    connection.query('DELETE FROM users WHERE id = ?', req.params.id, (err, resutls) => {
        if (err) {
            return res.status(500).json({
                error : err.message,
                sql: err.sql,
            })
        } else {
            return res.status(200).json({statut: "succès"})
        }
    })
    })

module.exports = router;

const express = require('express');

const router = express.Router();
const connection = require('../config');

router.get('/', (req, res) => {
    connection.query('SELECT * FROM sessions ', (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql : err.sql
            });
        }
        return res.status(200).json(results);
    });
});

router.get('/:id', (req, res) => {

    const idSession = req.params.id;

    connection.query('SELECT * FROM sessions WHERE id = ?', idSession, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql : err.sql
            });
        } else if (results.length === 0) {
            return res.status(404).send('Session introuvable')
        }

        return res.status(200).json(results[0]);
    });
});

router.get('/:id/users', (req, res) => {

    const sql = 'SELECT u.* FROM users AS u JOIN sessions_has_users AS su ON su.users_id = u.id JOIN sessions AS s ON s.id = su.sessions_id WHERE s.id = ?'

    connection.query(sql, req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql : err.sql
            });
        } 

        if (results.length === 0) {
            return res.status(404).send('Impossible de récupérer les utilisateurs')
        }

        return res.status(200).json(results);
    })

})

router.get('/:id/admin', (req, res) => {

    const idSession = req.params.id;

    connection.query('SELECT a.* FROM admin AS a JOIN sessions AS s ON a.id = s.admin_id WHERE s.id = ?', idSession, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql : err.sql
            });
        } 
        
        if (results.length === 0) {
            return res.status(404).send('Impossible de récupérer les utilisateurs')
        }

        return res.status(200).json(results);
    });
});

router.get('/:id/games', (req, res) => {

    const idSession = req.params.id;

    connection.query('SELECT g.* FROM games AS g JOIN sessions AS s ON g.id = s.admin_id WHERE s.id = ?', idSession, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql : err.sql
            });
        } 
        
        if (results.length === 0) {
            return res.status(404).send('Impossible de récupérer les utilisateurs')
        }

        return res.status(200).json(results);
        });
});

router.post('/', (req, res) => {

    connection.query('INSERT INTO sessions SET ?', req.body, (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql : err.sql
            });
        } 

        return connection.query('SELECT * FROM sessions WHERE id = ?', results.insertId, (err2, records) => {
            if (err2) {
                return res.status(500).json({
                    error: err2.message,
                    sql : err2.sql
                });
            }

            return res.status(200).json(records[0]);

        })

    })

})

router.put('/:id', (req, res) => {

    connection.query('UPDATE sessions SET ? WHERE id = ?', [req.body, req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err.message,
                sql : err.sql
            });
        } 

        return connection.query('SELECT * FROM sessions WHERE id = ?', req.params.id, (err2, records) => {
            if (err2) {
                return res.status(500).json({
                    error: err2.message,
                    sql : err2.sql
                });
            }

            return res.status(200).json(records[0]);

        })

    })

})

router.delete('/:id', (req, res) => {

    connection.query('DELETE FROM sessions WHERE id = ?', req.params.id, (err, results) => {
        if (err) {
            return res.status(500).json({
                error : err.message,
                sql: err.sql
            })
        } else {
            return res.status(200).json({ status : `Session ${req.params.id} Supprimée`});
        }
    })

})

//
//
//
// NESTED ROUTE FOR SESSIONS_HAS_USER TABLE 
//
//
//

router.post('/:idSession/users/:idUser', (req, res) => {

    // const errors = validationResult(req);

    const idSession = Number(req.params.idSession);
    const idUser = Number(req.params.idUser);

    // if (!errors.isEmpty()) {
    //   return res.status(422).json({ errors: errors.array() });
    // }

    return connection.query('INSERT INTO sessions_has_users SET users_id = ?, sessions_id = ?', [idUser, idSession], (err, results) => {
        if (err) {
            return res.status(500).json({
            error: err.message,
            sql: err.sql,
            });
        }

      return connection.query('SELECT * FROM sessions_has_users WHERE id = ?', results.insertId, (err2, records) => {
        if (err2) {
            return res.status(500).json({
            error: err2.message,
            sql: err2.sql,
            });
        }

        return res.status(201).json(records[0])
        });
    });
});

router.put('/:idSession/user/:idUser', (req, res) => {

    const idSession = Number(req.params.idSession);
    const idUser = Number(req.params.idUser);

    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    // return res.status(422).json({ errors: errors.array() });
    // }

    return connection.query('UPDATE sessions_has_users SET users_id = ?, sessions_id = ?', [idUser, idSession], (err, results) => {
    if (err) {
        return res.status(500).json({
        error: err.message,
        sql: err.sql,
        });
    }
    return connection.query('SELECT * FROM sessions_has_users WHERE id = ?', results.insertId, (err2, records) => {
        if (err2) {
        return res.status(500).json({
            error: err2.message,
            sql: err2.sql,
        });
        }
        const insertedJoin = records[0];
        const { ...sessions_has_users } = insertedJoin;
        const host = req.get('host');
        const location = `http://${host}${req.url}/${sessions_has_users.id}`;
        return res
        .status(201)
        .set('Location', location)
        .json(sessions_has_users);
    });
    });
});

module.exports = router;
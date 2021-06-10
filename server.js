const SQL = require('./sql')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan');
const app = express();
const port = 3000

morgan('dev');

app.use(express.json());
app.use(express.static('public'));
app.use(cors());
SQL.createTable();

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: 'public'})
})

app.get('/records/', (req, res) => {

    SQL.getAllBooks()
        .then(data => res.json(data))
        .catch(err => {
            res.status(400);
            res.json(err);
        });

})

app.post('/records/reset/', (req, res) => {

    if (req.body['yeet'] === undefined) {
        res.status(400);
        res.json({'yeet': 'This field is required'})
        return;
    }

    if (req.body['yeet'] === false) {
        res.json({'OK': "true"});
        return;
    }

    SQL.removeAllBooks()
        .then(() => {
            res.json({'ok': true});
        })
        .catch(err => {
            res.status(400);
            res.json(err);
        });

})

app.post('/records/remove/', (req, res) => {

    console.log(req.body);
    if (req.body['id'] === undefined) {
        res.json({'id': 'This field is required'})
        return;
    }

    SQL.removeBook(req.body['id'])
        .then(data => {
            if (data.affectedRows > 0) {
                res.json({'ok': true, 'status': 'deleted', 'id': req.body['id']})
            } else res.json({'ok': false, 'status': 'not found'})
        })
        .catch(err => {
            res.status(400);
            res.json(err);
        });

})

app.post('/records/update/', (req, res) => {

    let id = req.body['id'];

    if (id === undefined) {
        res.status(400);
        res.json({'id': 'This field is required'})
        return;
    }

    delete req.body.id;

    SQL.updateBook(id, req.body)
        .then(data => {
            if (data.affectedRows === 0) {
                res.status(400);
                res.json({"id": "invalid id"});
                return;
            }

            SQL.getBook(id)
                .then(data => {
                    res.json(data);
                })
                .catch(err => {
                    res.status(400);
                    res.json(err);
                });
        })
        .catch(err => {
            res.status(400);
            res.json(err);
        });

})

app.post('/records/create/', (req, res) => {

    let ok = true, err = {}, {title, author, price, availability, isbn} = req.body;

    if (title === undefined) {
        err['title'] = 'This field is required';
        ok = false;
    }

    if (author === undefined) {
        err['author'] = 'This field is required';
        ok = false;
    }

    if (!ok) {
        res.status(400);
        res.json(err);
        return;
    }

    SQL.addBook({title, author, isbn, availability, price})
        .then(data => {
            SQL.getBook(data.insertId)
                .then(data => {
                    res.json(data);
                })
                .catch(err => {
                    res.status(400);
                    res.json(err);
                });
        })
        .catch(err => {
            res.status(400);
            res.json(err);
        });

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
const mysql = require('mysql')
const dotenv = require('dotenv')

dotenv.config();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

const createTable = () => {

    const create_query = `CREATE TABLE IF NOT EXISTS BOOKS(
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(30) DEFAULT '000-000-000',
    availability INT DEFAULT 0,
    price FLOAT DEFAULT 0.0   
    )`;

    pool.query(create_query, function (error) {
        if (error) throw error;
    });

}

const addBook = (Book) => {

    Object.keys(Book).forEach(key => {
        if (Book[key] === null || Book[key] === undefined) delete Book[key];
    })

    console.log(Book)

    return new Promise(function (resolve, reject) {

        pool.query(`INSERT INTO BOOKS SET ?`, Book, function (error, results) {
            if (error) reject([error.sqlMessage, error.code]);
            resolve(results);
        })
    });
}

const getBook = (id) => {

    return new Promise(function (resolve, reject) {

        pool.query(`SELECT * FROM BOOKS WHERE id=${id}`, function (error, results) {
            if (error) reject([error.sqlMessage, error.code]);
            resolve(results);
        })
    });
}


const getAllBooks = () => {

    return new Promise(function (resolve, reject) {

        pool.query('SELECT * FROM BOOKS', function (error, results) {
            if (error) reject([error.sqlMessage, error.code]);
            resolve(results);
        })
    });
}

const removeBook = (id) => {

    return new Promise(function (resolve, reject) {

        pool.query(`DELETE FROM BOOKS WHERE id=${id}`, function (error, results) {
            if (error) reject([error.sqlMessage, error.code]);
            resolve(results);
        })
    });
}

const removeAllBooks = () => {

    return new Promise(function (resolve, reject) {

        pool.query(`TRUNCATE BOOKS`, function (error, results) {
            if (error) reject([error.sqlMessage, error.code]);
            resolve(results);
        })
    });
}

const updateBook = (id, updates) => {

    Object.keys(updates).forEach(key => {
        if (updates[key] === null || updates[key] === undefined) delete updates[key];
    })

    return new Promise(function (resolve, reject) {
        pool.query(`UPDATE BOOKS SET ? WHERE id=${id}`, updates, function (error, results) {
            if (error) reject([error.sqlMessage, error.code]);
            resolve(results);
        })
    });
}

module.exports = {
    addBook,
    removeBook,
    updateBook,
    getAllBooks,
    removeAllBooks,
    getBook,
    createTable
}
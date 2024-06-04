const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ruramira0306!',
    database: 'user_db'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL Database.');
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'beckynishimwe@gmail.com',
        pass: 'Ruramira0306!'
    }
});

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    const token = crypto.randomBytes(20).toString('hex');

    connection.query('INSERT INTO users (email, password, token, confirmed) VALUES (?, ?, ?, ?)', 
    [email, password, token, false], (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Registration failed.' });
        }

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Email Confirmation',
            text: `Please confirm your email by clicking the following link: http://localhost:3000/confirm/${token}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Failed to send confirmation email.' });
            }
            res.json({ success: true, message: 'Registration successful! Check your email for confirmation.' });
        });
    });
});

app.get('/confirm/:token', (req, res) => {
    const token = req.params.token;

    connection.query('UPDATE users SET confirmed = true WHERE token = ?', [token], (error, results) => {
        if (error || results.affectedRows === 0) {
            return res.status(400).send('Email confirmation failed.');
        }
        res.send('Email confirmed successfully!');
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000.');
});

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); 
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

console.log(process.env.PORT);
console.log(process.env.DB_HOST);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_NAME);
console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASSWORD);

const app = express();
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL Database.');
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

app.post('/register', async (req, res) => {
    const { fname, lname, email, password } = req.body;
    const token = crypto.randomBytes(20).toString('hex');

    if (!email || !password || !fname || !lname) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        connection.beginTransaction(async (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Registration failed.' });
            }

            try {
                const [result] = await connection.promise().query(
                    'INSERT INTO users (email, password, token, confirmed, fname, lname) VALUES (?, ?, ?, ?, ?, ?)', 
                    [email, hashedPassword, token, false, fname, lname]
                );

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Email Confirmation',
                    text: `Please confirm your email by clicking the following link: http://localhost:${process.env.PORT}/confirm/${token}`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        connection.rollback(() => {
                            return res.status(500).json({ success: false, message: 'Failed to send confirmation email.' });
                        });
                    }

                    connection.commit((err) => {
                        if (err) {
                            connection.rollback(() => {
                                return res.status(500).json({ success: false, message: 'Failed to commit transaction.' });
                            });
                        }
                        res.json({ success: true, message: 'Registration successful! Check your email for confirmation.', token: token });
                    });
                });
            } catch (error) {
                connection.rollback(() => {
                    return res.status(500).json({ success: false, message: 'Registration failed.' });
                });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

app.get('/confirm/:token', async (req, res) => {
    const token = req.params.token;

    try {
        const [result] = await connection.promise().query('UPDATE users SET confirmed = true WHERE token = ?', [token]);

        if (result.affectedRows === 0) {
            return res.status(400).send('Email confirmation failed.');
        }
        res.send('Email confirmed successfully!');
    } catch (error) {
        res.status(500).send('Server error.');
    }
});

// Serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}.`);
});

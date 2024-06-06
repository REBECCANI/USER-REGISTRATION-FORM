CREATE DATABASE user_registration;

USE user_registration;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    token VARCHAR(255),
    is_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * from users;

DESCRIBE users;

ALTER TABLE users 
ADD COLUMN fname VARCHAR(255) NOT NULL,
ADD COLUMN lname VARCHAR(255) NOT NULL;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Ruramira0306!';

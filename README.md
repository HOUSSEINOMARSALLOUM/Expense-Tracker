# Expense-Tracker

=====================

CREATE DATABASE expense_tracker;
USE expense_tracker;

CREATE TABLE users (
id INT PRIMARY KEY AUTO_INCREMENT,
username VARCHAR(50) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
id INT PRIMARY KEY AUTO_INCREMENT,
user_id INT NOT NULL,
amount DECIMAL(10, 2) NOT NULL,
type ENUM('income', 'expense') NOT NULL,
date DATE NOT NULL,
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id)
);

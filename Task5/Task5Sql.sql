CREATE DATABASE payment_system;
 USE payment_system;

 CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    balance DECIMAL(10,2) NOT NULL
);

 INSERT INTO accounts (name, balance) VALUES
 ('User_Account', 5000.00),
 ('Merchant_Account', 2000.00);
 START TRANSACTION;

 UPDATE accounts
 SET balance = balance - 1000
 WHERE id = 1 AND balance >= 1000;

 UPDATE accounts
 SET balance = balance + 1000
 WHERE id = 2;

COMMIT;
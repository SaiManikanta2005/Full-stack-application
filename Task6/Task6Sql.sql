CREATE TABLE activity_log (
     id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50),
     action_type VARCHAR(20),
    record_id INT,
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );
 use order_management
 DELIMITER //

CREATE TRIGGER orders_after_insert
 AFTER INSERT ON orders
 FOR EACH ROW
 BEGIN
     INSERT INTO activity_log (table_name, action_type, record_id)
     VALUES ('orders', 'INSERT', NEW.id);
 END //

 DELIMITER ;
 USE order_management;

 CREATE VIEW daily_activity_report AS
 SELECT 
     DATE(action_time) AS activity_date,
     table_name,
     action_type,
     COUNT(*) AS total_actions
 FROM activity_log
 GROUP BY DATE(action_time), table_name, action_type
 ORDER BY activity_date DESC;

 INSERT INTO orders (customer_id, product_id, quantity, order_date)
 VALUES (1, 2, 1, CURDATE());

-- output
SELECT * FROM activity_log;
SELECT * FROM daily_activity_report;
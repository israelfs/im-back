CREATE DATABASE todos;
USE todos;

CREATE TABLE todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100),
  completed BOOLEAN
);

INSERT INTO todos (title, completed) VALUES ('Rua exp holz 550', false);
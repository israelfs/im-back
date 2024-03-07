CREATE DATABASE todosApp;
USE todosApp;

CREATE TABLE todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100),
  lat FLOAT,
  lng FLOAT
);

INSERT INTO todos (title, lat, lng) VALUES ('Ir ao escritório', -26.300290, -48.853200);
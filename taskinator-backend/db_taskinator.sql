CREATE DATABASE taskinator;

USE taskinator;

-- Tabla para los usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Tabla para las tareas
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    status ENUM('Pendiente', 'En Proceso', 'Realizada', 'Archivada') DEFAULT 'Pendiente',
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

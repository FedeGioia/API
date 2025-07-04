-- Script para agregar las columnas usuario_creacion y usuario_modificacion a la tabla Platos

USE essen_restaurant;

ALTER TABLE Platos 
ADD COLUMN usuario_creacion INT UNSIGNED NULL,
ADD COLUMN usuario_modificacion INT UNSIGNED NULL;

-- Agregar foreign keys si es necesario
-- ALTER TABLE Platos 
-- ADD CONSTRAINT fk_platos_usuario_creacion FOREIGN KEY (usuario_creacion) REFERENCES Usuarios(id),
-- ADD CONSTRAINT fk_platos_usuario_modificacion FOREIGN KEY (usuario_modificacion) REFERENCES Usuarios(id);

-- Verificar la estructura actualizada
DESCRIBE Platos;

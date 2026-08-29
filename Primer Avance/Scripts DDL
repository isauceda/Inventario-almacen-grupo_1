-- 1. CREACIÓN DE LA BASE DE DATOS
-- Se crea la base de datos almacen_db y se selecciona para su uso.
CREATE DATABASE IF NOT EXISTS almacen_db;
USE almacen_db;



-- Tabla de Categorías
CREATE TABLE Categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- Tabla de Proveedores
CREATE TABLE Proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre_razon_social VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    correo_electronico VARCHAR(100),
    direccion VARCHAR(255)
);

-- Tabla de Usuarios (Operadores del sistema)
-- Sin contraseña en esta etapa.
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    rol VARCHAR(50) NOT NULL, -- Ej. 'Administrador', 'Vendedor'
    estado ENUM('activo', 'inactivo') DEFAULT 'activo' NOT NULL
);

-- 3. CREACIÓN DE TABLAS DEPENDIENTES (Con claves foráneas)

-- Tabla de Productos
-- Depende de Categorias y Proveedores.
CREATE TABLE Productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(150) NOT NULL,
    descripcion TEXT,
    sku VARCHAR(50) UNIQUE,
    precio_compra DECIMAL(10,2) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    stock_minimo INT NOT NULL,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo' NOT NULL,
    id_categoria INT,
    id_proveedor INT,
    
    -- Definición de Claves Foráneas
    FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria) ON DELETE SET NULL,
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores(id_proveedor) ON DELETE SET NULL,
    
    -- Restricciones básicas de negocio
    CONSTRAINT chk_precio_compra CHECK (precio_compra > 0),
    CONSTRAINT chk_precio_venta CHECK (precio_venta > 0),
    CONSTRAINT chk_stock_minimo CHECK (stock_minimo >= 0)
);

-- Tabla de Movimientos de Inventario
-- Depende de Productos y Usuarios. Controla el stock.
CREATE TABLE MovimientosInventario (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    tipo_movimiento CHAR(1) NOT NULL,
    cantidad INT NOT NULL,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    id_usuario INT NOT NULL,
    
    -- Definición de Claves Foráneas
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT,
    
    -- Restricciones para que solo acepte 'E' o 'S' y cantidad mayor a 0
    CONSTRAINT chk_tipo_movimiento CHECK (tipo_movimiento IN ('E', 'S')),
    CONSTRAINT chk_cantidad CHECK (cantidad > 0)
);

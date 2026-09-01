const express = require('express');
const app = express();
const mysql = require('mysql2');
const PORT = 3000;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Oapj_1804.',
    database: 'almacen_db'
});

pool.getConnection((error, conexion)=>{
    if(error){
        console.log('Error de conexion con la bd...');
    } 
    else{
        console.log('conexion con la bd exitosa');
    }
});

app.use(express.json());

// Listar productos con filtros opcionales
app.get('/api/productos', (req, res) => {
    let sql = "SELECT id_producto, nombre, descripcion, sku, precio_compra, precio_venta, stock_minimo, estado, id_categoria, id_proveedor FROM productos WHERE 1=1";
    const params = [];

    if (req.query.estado) {
        sql += " AND estado = ?";
        params.push(req.query.estado);
    }

    if (req.query.category_id) {
        sql += " AND id_categoria = ?";
        params.push(req.query.category_id);
    }

    if (req.query.busqueda) {
        sql += " AND (nombre LIKE ? OR sku LIKE ?)";
        const searchTerm = `%${req.query.busqueda}%`;
        params.push(searchTerm, searchTerm);
    }

    pool.query(sql, params, (err, results) => {
        if (err) {
            res.status(500).json({ status: 500, message: "Ocurrió un error en la ejecución de la consulta" });
        } else {
            res.status(200).json({ status: 200, message: "Success", data: results });
        }
    });
});

// Obtener producto por ID 
app.get('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT id_producto, nombre, descripcion, sku, precio_compra, precio_venta, stock_minimo, estado, id_categoria, id_proveedor FROM productos WHERE id_producto = ?";

    pool.query(sql, [id], (err, results) => {
        if (err) {
            res.status(500).json({ status: 500, message: "Ocurrió un error en la ejecución de la consulta" });
        } else if (results.length === 0) {
            res.status(404).json({ status: 404, message: "Producto no encontrado" });
        } else {
            res.status(200).json({ status: 200, message: "Success", data: results[0] });
        }
    });
});

app.listen(PORT, () => {
    console.log(`El servidor está escuchando en: http://localhost:${PORT}`);
});
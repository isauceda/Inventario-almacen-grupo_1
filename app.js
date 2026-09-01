const express = require('express');
const app = express();
//const mysql = require('mysql2');
const mysql = require('mysql2/promise');
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


// 2. ENDPOINT POST: CREAR PRODUCTO

app.post('/api/productos', async (req, res) => {
    try {
        // 
        const { nombre, descripcion, sku, precio_compra, precio_venta, stock_minimo, estado, category_id, provider_id } = req.body;

        // 2. VALIDACIONES (Retornan 400 Bad Request si fallan)
        
        // A. Validar campos obligatorios vacíos o inexistentes
        if (!nombre || !sku || !estado) {
            return res.status(400).json({ 
                error: 'Bad Request',
                mensaje: 'Los campos nombre, sku y estado son obligatorios y no pueden estar vacíos.' 
            });
        }

        // B. Validar que los precios sean mayores a 0
        if (precio_compra <= 0 || precio_venta <= 0) {
            return res.status(400).json({ 
                error: 'Bad Request',
                mensaje: 'El precio de compra y el precio de venta deben ser mayores a 0.' 
            });
        }

        // C. Validar que el estado sea correcto (opcional pero recomendado)
        if (estado !== 'activo' && estado !== 'inactivo') {
            return res.status(400).json({ 
                error: 'Bad Request',
                mensaje: 'El estado solo permite los valores: "activo" o "inactivo".' 
            });
        }

        // 3. INSERCIÓN EN BASE DE DATOS
        const query = `INSERT INTO Productos 
                      (nombre, descripcion, sku, precio_compra, precio_venta, stock_minimo, estado, category_id, provider_id) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                       
        const [resultado] = await pool.execute(query, [
            nombre, descripcion, sku, precio_compra, precio_venta, stock_minimo, estado, category_id, provider_id
        ]);
        
        // 4. RESPUESTA DE ÉXITO (Retorna 201 Created)
        res.status(201).json({ 
            mensaje: 'Producto registrado con éxito', 
            id_producto: resultado.insertId 
        });

    } catch (error) {
        // Manejo de errores inesperados (ej. base de datos apagada, error de sintaxis SQL)
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al crear el producto' });
    }
});

// Actualizar producto
app.put('/api/productos/:id', (req, res) => {
    const id = req.params.id;

    const {
        nombre,
        descripcion,
        sku,
        precio_compra,
        precio_venta,
        stock_minimo,
        estado,
        id_categoria,
        id_proveedor
    } = req.body;

    const sql = `
        UPDATE productos
        SET nombre = ?,
            descripcion = ?,
            sku = ?,
            precio_compra = ?,
            precio_venta = ?,
            stock_minimo = ?,
            estado = ?,
            id_categoria = ?,
            id_proveedor = ?
        WHERE id_producto = ?
    `;

    const params = [
        nombre,
        descripcion,
        sku,
        precio_compra,
        precio_venta,
        stock_minimo,
        estado,
        id_categoria,
        id_proveedor,
        id
    ];

    pool.query(sql, params, (err, result) => {
        if (err) {
            res.status(500).json({
                status: 500,
                message: "Ocurrio un error al actualizar el producto"
            });
        } else if (result.affectedRows === 0) {
            res.status(404).json({
                status: 404,
                message: "Producto no encontrado"
            });
        } else {
            res.status(200).json({
                status: 200,
                message: "Producto actualizado correctamente"
            });
        }
    });
});

// Eliminacion
app.delete('/api/productos/:id', (req, res) => {
    const id = req.params.id;

    const sql = `
        UPDATE productos
        SET estado = 'INACTIVO'
        WHERE id_producto = ?
    `;

    pool.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).json({
                status: 500,
                message: "Ocurrio un error al eliminar el producto"
            });
        } else if (result.affectedRows === 0) {
            res.status(404).json({
                status: 404,
                message: "Producto no encontrado"
            });
        } else {
            res.status(200).json({
                status: 200,
                message: "Producto eliminado correctamente"
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`El servidor está escuchando en: http://localhost:${PORT}`);
});

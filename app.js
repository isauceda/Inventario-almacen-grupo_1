const express = require('express');
const app = express();
const mysql = require('mysql2/promise')
const PORT = 3000;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Oapj_1804.',
    database: 'almacen_db'
  
});

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión con la BD exitosa');
        connection.release();
    } catch (error) {
        console.error('Error de conexión con la BD...', error);
    }
})();


app.use(express.json());

// Listar productos con filtros opcionales
app.get('/api/productos', async (req, res) => {
    try {
        let sql = `
            SELECT id_producto, nombre_producto, descripcion, sku, 
                   precio_compra, precio_venta, stock_minimo, estado, 
                   id_categoria, id_proveedor 
            FROM Productos 
            WHERE 1=1
        `;
        const params = [];

        if (req.query.estado) {
            sql += " AND estado = ?";
            params.push(req.query.estado);
        }

        if (req.query.id_categoria) {
            sql += " AND id_categoria = ?";
            params.push(req.query.id_categoria);
        }

        if (req.query.busqueda) {
            sql += " AND (nombre_producto LIKE ? OR sku LIKE ?)";
            const searchTerm = `%${req.query.busqueda}%`;
            params.push(searchTerm, searchTerm);
        }

        const [results] = await pool.query(sql, params);
        res.status(200).json({ status: 200, message: "Success", data: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: "Ocurrió un error en la ejecución de la consulta" });
    }
});

// Obtener producto por ID 
app.get('/api/productos/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const sql = `
            SELECT id_producto, nombre_producto, descripcion, sku, 
                   precio_compra, precio_venta, stock_minimo, estado, 
                   id_categoria, id_proveedor 
            FROM Productos 
            WHERE id_producto = ?
        `;

        const [results] = await pool.query(sql, [id]);

        if (results.length === 0) {
            return res.status(404).json({ status: 404, message: "Producto no encontrado" });
        }
        
        res.status(200).json({ status: 200, message: "Success", data: results[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: "Ocurrió un error en la ejecución de la consulta" });
    }
});


// 2. ENDPOINT POST: CREAR PRODUCTO

app.post('/api/productos', async (req, res) => {

    try {
        // 
        const { nombre_producto, descripcion, sku, precio_compra, precio_venta, stock_minimo, estado, id_categoria, id_proveedor } = req.body;
        

        // 2. VALIDACIONES (Retornan 400 Bad Request si fallan)
        
        // A. Validar campos obligatorios vacíos o inexistentes
        if (!nombre_producto || !sku || !estado) {
            return res.status(400).json({ 
                error: 'Bad Request',
                mensaje: 'Los campos nombre_producto, sku y estado son obligatorios y no pueden estar vacíos.' 
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
                      (nombre_producto, descripcion, sku, precio_compra, precio_venta, stock_minimo, estado, id_categoria, id_proveedor) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                       
        const [resultado] = await pool.execute(query, [
            nombre_producto, descripcion, sku, precio_compra, precio_venta, stock_minimo, estado, id_categoria, id_proveedor
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
app.put('/api/productos/:id', async (req, res) => {

    try {
    const id = req.params.id;

    const {
        nombre_producto,
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
        SET nombre_producto = ?,
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
        nombre_producto,
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

    const [result] = await pool.execute(sql, params);

    if (result.affectedRows === 0) {
        return res.status(404).json({
            status: 404,
            message: "Producto no encontrado"
        });
    }

    res.status(200).json({
        status: 200,
        message: "Producto actualizado correctamente"
    });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar el producto' });
    }
});


// Eliminacion
app.delete('/api/productos/:id', async (req, res) => {
    try {
    const id = req.params.id;

    const sql = `
        UPDATE productos
        SET estado = 'inactivo'
        WHERE id_producto = ?
    `;

    const [result] = await pool.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                message: "Ocurrio un error al eliminar el producto"
            });
        } else {
            res.status(200).json({
                status: 200,
                message: "Producto eliminado correctamente"
            });
        }
   
    } catch (err) { 
        console.error(err);
        res.status(500).json({
            status: 500,
            message: "Ocurrio un error al eliminar el producto"
        });
    }
});

app.listen(PORT, () => {
    console.log(`El servidor está escuchando en: http://localhost:${PORT}`);
});

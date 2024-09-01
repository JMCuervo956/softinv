//require('dotenv').config(); 

// 1. - Invocamos a express
import express from 'express';
import {pool} from './db.js';
import {PORT} from './config.js';
import mysql from 'mysql2/promise'; // Cambiado para usar mysql2 con promesas
 
const app = express()

// Configura el motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Ruta para la página principal
app.get('/', async (req, res) => {
    try {
        // Ejecuta la consulta a la base de datos
        const [rows] = await pool.execute("SELECT * FROM preguntas");
        // Renderiza la plantilla 'index.ejs' pasando los resultados de la consulta
        res.render('index', { preguntas: rows });
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(PORT, () => {
    console.log('Server en port', PORT);
});
  
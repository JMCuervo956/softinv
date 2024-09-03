  
// 1. - Invocamos a express   
import express from 'express';
import {pool} from './db.js';
import {PORT} from './config.js';
import mysql from 'mysql2/promise'; // Cambiado para usar mysql2 con promesas
import path from 'path';
import { fileURLToPath } from 'url';

// Definir __dirname manualmente en un entorno ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()


// Configuración para servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para parsear datos del formulario (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Configura el motor de plantillas EJS
 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
//app.set('views', './views'); 

// Ruta para la página principal

 
app.get('/', async (req, res) => {
    try {
        // Ejecuta la consulta a la base de datos
        const [rows] = await pool.execute("SELECT * FROM preguntas");
        // Renderiza la plantilla 'index.ejs' pasando los resultados de la consulta
        res.render('login', { preguntas: rows });
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } 
});
 
app.get('/menuprc', (req, res)=>{
    res.render('menuprc'); 
})

app.get('/registros', (req, res)=>{
    res.render('registros'); 
})

app.get('/register', (req, res)=>{
    res.render('register'); 
})

// 11. Autenticacion 
    
app.post('/auth', (req, res) => {
    res.render('menuprc');
});

app.post('/regist', (req, res) => {
    res.render('menuprc');  
});   

app.listen(PORT, () => {
    console.log('Server en port', PORT);
}); 
      
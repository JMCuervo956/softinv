
// 1. - Invocamos a express   
import express from 'express';
import session from 'express-session';
import {pool} from './db.js';
import {PORT} from './config.js';
import mysql from 'mysql2/promise'; // Cambiado para usar mysql2 con promesas
import path from 'path';
import { fileURLToPath } from 'url';
import bcryptjs from 'bcryptjs';
import { validateCredentials } from './auth.js';
   
//import Swal from 'sweetalert2/dist/sweetalert2.js'
import Swal from 'sweetalert2';
//import 'sweetalert2/src/sweetalert2.scss'


// Definir __dirname manualmente en un entorno ESM 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
const app = express()

// Configura express-session
app.use(session({
    secret: 'tu_secreto_aqui', // Cambia esto por una cadena secreta
    resave: false, // No volver a guardar la sesión si no ha habido cambios
    saveUninitialized: true, // Guarda una sesión incluso si no ha sido inicializada
    cookie: { secure: false } // Cambia a true si usas HTTPS
  }));

// Middleware para manejar sesiones
app.use((req, res, next) => {
    if (!req.session.loggedin) {
      req.session.loggedin = false;
    }
    next();
  });

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

app.post('/auth', async (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;

    if (!user || !pass) {
        return res.status(400).json({ error: 'Please fill in all fields!' });
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE user = ?', [user]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
  
        const userRecord = rows[0];
        const passwordMatch = await bcryptjs.compare(pass, userRecord.pass);
        
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        req.session.loggedin = true;
        req.session.user = user;
//        res.json({ success: true });

        res.render('menuprc',{

            alert: true,
            alertTitle: "Conexion Exitosa",
            alertMessage:"!LOGIN Correcto",
            alertIcon:'success',
            showConfirmButton:false,
            timer:500,
            ruta:'',

            }
            )
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}); 

// pregunta
// post

app.post('/regist', (req, res) => {
    res.render('menuprc');  
});   

app.listen(PORT, () => {
    console.log('Server en port', PORT);
}); 
      


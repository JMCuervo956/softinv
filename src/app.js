 
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

// Función para mostrar la alerta
function showAlert() {
    Swal.fire({
        title: 'Conexión Exitosa',
        text: '!LOGIN Correcto',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500 // Duración en milisegundos (1500 ms = 1.5 segundos)
    });
}
 
 

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

// Ruta para renderizar la galería de imágenes
app.get('/fondo', (req, res) => {
    const images = [
        { src: '/public/img/sti.png', alt: 'Imagen 1' },
        { src: '/images/image2.jpg', alt: 'Imagen 2' },
        { src: '/images/image3.jpg', alt: 'Imagen 3' }
    ];
    res.render('gallery', { images });
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

    // Verificar si se han proporcionado todos los campos
    if (!user || !pass) {
        return res.status(400).json({ error: 'Please fill in all fields!' });
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE user = ?', [user]);

        // Verificar si se encontró el usuario
        if (rows.length === 0) {
            return res.json({
                status: 'error',
                title: 'Error',
                message: 'Usuario no encontrado'
            });
        }

        const userRecord = rows[0];
        const passwordMatch = await bcryptjs.compare(pass, userRecord.pass);

        // Verificar si la contraseña es correcta
        if (!passwordMatch) {
            return res.json({
                status: 'error',
                title: 'Error',
                message: 'Contraseña incorrecta'
            });
        }
 
        // Autenticación exitosa
        req.session.loggedin = true;
        req.session.user = user;
        return res.json({
            status: 'success',
            title: 'Conexión Exitosa',
            message: '!LOGIN Correcto!'
        });

    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// pregunta
// post

app.post('/register', async (req, res) => {
    try {
        const user = req.body.user;
        const name = req.body.name;
        const rol = req.body.rol;
        const pass = req.body.pass;
        let passwordHash = await bcryptjs.hash(pass, 8);

        // Verificar si algún valor es undefined
        if (!user || !name || !rol || !pass) {
            return res.json({
                status: 'error',
                title: 'Error',
                message: 'Todos los campos son obligatorios'
            })
        }

        // Log para depuración
        const [rows] = await pool.execute('SELECT * FROM users WHERE user = ?', [user]);

        if (rows.length > 0) {
            return res.json({
                status: 'error',
                title: 'Error',
                message: 'Usuario ya Existe'
            });
        }

        // Insertar nuevo usuario
        await pool.execute('INSERT INTO users (user, name, rol, pass) VALUES (?, ?, ?, ?)', [user, name, rol, passwordHash]);

        res.json({
            status: 'success',
            title: 'Registro Exitoso',
            message: '¡Usuario registrado correctamente!'
        });


    } catch (error) {
        res.json({
            status: 'success',
            title: 'Registro Exitoso',
            message: '¡Error en el servidor! BD'
        });

    }
});
 

app.listen(PORT, () => {
    console.log('Server en port', PORT);
}); 
      

 

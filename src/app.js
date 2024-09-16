 
// 1. - Invocamos a express   
// import express from 'express'; ???????????????
import express, { Router } from 'express';
import session from 'express-session';
import {pool} from './db.js';
import {PORT} from './config.js';
import mysql from 'mysql2/promise'; // Cambiado para usar mysql2 con promesas
import path from 'path';
import { fileURLToPath } from 'url';
import bcryptjs from 'bcryptjs';
import { validateCredentials } from './auth.js';

// importar archivos
import fs from 'fs';
import { readFile } from 'fs/promises';
import fastcsv from 'fast-csv';
import bodyParser from 'body-parser';

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
 
const app = express();

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
app.use(bodyParser.json()); // para cargue de archivos

// Middleware para parsear datos del formulario (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Configura el motor de plantillas EJS
 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
//app.set('views', './views'); 

// Servir archivos estáticos desde la carpeta 'src'
app.use(express.static(path.join(__dirname, 'src')));

// Ruta para la página principal
 
  
app.get('/', async (req, res) => {
    try {
        // Renderiza la plantilla 'video.ejs'
        const greeting = getGreeting();
        res.render('login');
    } catch (error) {
        console.error('Error al renderizar la plantilla:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }  
});

// Ruta para renderizar la galería de imágenes

app.get('/menuprc', (req, res)=>{
    res.render('menuprc'); 
})

app.get('/register', (req, res)=>{
    res.render('register'); 
})

app.get('/preguntas', (req, res)=>{
    res.render('preguntas'); 
})

app.get('/tablaguardar', (req, res)=>{
    res.render('tablaguardar'); 
})

app.get('/eliminar', (req, res) => {
    const id = req.query.id;
    const texto = req.query.texto;
    res.render('eliminar', { id, texto });
});

app.get('/modificar', (req, res) => {
    const id = req.query.id;
    const texto = req.query.texto;
    res.render('modificar', { id, texto });
});


/*
app.get('/ingpreguntas', async (req, res) => {
    try {
        const [rows] = await pool.execute("select * from preguntas order by id desc");
        res.render('ingpreguntas', { data: rows });
    } catch (error) {
                console.error('Error conectando a la base de datos....????:', error);
                res.status(500).send('Error conectando a la base de datos.?????');
            }
    });
*/
//************************** */

/*

app.get('/fondo', (req, res) => {
    const images = [
        { src: '/public/img/sti.png', alt: 'Imagen 1' },
        { src: '/images/image2.jpg', alt: 'Imagen 2' },
        { src: '/images/image3.jpg', alt: 'Imagen 3' }
    ];
    res.render('gallery', { images });
});

app.get('/html', (req, res)=>{
    res.render('html'); 
})

app.get('/registros', (req, res)=>{
    res.render('registros');  
})
 
app.get('/regpgtas', (req, res)=>{
    res.render('regpgtas'); 
})

app.get('/AdicionaPgtas', (req, res)=>{
    res.render('AdicionaPgtas'); 
})

app.get('/tables', (req, res)=>{
    res.render('tables'); 
})

app.get('/habilita', (req, res)=>{
    res.render('habilita'); 
})

app.get('/coltablas', (req, res)=>{
    res.render('coltablas'); 
})

app.get('/pgtasingresar', (req, res)=>{
    res.render('pgtasingresar'); 
})

*/

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
//        console.error('Error al ejecutar la consulta:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// preguntas - post
app.post('/preguntasreg', async (req, res) => {
    try {
        const pgtas = req.body.pgtas;
        // Log para depuración
        const [rows] = await pool.execute('SELECT * FROM preguntas WHERE texto = ? and estado = 0', [pgtas]);
        if (rows.length > 0) {
            return res.json({
                status: 'error',
                title: 'Error',
                message: 'Pregunta ya Existe'
            });
        }

        // Insertar nueva pregunta
        await pool.execute('INSERT INTO preguntas (texto, estado, fechacreacion, fechaproceso) VALUES (?, ?, ?, ?,)', [pgtas, 0, curdate(), null]);
        res.json({
            status: 'success',
            title: 'Registro Exitoso',
            message: '¡Registrado correctamente!'

        });
    } catch (error) {
        res.json({
            status: 'success',
            title: 'Registro de Preguta NO Exitoso...aqui',
            message: '¡Error en el servidor! BD'
        });

    }
});

// modifica preguntas - post
app.post('/preguntasmod', async (req, res) => {
    try {
        const ids = req.body.ids;
        const pgtas = req.body.pgtas;
        // Insertar nuevo usuario
        await pool.execute('UPDATE preguntas SET texto = ? WHERE id = ?', [pgtas, ids]);
        res.json({
            status: 'success',
            title: 'Actualizacion Exitosa',
            message: '¡Registrado correctamente!'
        });
    } catch (error) {
        res.json({
            status: 'success',
            title: 'Registro de Preguta NO Exitoso...aqui',
            message: '¡Error en el servidor! BD'
        });
    }
});

// register - post
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

/* Eliminar pregunta */

app.post('/preguntaseli', async (req, res) => {
    try {
        const ids = req.body.ids;
        const pgtas = req.body.pgtas;

        // Log para depuración
        const [rows] = await pool.execute('delete from sarlaft.preguntas where id = ?', [ids]);        
//        await pool.execute('UPDATE preguntas SET estado=1 WHERE id = ?', [ids]);
//        await pool.execute('delete from preguntas WHERE id = ?', [ids]);
        return res.json({
            status: 'success',
            title: 'Borrado Exitoso.',
            message: '¡Registro Exitoso! BD'
        });
    } catch (error) {
        res.json({
            status: 'error',
            title: 'Borrado de Preguta NO Exitoso',
            message: `Error: ${error.message}`
        });
    }
});


// SUBIR ARCHIVO TXT
 



//
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

app.get('/seleccion', async (req, res) => {
    try {
        const [rows] = await pool.execute("select * from preguntas");
        // Verifica si se están obteniendo los datos correctamente
        res.render('opc1', { data: rows });


    } catch (error) {
//        console.error('Error conectando a la base de datos:', error);
        res.status(500).send('Error conectando a la base de datos.');
    }
});


app.get('/opcbtn', async (req, res) => {
    try {
//        console.log('Conexión exitosa, respuesta de la base de datos:', rows);

        const [rows] = await pool.execute("select * from preguntas");
        // Verifica si se están obteniendo los datos correctamente
        res.render('opcbtn', { data: rows });
    } catch (error) {
        console.error('Error conectando a la base de datos:', error);
        res.status(500).send('Error conectando a la base de datos.');
    }
});
 
app.get('/opc1', async (req, res) => {
    try {
        const [rows] = await pool.execute("select * from preguntas where estado=0");
        res.render('opc1', { data: rows });
    } catch (error) {
        res.status(500).send('Error conectando a la base de datos.');
    }
});

app.get('/opc2', async (req, res) => {
    try {
        const [rows] = await pool.execute("select * from preguntas where estado=0");
        res.render('opc2', { data: rows });
    } catch (error) {
        res.status(500).send('Error conectando a la base de datos.');
    }
});


// Backend (Servidor) para procesar preguntas y opciones

// Ruta para procesar los datos del formulario

app.post('/procesar-preguntas-opciones', async (req, res) => {
    const preguntas = [];
    const c1 = 1;
    const c2 = Date;
    const c3 = 0;

    // Recorremos cada pregunta y sus opciones
    for (let key in req.body) {
        if (key.startsWith('pregunta')) {
            const index = key.replace('pregunta', '');
            const pregunta = req.body[key];
            const opciones = req.body['opcionPregunta' + index] || []; // Capturamos las opciones como array
            preguntas.push({
                pregunta: pregunta,
                opciones: Array.isArray(opciones) ? opciones : [opciones] // Si es una sola opción, la convertimos en array
            });
        }
    }
    
    // Procesar cada pregunta y sus opciones usando una función interna
    preguntas.forEach((item, index) => {
        item.opciones.forEach((opcion, opcionIndex) => {
            // Función interna para manejar cada pregunta y opción
            const procesar = () => {
                // Aquí puedes insertar lógica adicional para procesar cada opción
                grabar(item.pregunta, opcion);
            };
            procesar();
        });
    });

    const [result] = await pool.execute('INSERT INTO preguntas (id, texto, tipo, fecha, estado) VALUES (?, ?, ?, ?, ?)', [c1, `${item.pregunta}`, `${opcion}`, c2, c3]);
    res.send('Preguntas y opciones capturadas correctamente');
});

app.get('/ingpreguntas', async (req, res) => {
    try {
        const [rows] = await pool.execute("select * from preguntas where estado=0");
        res.render('ingpreguntas', { data: rows });
    } catch (error) {
                console.error('Error conectando a la base de datos....????:', error);
                res.status(500).send('Error conectando a la base de datos.?????');
            }
    });

app.get('/opciones', async(req, res) => {
    try {
        const id = req.query.id;
        const texto = req.query.texto;
        const [rows] = await pool.execute("select * from pgtaresp where idprg = ?", [id]);
        res.render('opciones', { id, texto, data: rows });
    } catch (error) {
        console.error('Error conectando a la base de datos....????:', error);
        res.status(500).send('Error conectando a la base de datos.?????');
        }
    });
        
        
    app.get('/opcionesss', async (req, res) => {
        const id = req.query.id;
        const texto = req.query.texto;
        console.log(id);
        console.log(texto);
        try {
            const [rows] = await pool.execute("select * from preguntas");
            res.render('opciones', { data: rows });
        } catch (error) {
                    console.error('Error conectando a la base de datos....????:', error);
                    res.status(500).send('Error conectando a la base de datos.?????');
                }
        });
    
   
// FUNCIONES

    function executeActiones(texto) {
   
        // Aquí ejecutas la lógica que deseas, por ejemplo, una llamada AJAX
        fetch('/ruta-api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'confirmar' // Envía datos si es necesario
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire('¡Hecho!', 'Tu acción ha sido confirmada.', 'success').then(() => {
                    // Opcional: redirigir a otra página después de la confirmación
                    window.location.href = '/pagina-destino';
                });
            } else {
                Swal.fire('Error', 'Hubo un problema con la acción.', 'error');
            }
        })
        .catch(error => {
            Swal.fire('Error', 'No se pudo completar la acción.', 'error');
        });
    }

// Definición de la función

    function miFuncion1() {
        console.log('¡La función ha sido llamada!');
    }

    function getGreeting() {
        return 'Hola, mundo!';
      }
      
// *******************
 
app.post('/grabadata', async (req, res) => {
    console.log('ingreso')
    try {
        console.log('ingreso1')
        // Log para depuración
        console.log('1')
        const [rows] = await pool.execute('SELECT * FROM usersss');
        console.log('2')
        if (rows.length > 0) {
            console.log('ver')
            return res.json({
                status: 'error',
                title: 'Error',
                message: 'Usuario ya Existe'
            });
        } 
    } catch (error) {
        console.log('ingreso2')
        res.json({
            status: 'success',
            title: 'Registro Exitoso',
            message: '¡Error en el servidor! BD'
        });
    }
});

async function processCSV(filePath) {
    // Crear una conexión a la base de datos
    const connection = await mysql.createConnection(dbConfig);

    try {
        // Crear la tabla si no existe (ajusta los campos según tu CSV)
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS my_table (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                age INT
            )
        `);

        // Leer el archivo CSV
        const data = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                data.push(row);
            })
            .on('end', async () => {
                // Insertar datos en la base de datos
                for (const row of data) {
                    const { name, age } = row;  // Ajusta según el CSV
                    await connection.execute(
                        'INSERT INTO my_table (name, age) VALUES (?, ?)',
                        [name, age]
                    );
                }

                console.log('Datos insertados con éxito');
                await connection.end();
            });
    } catch (error) {
        console.error('Error:', error);
        await connection.end();
    }
}      


app.post('/save-table-data', async (req, res) => {
    console.log('reg salvar')
    const data = req.body;

    if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: 'No data provided' });
    }

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        for (const item of data) {
            const { name, age } = item;
                await pool.execute('INSERT INTO my_table (name, age) VALUES (?, ?)', [name, age]    
            );
        }
        await connection.commit();
        connection.release();
 
//        res.json({ message: 'Data saved successfully' });

        res.json({
            status: 'success',
            title: 'Registro Exitoso',
            message: '¡Registrado correctamente!'
        })

    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}); 


// 1. - Invocamos a express    

import express, { Router } from 'express';
import session from 'express-session';
import {pool} from './db.js';
import {PORT} from './config.js';
import mysql from 'mysql2/promise'; // Cambiado para usar mysql2 con promesas
import path from 'path';
import { fileURLToPath } from 'url';
import bcryptjs from 'bcryptjs';

// importar archivos

import fs from 'fs';
import { readFile } from 'fs/promises';
import fastcsv from 'fast-csv';
import bodyParser from 'body-parser';
import csv from 'csv-parser'; // CARGAR

//import Swal from 'sweetalert2/dist/sweetalert2.js'  
import Swal from 'sweetalert2';
import { Console } from 'console';

// proceso para carga de archivos

import multer from 'multer';

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

// Configuración de multer para manejar la carga de archivos  -- CARGA --
const upload = multer({ dest: 'uploads/' });

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

 // Middleware
//app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), '../public')));
//app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../public')));


app.use(express.json()); 

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
        res.render('inicio');
    } catch (error) {
        console.error('Error al renderizar la plantilla:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }  
});


// Ruta para renderizar la galería de imágenes

app.get('/login', (req, res)=>{
    res.render('login'); 
})

app.get('/menuprc', (req, res)=>{
    if (req.session.loggedin) {
        const userUser = req.session.user;
        const userName = req.session.name;
        const userRol = req.session.rol;
        res.render('menuprc', { user: userUser, name: userName, rol: userRol });
    } else {
        res.send('Por favor, inicia sesión primero.');
    }
})

app.get('/register', (req, res)=>{
    if (req.session.loggedin) {
        const userUser = req.session.user;
        const userName = req.session.name;
        res.render('register', { user: userUser, name: userName });
    } else {
        res.send('Por favor, inicia sesión primero.');
    }
})

app.get('/preguntas', (req, res)=>{
    if (req.session.loggedin) {
        const userUser = req.session.user;
        const userName = req.session.name;
        res.render('preguntas', { user: userUser, name: userName });
    } else {
        res.send('Por favor, inicia sesión primero.');
    }
})

app.get('/cargas', (req, res)=>{
    if (req.session.loggedin) {
        const userUser = req.session.user;
        const userName = req.session.name;
        res.render('cargas', { user: userUser, name: userName });
    } else {
        res.send('Por favor, inicia sesión primero.');
    }
})

app.get('/modificar', (req, res) => {
    const id = req.query.id;
    const texto = req.query.texto;
    res.render('modificar', { id, texto });
});

app.get('/eliminar', (req, res) => {
    const id = req.query.id;
    const texto = req.query.texto;
    res.render('eliminar', { id, texto });
});

app.get('/moduser', (req, res) => {
    const id = req.query.id;
    const texto = req.query.texto;
    res.render('moduser', { id, texto });
});

app.get('/eliuser', (req, res) => {
    const user = req.query.user;
    const name = req.query.name;
    res.render('eliuser', { user, name });
});

app.get('/preguntasopc', (req, res) => {
    if (req.session.loggedin) {
        const userUser = req.session.user;
        const userName = req.session.name;
        const id = req.query.id; // Obtén el id
        const respuesta = req.query.respuesta; // Obtén la respuesta
        res.render('preguntasopc', { id:id, respuesta:respuesta,user: userUser, name: userName });
    } else {
        res.send('Por favor, inicia sesión primero.');
    }
});

app.get('/modopc', (req, res) => {
    const idvlrprg = req.query.idvlrprg; // variable ej> idvlrprg, que se debe usar en modopc idprg
    const respuesta = req.query.respuesta;
    res.render('modopc', { idvlrprg, respuesta });
});

// Graficos

app.get('/bar', (req, res)=>{
    res.render('bar'); 
})

app.get('/pie', (req, res)=>{
    res.render('pie'); 
})

// 

// 11. Autenticacion 

app.post('/auth', async (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;
    
    // Define el nombre de la tabla como una variable
    const tableName = 'users'; // Puedes cambiar 'users' por cualquier nombre de tabla que desees usar
    // Usa la variable en la consulta SQL
    const [rows] = await pool.execute(`SELECT * FROM ${tableName} WHERE user = ?`, [user]);
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

    // Guardar el campo deseado en la sesión
    req.session.user = userRecord.user;  // Guardar el usuario
    req.session.name = userRecord.name;  // Guardar el nombre del usuario
    req.session.rol = userRecord.rol;  // Guardar el rol del usuario

    return res.json({
        status: 'success',
        title: 'Conexión Exitosa',
        message: '!LOGIN Correcto!'
    });
});

// preguntas - post
app.post('/preguntasreg', async (req, res) => {
    try {
        const user = req.body.user;
        const name = req.body.name;        
        const pgtas = req.body.pgtas;
        // Log para depuración
        const tableName = "preguntas";
        const [rows] = await pool.execute(`select * FROM ${tableName} WHERE texto = ?`, [pgtas]);
        if (rows.length > 0) {
            return res.json({
                status: 'error',
                title: 'Error',
                message: 'Pregunta ya Existe'
            });
        }

        const date = new Date();
        const estado = 0; // Ejemplo de estado
        await pool.execute(`INSERT INTO ${tableName} (texto, estado, fechacreacion) VALUES (?, ?, ?)`, [pgtas, estado, date]);
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

// preguntas - post
app.post('/preguntasregopc', async (req, res) => {
    try {
        const user = req.body.user;
        const name = req.body.name;        
        const pgtas = req.body.pgtas;
        // Log para depuración
        const tableName = "pgtaresp";
        const [rows] = await pool.execute(`select * FROM ${tableName} WHERE texto = ?`, [pgtas]);
        if (rows.length > 0) {
            return res.json({
                status: 'error',
                title: 'Error',
                message: 'Pregunta ya Existe'
            });
        }

        const date = new Date();
        const estado = 0; // Ejemplo de estado
        await pool.execute(`INSERT INTO ${tableName} (texto, estado, fechacreacion) VALUES (?, ?, ?)`, [pgtas, estado, date]);
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

// modificacion opciones - post
app.post('/preguntasmodopc', async (req, res) => {
    try {
        const ids = req.body.ids;
        const pgtas = req.body.pgtas;
        // Insertar nuevo registro
        const tableName = "pgtaresp";
        await pool.execute(`UPDATE ${tableName} SET texto = ? WHERE id = ?`, [pgtas, ids]);
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
        const rz = '1';
        const id_rz = 'qwe';
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
//        await pool.execute('INSERT INTO users (user, name, rol, pass) VALUES (?, ?, ?, ?)', [user, name, rol, passwordHash]);
        await pool.execute('INSERT INTO users (rz, id_rz, user, name, rol, pass, estado) VALUES (?, ?, ?, ?, ?, ?, ?)', [rz, id_rz, user, name, rol, passwordHash, null]);
//      await pool.execute(`INSERT INTO ${tableName} (texto, estado, fechacreacion) VALUES (?, ?, ?)`, [pgtas, estado, date]);

        res.json({
            status: 'success',
            title: 'Registro Exitoso',
            message: '¡Usuario registrado correctamente!'
        });
    } catch (error) {
        res.json({
            status: 'success',
            title: 'Registro ERROR',
            message: `Error: ${error.message}`
        });
    }
});

/* Eliminar pregunta */

app.post('/preguntaseli', async (req, res) => {
    try {
        const ids = req.body.ids;
        const pgtas = req.body.pgtas;

        // Log para depuración

        const [rows] =  await pool.execute('delete from preguntas WHERE id = ?', [ids]);
        //              await pool.execute('delete from preguntas WHERE id = ?', [ids]);
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

/* voto opc1 */
app.post('/procesarseleccion', async (req, res) => {
//    console.log('Datos recibidos:', req.body); // Asegúrate de que esto imprima correctamente
    const selectedValue = req.body.preguntas; // Esto debe contener el valor seleccionado
//    console.log('Valor seleccionado:', selectedValue);
    try {
        const userUser = req.session.user;
        const userName = req.session.name;
        const selectedValue = req.body.preguntas; // Obtén el valor seleccionado
        const [id, respuesta, idp, texto] = selectedValue.split('|');
     
        // EVALUA SI YA VOTO
        const pgtas = req.body.pgtas;
        // Log para depuración

        // SELECT     
        const tablePtas = "respusers";
        const [rows] = await pool.execute(`SELECT pregunta FROM ${tablePtas} WHERE user = ?`, [userUser]);
        
        if (rows.length > 0) {
            const pregunta = rows[0].pregunta;  // Obtenemos la primera fila y el campo "pregunta"
            return res.json({
                status: 'info',
                title: `[ ${pregunta} ]`,
                message: `Voto ya Registrado`
            });
        } else {
            // insert de respuesta
            const tableName = "respusers";
            const date = new Date();
            const estado = 0; // Ejemplo de estado
            await pool.execute(`INSERT INTO ${tableName} (user, idprg, pregunta, idpres, respuesta) VALUES (?, ?, ?, ?, ?)`, [userUser, idp, texto, id, respuesta]);
            return res.json({
                status: 'success',
                title: 'Voto Exitoso.',
                message: '¡Registro Exitoso! BD'
            });
        }
    } catch (error) {
        res.json({
            status: 'error',
            title: 'Grabar Respuesta NO Exitoso',
            message: `Error: ${error.message}`
        });
    }
});

// opc 2 
app.post('/procesar-seleccion', async (req, res) => {
        try {
            const userUser = req.session.user;
            const userName = req.session.name;
            const selectedValue = req.body.pregunta; // Obtén el valor seleccionado
            await pool.execute('UPDATE preguntas SET estado = 0');
            for (const id of selectedValue) {
                const wact = id;
                await pool.execute('UPDATE preguntas SET estado = 1 WHERE id = ?', [wact]);
                if (selectedValue && selectedValue.length > 0) {
                    for (const id of selectedValue) {
                        await pool.execute('UPDATE preguntas SET estado = 1 WHERE id = ?', [id]);
                    }                
                }else{
                    console.log('Error update procesar-seleccion')
                }  
            }
            return res.json({
                status: 'success',
                title: 'Seleccion OK',
                message: '¡Registro Exitoso! BD'
            });   
        } catch (error) {
            res.json({
                status: 'error',
                title: 'Grabar Seleccion Pregunta NO Exitoso',
                message: `Error: ${error.message}`
            });
        }
    });
    
// ejecutar

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

app.get('/seleccion', async (req, res) => {
    try {
        const [rows] = await pool.execute("select * from preguntas");
        // Verifica si se están obteniendo los datos correctamente
        res.render('opc1', { data: rows });


    } catch (error) {
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
        if (req.session.loggedin) {
            const userUser = req.session.user;
            const userName = req.session.name;
//            const [rows] = await pool.execute("select a.texto,a.estado,b.respuesta,b.estado from preguntas a inner join pgtaresp b on a.id=b.idprg where a.estado=0");
            const [rows] = await pool.execute("select a.id as idp,a.texto,a.estado,b.id,b.respuesta,b.estado from preguntas a inner join pgtaresp b on a.id=b.idprg where a.estado=1");
            res.render('opc1', { preguntas: rows, user: userUser, name: userName });
        } else {
            res.send('Por favor, inicia sesión primero.');
        }
    } catch (error) {
        res.status(500).send('Error conectando a la base de datos.');
    }
});

app.get('/opc2', async (req, res) => {
    try {
        const [rows] = await pool.execute("select * from preguntas");
        res.render('opc2', { data: rows });
    } catch (error) {
        res.status(500).send('Error conectando a la base de datos.');
    }
});


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
        const tableName = "preguntas";
        const [rows] = await pool.execute(`select * from ${tableName}`);
//        const [rows] = await pool.execute("select * from preguntas where estado=0");
        if (req.session.loggedin) {
            const userUser = req.session.user;
            const userName = req.session.name;
            res.render('ingpreguntas', { data: rows, user: userUser, name: userName });

        } else {
            res.send('Por favor, inicia sesión primero.');
        }
    } catch (error) {
                console.error('Error conectando a la base de datos....????:', error);
                res.status(500).send('Error conectando a la base de datos.?????');
            }
    });

// Usuarios

app.get('/usuarios', async (req, res) => {
    try {
        const tableName = "users";
        const [rows] = await pool.execute(`select * from ${tableName}`);
        if (req.session.loggedin) {
            const userUser = req.session.user;
            const userName = req.session.name;
            res.render('usuarios', { data: rows, user: userUser, name: userName });

        } else {
            res.send('Por favor, inicia sesión primero.');
        }
    } catch (error) {
                console.error('Error conectando a la base de datos....????:', error);
                res.status(500).send('Error conectando a la base de datos.?????');
            }
    });
    
// modifica usuarios - post

app.post('/usuariomod', async (req, res) => {
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

/* Eliminar usuarios */

app.post('/usuarioeli', async (req, res) => {
    try {
        const ids = req.body.ids;

        // Log para depuración delete

        const [result] = await pool.execute('DELETE FROM users WHERE estado is null AND user = ?', [ids]);
        if (result.affectedRows > 0) {
            // El registro fue eliminado con éxito
            return res.json({
                status: 'success',
                title: 'Eliminado',
                message: 'El usuario ha sido eliminado correctamente.'
            });
        } else {
            // No se eliminó ningún registro
            return res.json({
                status: 'error',
                title: 'Error',
                message: 'No se pudo eliminar el usuario. Es posible que el usuario sea Administrador Principal o No exista.'
            });
        }
    } catch (error) {
        res.json({
            status: 'error',
            title: 'Borrado de Usuario NO Exitoso',
            message: `Error: ${error.message}`
        });
    }
});

// Opciones
    
app.get('/opciones', async(req, res) => {
    try {
        if (req.session.loggedin) {
            const userUser = req.session.user;
            const userName = req.session.name;
            const id = req.query.id;
            const texto = req.query.texto;
            const [rows] = await pool.execute("select * from pgtaresp where idprg = ?", [id]);
            res.render('opciones', { id, texto, data: rows, user: userUser, name: userName });
        } else {
            res.send('Por favor, inicia sesión primero.');
        }
    } catch (error) {
        console.error('Error conectando a la base de datos....????:', error);
        res.status(500).send('Error conectando a la base de datos.?????');
        }
    });
       

// Definición de la función

    function miFuncion1() {
        console.log('¡La función ha sido llamada!');
    }

    function getGreeting() {
        return 'Hola, mundo!';
      }
      
// *** CARGAR ARCHIVO ***

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
    const data = req.body;

    if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: 'No data provided' });
    }

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        // Eliminar registros previos
        await connection.execute('DELETE FROM my_table2');

        // Insertar cada fila en la base de datos
        for (const item of data) {
            const { codigo } = item;
            if (codigo) {  // Validar datos
                await connection.execute('INSERT INTO my_table2 (codigo) VALUES (?)', [codigo]);
            }
        }
        await connection.commit();
        connection.release();
        res.json({
            status: 'success',
            title: 'Registro Exitoso',
            message: '¡Registrado correctamente!'
        });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ message: 'Internal server error' });

        // Rollback en caso de error
        if (connection) {
            await connection.rollback();
            connection.release();
        }
    }
});

//  ***  FIN CARGAR ARCHIVO *** //
// Importaciones de módulos de terceros		
import express, { Router } from 'express';		
import session from 'express-session';		
import mysql from 'mysql2/promise'; // Cambiado para usar mysql2 con promesas		
import multer from 'multer';		
import bodyParser from 'body-parser';		
import fastcsv from 'fast-csv';
import csv from 'csv-parser'; // CARGAR		
import bcryptjs from 'bcryptjs';		
import Swal from 'sweetalert2';		
import fs from 'fs';		
import { readFile } from 'fs/promises';		
		
// Importaciones de archivos locales		
import { pool } from './db.js';		
import { PORT } from './config.js';		
import path from 'path';		
import { fileURLToPath } from 'url';		
import { Console } from 'console';		
		
// Configuración de rutas y variables		
const __filename = fileURLToPath(import.meta.url);		
const __dirname = path.dirname(__filename);		
const app = express();		
const upload = multer({ dest: 'uploads/' });		
		
// Configuración de sesiones		
app.use(session({		
    secret: 'tu_secreto_aqui', // Cambia esto por una cadena secreta		
    resave: false, // No volver a guardar la sesión si no ha habido cambios		
    saveUninitialized: true, // Guarda una sesión incluso si no ha sido inicializada		
    cookie: { secure: false } // Cambia a true si usas HTTPS		
}));		
		
app.use((req, res, next) => {		
    if (!req.session.loggedin) {		
        req.session.loggedin = false;		
    }		
    next();		
});		
		
// Middleware		
app.use(express.static(path.join(__dirname, '../public')));		
app.use(express.json());		
app.use(express.urlencoded({ extended: true }));		
		
// Configuración de vistas		
app.set('view engine', 'ejs');		
app.set('views', path.join(__dirname, '../views'));		
app.use(express.static(path.join(__dirname, 'src')));		
		
// Función de alerta		
function showAlert() {		
    Swal.fire({		
        title: 'Conexión Exitosa',		
        text: '!LOGIN Correcto',		
        icon: 'success',		
        showConfirmButton: false,		
        timer: 1500 // Duración en milisegundos (1500 ms = 1.5 segundos)		
    });		
}		
		
// Rutas		
app.get('/', async (req, res) => {		
    try {		
        res.render('inicio');		
    } catch (error) {		
        console.error('Error al renderizar la plantilla:', error);		
        res.status(500).json({ error: 'Error interno del servidor' });		
    }		
});		

// Rutas de autenticación y registro
app.get('/login', (req, res) => res.render('login'));
app.get('/menuprc', (req, res) => {
    if (req.session.loggedin) {
        const { user, name, rol } = req.session;
        res.render('menuprc', { user, name, rol });
    } else {
        res.send('Por favor, inicia sesión primero.');
    }
});

app.get('/register', (req, res) => {
    if (req.session.loggedin) {
        const { user, name } = req.session;
        res.render('register', { user, name });
    } else {
        res.send('Por favor, inicia sesión primero.');
    }
});

// ajuste const

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
    const user = req.query.user;
    const name = req.query.name;
    const rol = req.query.rol;
    const estado = req.query.estado;
    res.render('moduser', { user, name, rol, estado });
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
    res.render('modopc', { idvlrprg, respuesta});
/*
    idp= id 
    pgp= texto
*/

});

app.get('/eliopc', (req, res) => {
    const idvlrprg = req.query.idvlrprg; // variable ej> idvlrprg, que se debe usar en modopc idprg
    const respuesta = req.query.respuesta;
    res.render('eliopc', { idvlrprg, respuesta});
});

// Rutas para selección y opciones

app.get('/seleccion', async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT * FROM preguntas");
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

// Graficos

app.get('/bar', (req, res)=>{
    res.render('bar'); 
})

app.get('/pie', (req, res)=>{
    res.render('pie'); 
})

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

// 11. Autenticacion 

app.post('/auth', async (req, res) => {
    const { user, pass } = req.body;
    const tableName = 'users';
    const [rows] = await pool.execute(`SELECT * FROM ${tableName} WHERE user = ?`, [user]);
    
    if (rows.length === 0) {
        return res.json({ status: 'error', message: 'Usuario no encontrado' });
    }

    const userRecord = rows[0];
    const passwordMatch = await bcryptjs.compare(pass, userRecord.pass);
    
    if (!passwordMatch) {
        return res.json({ status: 'error', message: 'Contraseña incorrecta' });
    }

    req.session.loggedin = true;
    req.session.user = userRecord.user;
    req.session.name = userRecord.name;
    req.session.rol = userRecord.rol;

    return res.json({ status: 'success', message: '!LOGIN Correcto!' });
});

// preguntas - post

app.post('/preguntasreg', async (req, res) => {
    try {
        const { pgtas } = req.body;
        const tableName = "preguntas";
        const [rows] = await pool.execute(`SELECT * FROM ${tableName} WHERE texto = ?`, [pgtas]);
        if (rows.length > 0) {
            return res.json({ status: 'error', message: 'Pregunta ya Existe' });
        }
        const date = new Date();
        await pool.execute(`INSERT INTO ${tableName} (texto, estado, fechacreacion) VALUES (?, ?, ?)`, [pgtas, 0, date]);
        res.json({ status: 'success', message: '¡Registrado correctamente!' });
    } catch (error) {
        res.json({ status: 'success', message: '¡Registro de Preguta NO Exitoso!' });
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
            title: 'Registro de Preguta NO Exitoso',
            message: '¡Error en el servidor! BD'
        });

    }
});

// modifica preguntas - post
app.post('/preguntasmod', async (req, res) => {
    try {
        const ids = req.body.ids;
        const pgtas = req.body.pgtas;
        const tableName = "preguntas";
        // validar si existe
        const [rows] = await pool.execute(`SELECT * FROM ${tableName} WHERE texto = ? `, [pgtas]);
        if (rows.length > 0) {
            return res.json({
                status: 'error',
                message: 'Opción ya existe'
            });
        }

        // Insertar nuevo usuario
        await pool.execute(`UPDATE ${tableName} SET texto = ? WHERE id = ?`, [pgtas, ids]);

        res.json({
            status: 'success',
            title: 'Actualizacion Exitosa',
            message: '¡Registrado correctamente!'
        });
    } catch (error) {
        res.json({
            status: 'success',
            title: 'Registro de Preguta NO Exitoso',
            message: '¡Error en el servidor! BD'
        });
    }
});

// modificacion opciones - post
app.post('/preguntasmodopc', async (req, res) => {
    try {
        const idp = req.body.idp;
        const id = req.body.id;
        const pgtas = req.body.pgtas;
        const tableName = "pgtaresp";
        //
        const [rows] = await pool.execute(`SELECT * FROM ${tableName} WHERE respuesta = ? AND idprg = ?`, [pgtas, idp]);
        if (rows.length > 0) {
            return res.json({
                status: 'error',
                message: 'Opción ya existe'
            });
        }
        
        // Insertar nuevo registro
        await pool.execute(`UPDATE ${tableName} SET respuesta = ? WHERE id = ?`, [pgtas, id]);
        res.json({
            status: 'success',
            title: 'Actualizacion Exitosa',
            message: '¡Registrado correctamente!'
        });
    } catch (error) {
        res.json({
            status: 'success',
            title: 'Registro de Preguta NO Exitoso',
            message: '¡Error en el servidor! BD'
        });
    }
});

/* Eliminar opciones pregunta */

app.post('/preguntaseliopc', async (req, res) => {
    try {
        const id = req.body.idvlrprg;
        const pgtas = req.body.pgtas;
        // Log para depuración

        const [rows] =  await pool.execute('delete from pgtaresp WHERE id = ?', [id]);
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

// register - post
app.post('/register', async (req, res) => {
    try {
        const rz = '1';
        const id_rz = 'qwe';

        const { user, name, rol, pass } = req.body;

        if (!user || !name || !rol || !pass) {
            return res.status(400).json({ status: 'error', message: 'Todos los campos son obligatorios' });
        }

        const [rows] = await pool.execute('SELECT * FROM users WHERE user = ?', [user]);
        if (rows.length > 0) {
            return res.status(400).json({ status: 'error', message: 'Usuario ya Existe' });
        }

        // Insertar nuevo usuario
        const passwordHash = await bcryptjs.hash(pass, 8);
        await pool.execute('INSERT INTO users (rz, id_rz, user, name, rol, pass, estado) VALUES (?, ?, ?, ?, ?, ?, ?)', [rz, id_rz, user, name, rol, passwordHash, null]);
        res.json({ status: 'success', message: '¡Usuario registrado correctamente!' });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ status: 'error', message: 'Error en el servidor' });
    }
});

/* Eliminar pregunta */

app.post('/preguntaseli', async (req, res) => {
    try {
        const ids = req.body.ids;
        const pgtas = req.body.pgtas;

        // Log para depuración

        const [rows] =  await pool.execute('delete from preguntas WHERE id = ?', [ids]);
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

/* voto opc1 pgtaresp pgtaresp pgtaresp */   
app.post('/procesarseleccion', async (req, res) => {
//    console.log('Datos recibidos:', req.body); // Asegúrate de que esto imprima correctamente
//    const selectedValue = req.body.preguntas; // Esto debe contener el valor seleccionado
//    console.log('Valor seleccionado:', selectedValue);
    try {
        const userUser = req.session.user;
        const userName = req.session.name;
        const selectedValue = req.body.preguntas; // Obtén el valor seleccionado
        const [id, texto, idp, respuesta] = selectedValue.split('|');
//        const id = req.body.id;


        //        console.log(selectedValue);
//        console.log(userUser);

        // EVALUA SI YA VOTO
        const pgtas = req.body.pgtas;
        // Log para depuración

        // SELECT      
        const tablePtas = "respusers";
        const [rows] = await pool.execute(`SELECT respuesta FROM ${tablePtas} WHERE user = ? and idprg = ?`, [userUser, id]);
        
        if (rows.length > 0) {
            const respuesta = rows[0].respuesta;  // Obtenemos la primera fila y el campo "pregunta"
            return res.json({
                status: 'info',
                title: `ya No puede votar`,
                message: `Voto 
                Registrado : [ ${respuesta} ]`
            });
        } else {
            // insert de respuesta
            const tableName = "respusers";
            const date = new Date();
            const estado = 0; // Ejemplo de estado
            await pool.execute(`INSERT INTO ${tableName} (user, idprg, pregunta, idpres, respuesta) VALUES (?, ?, ?, ?, ?)`, [userUser, id, texto, idp, respuesta]);
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

   
// modifica usuarios - post

app.post('/usuariomod', async (req, res) => {
    try {
        const user = req.body.user;
        const name = req.body.name;
        const rol = req.body.rol;
        const estado = req.body.estado;
//        console.log(estado);
        // Insertar nuevo usuario
        await pool.execute('UPDATE users SET name = ?, rol= ? WHERE estado is null AND user = ?', [name, rol, user]);
        if (estado !== '1') {
            return res.json({
                status: 'success',
                title: 'Actualizacion Exitosa',
                message: '¡Registrado correctamente!'
            });
        } else {
            await pool.execute('UPDATE users SET name = ? WHERE user = ?', [name, user]);
            return res.json({
                status: 'question',
                title: 'Actualiza Nombre Usuario',
                message: 'Usuario Administrador Principal, solo permite modificar el Nombre'
            });
        }
    } catch (error) {
//        console.log(error);
        res.json({
            status: 'success',
            title: 'Registro de Preguta NO Exitoso...',
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


 // opciones de preguntas - post   -  createPool

 app.post('/opcionesreg', async (req, res) => {
    const { id, respuesta, pgtas } = req.body;
    try {
        const tableName = "pgtaresp";
        const [rows] = await pool.execute(`SELECT * FROM ${tableName} WHERE idprg= ? and respuesta = ?`, [id, pgtas]);
        if (rows.length > 0) {
            return res.json({
                status: 'error',
                message: 'Opción ya existe'
            });
        }
        const date = new Date();
        const estado = 0; // Ejemplo de estado
        await pool.execute(`INSERT INTO ${tableName} (idprg, pregunta, respuesta, fecha, estado) VALUES (?, ?, ?, ?, ?)`, [id, respuesta, pgtas, date, estado]);
        res.json({
            status: 'success',
            title: 'Registro Exitoso',
            message: '¡Registrado correctamente!'
        });
    } catch (error) {
        console.error('Error en /opcionesreg:', error);
        res.status(500).json({
            status: 'error',
            title: 'Error en el servidor',
            message: '¡Error en el servidor! BD'
        });
    }
});

// Ruta para procesar archivos CSV
async function processCSV(filePath) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        await connection.execute(`CREATE TABLE IF NOT EXISTS my_table (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            age INT
        )`);

        const data = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => data.push(row))
            .on('end', async () => {
                for (const { name, age } of data) {
                    await connection.execute('INSERT INTO my_table (name, age) VALUES (?, ?)', [name, age]);
                }
                console.log('Datos insertados con éxito');
            });
    } catch (error) {
        console.error('Error procesando CSV:', error);
    } finally {
        await connection.end();
    }
}

// Ruta para guardar datos en la tabla
app.post('/save-table-data', async (req, res) => {
    const data = req.body;

    if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: 'No data provided' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute('DELETE FROM my_table2');

        for (const { codigo } of data) {
            if (codigo) {
                await connection.execute('INSERT INTO my_table2 (codigo) VALUES (?)', [codigo]);
            }
        }
        await connection.commit();
        res.json({
            status: 'success',
            title: 'Registro Exitoso',
            message: '¡Registrado correctamente!'
        });
    } catch (error) {
        console.error('Error saving data:', error);
        await connection.rollback();
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
});

// ejecutar

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

/// CERRAR CONEXIONES :  connection.release(); //
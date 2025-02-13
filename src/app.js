 // Importaciones de módulos de terceros		
 import express, { Router } from 'express';		
 import session from 'express-session';		
 import mysql from 'mysql2/promise'; // Cambiado para usar mysql2 con promesas		
 import dotenv from 'dotenv';
 import multer from 'multer';
 import bodyParser from 'body-parser';		
 import fastcsv from 'fast-csv';
 import csv from 'csv-parser'; // CARGAR		
 import bcryptjs from 'bcryptjs';		
 import Swal from 'sweetalert2';
 import crypto from 'crypto';
 import https from 'https';
 import fs from 'fs';
 import { pool } from './db.js';		
 import { PORT } from './config.js';		
 import path from 'path';		
 import { fileURLToPath } from 'url';	
 import mammoth from 'mammoth'; // docx a pdf
 import { PDFDocument } from 'pdf-lib'; // docx a pdf
 
 // Configuración de rutas y variables		
 const __filename = fileURLToPath(import.meta.url);		
 const __dirname = path.dirname(__filename);		
 const app = express();		
 
 app.use(bodyParser.urlencoded({ extended: true }));
 app.set('view engine', 'ejs'); 
 app.set('views', path.join(__dirname, '../views'));
 
 // menus 
  
 import { toggleSubmenu } from './menu.js';
 import { Console, log } from 'console';
 
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
 
 app.get('/', async (req, res) => {		
     try {		
         res.render('loginv');
     } catch (error) {
         console.error('Error al renderizar la plantilla:', error);		
         res.status(500).json({ error: 'Error interno del servidor' });		
     }		
 });		
 
 // INVENTARIOS
 
 app.get('/inventarios', (req, res)=>{
     if (req.session.loggedin) {
         const { user, name, rol, ciudadSeleccionadaCodigo, ciudadSeleccionadaTexto, parqueaderoSeleccionadoCodigo,  parqueaderoSeleccionadoTexto} = req.session;
         const userUser = req.session.unidad;
         res.render('inventarios', { user, rol, name, userUser, ciudadSeleccionadaTexto, ciudadSeleccionadaCodigo, parqueaderoSeleccionadoTexto,parqueaderoSeleccionadoCodigo });
     } else {
         res.send('Por favor, inicia sesión primero.');
     }
 })
 
 app.post('/inventarios', async (req, res) => {
     try {
 //        console.log('DB_HOST:', process.env.DB_HOST);
 //        console.log('DB_USER:', process.env.DB_USER);
 //        console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
 //        console.log('Conectando a la base de datos con estos valores:');
  
         const { CodActivo, observ, selcodcont, selclsf, seledes,descont, esta, prop, CodResp, ActPrin } = req.body;
 
         // Verificar si el activo ya existe
         const [rows] = await pool.execute('SELECT * FROM tbl_inventarios WHERE id_activo = ?', [CodActivo]);
 
         if (rows.length > 0) {
             // Si el registro ya existe, devolver mensaje y opciones
             return res.json({ 
                 status: 'exists', 
                 message: 'El registro ya existe.',
                 codActivo: CodActivo ,
                 options: {
                     delete: true,  // Opción para eliminar
                     keep: true     // Opción para mantener
                 }
             });
         }
 
         const options = { timeZone: 'America/Bogota', hour12: false };
         const colombiaDate = new Date().toLocaleString('en-US', options);
 
         //console.log(colombiaDate);
 
         await pool.execute('INSERT INTO tbl_inventarios (id_activo, desobs, codcont, codact, desact, descont, estado, propio, responsable, actprin, usuario, ciudad, parqueadero, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )', [CodActivo, observ, selcodcont, selclsf, seledes, descont, esta, prop, CodResp, ActPrin,req.session.user,req.session.ciudadSeleccionadaCodigo,req.session.parqueaderoSeleccionadoCodigo, colombiaDate ]);
         res.json({ status: 'success', message: '¡Activo registrado correctamente!' });
 
     } catch (error) {
         console.error('Error en registro:', error);
         res.status(500).json({ status: 'error', message: `Error: ${error.code}` });
     }
 });
 
 // inventarios ELIMINAR
 
 app.post('/inventeli', async (req, res) => {
     try {
         const ids = req.body.CodActivo;
 
         // Log para depuración
 
         const [rows] =  await pool.execute('delete from tbl_inventarios WHERE id_activo = ?', [ids]);
         return res.json({
             status: 'success',
             title: 'Borrado Exitoso.',
             message: '¡Registro Exitoso! BD'
         });
     } catch (error) {
         if (error.code === 'ER_ROW_IS_REFERENCED') {
             return res.json({
                 status: 'error',
                 title: 'Borrado No Exitoso',
                 message: 'No se puede eliminar la pregunta porque tiene dependencia de OPCIONES.'
             });
         }
         // Para cualquier otro tipo de error
         return res.json({
             status: 'error',
             title: 'Error de Borrado',
             message: `Error: ${error.code}`
         });
     }
 });
 
 
 app.get('/datos', async (req, res) => {
     try {
         // Consultar ciudades
         const [ciudades] = await pool.execute('SELECT id_ciudad, ciudad FROM tbl_ciudades');
 
         // Consultar parqueaderos
         const [parqueaderos] = await pool.execute('SELECT id_parq, parq, id_ciudad FROM tbl_parqueaderos');
 
         // Enviar las ciudades y parqueaderos como respuesta JSON
         res.json({ ciudades, parqueaderos});
     } catch (error) {
         console.error("Error al obtener los datos: ", error);
         res.status(500).json({ status: 'error', message: 'Error del servidor' });
     }
 });
 
 // Ruta GET para obtener las ciudades y parqueaderos
 
 app.get('/dataSelec', async (req, res) => {
     try {
         // Consultar codigos contables
         const [descontable] = await pool.execute('SELECT id_codcont, des_codcont FROM tbl_codcont');
         // Consultar descripciones activos
         const [desactivos] = await pool.execute('SELECT id_clsf, id_codcont, des_codcont, des_contable FROM tbl_clsact order by des_codcont');
         // Consultar estados
         const [desestado] = await pool.execute('SELECT id_codcont, des_codcont FROM tbl_estado');
         // Consultar propio
         const [despropio] = await pool.execute('SELECT id_codcont, des_codcont FROM tbl_propio');
 
         // Enviar las ciudades y parqueaderos como respuesta JSON
         
         res.json({ descontable, desactivos, desestado, despropio });
     } catch (error) {
         console.error("Error al obtener los datos: ", error);
         res.status(500).json({ status: 'error', message: 'Error del servidor' });
     }
 });
 
 app.get('/register', (req, res) => {
     if (req.session.loggedin) {
         res.render('register');
     } else {
         res.send('Por favor, inicia sesión primero.');
     }
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
 
 app.get('/usuarios', async (req, res) => {
     try {
         const tableName = "tbl_users";
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
 
 app.post('/loginv', async (req, res) => {
     const { user, pass, ciud, parq, ciudadSeleccionada, ciudadSeleccionadaTexto, parqueaderoSeleccionado, parqueaderoSeleccionadoTexto  } = req.body;
 
     // Validación de usuario
     const tableName = 'tbl_users';
     const [rows] = await pool.execute(`SELECT * FROM ${tableName} WHERE user = ?`, [user]);
 
     if (rows.length === 0) {
         return res.json({ status: 'error', message: 'Usuario no encontrado' });
     }
 
     const userRecord = rows[0];
     const passwordMatch = await bcryptjs.compare(pass, userRecord.pass);
 
     if (!passwordMatch) {
         return res.json({ status: 'error', message: 'Contraseña incorrecta' });
     }
 
     // Aquí puedes hacer algo con los valores de "ciud" y "parq"
     // Por ejemplo, verificarlos en la base de datos o guardarlos en la sesión
     //console.log(`Ciudad seleccionada server: ${ciud}, Parqueadero seleccionado: ${parq}`);
 
     req.session.loggedin = true;
     req.session.user = userRecord.user;
     req.session.name = userRecord.name;
     req.session.rol = userRecord.rol;
     req.session.pass = userRecord.pass;
 
     // Guardar las variables en la sesión
     req.session.ciudadSeleccionadaCodigo = ciudadSeleccionada;
     req.session.ciudadSeleccionadaTexto = ciudadSeleccionadaTexto;
     req.session.parqueaderoSeleccionadoCodigo = parqueaderoSeleccionado;
     req.session.parqueaderoSeleccionadoTexto = parqueaderoSeleccionadoTexto;
 
     return res.json({ status: 'success', message: '!LOGIN Correcto ingreso!' });
 });
  
 app.post('/register', async (req, res) => {
     try {
         const rz = '1';
         const id_rz = 'Propiedad';
         const { UsuarioNew, UsuarioNom, rol, PassNew } = req.body;
         if (!UsuarioNew || !UsuarioNom || !rol || !PassNew) {
             return res.status(400).json({ status: 'error', message: 'Todos los campos son obligatorios' });
         }
 
         const [rows] = await pool.execute('SELECT * FROM tbl_users WHERE user = ?', [UsuarioNew]);
         if (rows.length > 0) {
             return res.status(400).json({ status: 'error', message: 'Usuario ya Existe' });
         }
 
         // Insertar nuevo usuario
         const passwordHash = await bcryptjs.hash(PassNew, 8);
         await pool.execute('INSERT INTO tbl_users (rz, id_rz, user, name, pass, rol, estado ) VALUES (?, ?, ?, ?, ?, ?, ?)', [rz, id_rz, UsuarioNew, UsuarioNom, passwordHash, rol, null ]);
         res.json({ status: 'success', message: '¡Usuario registrado correctamente!' });
     } catch (error) {
         console.error('Error en registro:', error);
         res.status(500).json({ status: 'error', message: 'Error en el servidor' });
     }
 });
 
 app.post('/usuariomod', async (req, res) => {
     try {
         const user = req.body.user;
         const name = req.body.name;
         const rol = req.body.rol;
         const estado = req.body.estado;
 
         // Insertar nuevo usuario
         await pool.execute('UPDATE tbl_users SET name = ?, rol = ? WHERE (estado IS NULL OR estado = 0) AND user = ?', [name, rol, user]);
         if (estado !== '1') {
             return res.json({
                 status: 'success',
                 title: 'Actualizacion Exitosa',
                 message: '¡Registrado correctamente!'
             });
         } else {
             await pool.execute('UPDATE tbl_users SET name = ? WHERE user = ?', [name, user]);
             return res.json({
                 status: 'question',
                 title: 'Actualiza Nombre Usuario',
                 message: 'Usuario Administrador Principal, solo permite modificar el Nombre'
             });
         }
     } catch (error) {
         res.json({
             status: 'success',
             title: 'Registro de Preguta NO Exitoso...',
             message: '¡Error en el servidor! BD'
         });
     }
 });
 
 app.post('/usuarioeli', async (req, res) => {
     try {
         const ids = req.body.ids;
 
         // Log para depuración delete
 
         const [result] = await pool.execute('DELETE FROM tbl_users WHERE (estado IS NULL OR estado = 0) AND user = ?', [ids]);
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
 
 app.listen(PORT, () => {
     console.log(`Server is running at http://localhost:${PORT}`);
 });
 
 /// CERRAR CONEXIONES :  connection.release(); //
 
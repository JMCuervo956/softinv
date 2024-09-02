  
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

// Configura el motor de plantillas EJS
 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.set('views', './views'); 

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
    
// 11. Autenticacion
   
app.post('/auth', async(req, res)=>{    // uso modulo de crud
    const wvalor = 12345
    const user = req.body.user;         // toma : name="user" // capturar valores ingresados de usuario y password
    const pass = req.body.pass;         // toma : name="pass" // capturar valores ingresados de usuario y password
    let passwordHaash = await bcryptjs.hash(pass, 8);
    if (user && pass){
            connection.query('select * from sarlaft.users where user = ?', [user], async(error, results)=>{
                if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
/*

                res.render('inde',{
                    wvalor:wvalor,
                    alert: true,
                    alertTitle: "Error............",
                    alertMessage:"Usuario y/o Password Incorrecto",
                    alertIcon:'error',
                    showConfirmButton:true,
                    timer:false,
                    ruta:'inde' 
                });
*/

                res.render('login',{
                    wvalor:wvalor,
                    alert: true,
                    alertTitle: "Error............",
                    alertMessage:"Usuario y/o Password Incorrecto",
                    alertIcon:'error',
                    showConfirmButton:true,
                    timer:false,
                    ruta:'login' 
                }); 
                }else{
              const wname = wvalor;
                req.session.loggedin = true             // ayuda las demas paginas para saber que todo esta ok
                req.session.name = results[0].name
                console.log("El nombre es:", id = results[0].name);
                res.render('login',{
                    wvalor:wvalor,
                    alert: true,
                    alertTitle: "Conexion Exitosa",
                    alertMessage:"!LOGIN Correcto",
                    alertIcon:'success',
                    showConfirmButton:false,
                    timer:500,
                    ruta:'',
                    id: id
                    }
                    )
            }
        }) 
    }else{
        res.render('login',{
            wvalor:wvalor,
            alert: true,
            alertTitle: "Advertencia",
            alertMessage:"Ingrese Data Correcta",
            alertIcon:'warning',
            showConfirmButton:true,
            timer:1500,
            ruta:''})
        } 
})

app.listen(PORT, () => {
    console.log('Server en port', PORT);
}); 
      
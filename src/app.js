
// 1. - Invocamos a express
import express from 'express';
import {pool} from './db.js';
import {PORT} from './config.js';
import mysql from 'mysql2';
 
const app = express()

import http from 'http';

// Crear el servidor y asignarlo a la variable 'server'

app.get('/', async(req, res)=>{
    const rows = await pool.query("select * from preguntas")
    res.json(rows)
})

/*
const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    //res.end('Hello World\n');
});
*/


// Hacer que el servidor escuche en el puerto 3000

/*
server.listen(3000, '127.0.0.1', () => {
    console.log('Servidor corriendo en.................. http://127.0.0.1:/', 3000);
});
*/
 

/*
app.get('/', async(req, res)=>{
    const rows = await pool.query("select * from preguntas")
    res.json(rows)
})
*/
 
////////////////////////////////////////////////////////

app.listen(PORT)
console.log('Server en port', PORT) 


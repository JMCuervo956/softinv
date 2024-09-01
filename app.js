import http from 'http';

// Crear el servidor y asignarlo a la variable 'server'
const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    //res.end('Hello World\n');
});

// Hacer que el servidor escuche en el puerto 3000
server.listen(3005, '127.0.0.1', () => {
    console.log('Servidor corriendo en :::::::::::::::http://127.0.0.1:3005/');
});


import {createPool} from 'mysql2';
//import {createConnection} from 'mysql2/promise';
import mysql from 'mysql2/promise';
import {
    DB_HOST,
    DB_NAME,
    DB_PASSWORD,
    DB_USER,
    DB_PORT
} from './config.js';

export const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT
})
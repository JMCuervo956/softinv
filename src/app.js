
import express from 'express'
import {pool} from './db.js'
import {PORT} from './config.js'

const app = express()

app.get('/', async(req, res)=>{
    const rows = await pool.query("select * from preguntas")
    res.json(rows)
})

app.listen(PORT)
console.log('Server en port', PORT)
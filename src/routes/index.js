import { Router } from "express"
const router = Router()
router.get('/', (req, res) => res.render('index', { title: 'Primer Web with Node BD ' }))
/*
router.get('/about', (req, res) => res.render('about', { title: ' t about ' }))
router.get('/contact', (req, res) => res.render('contact', { title: 't contact ' }))
router.get('/login', (req, res) => res.render('login', { title: 'log ' }))
router.get('/votaciones', (req, res) => res.render('votaciones', { title: 'Vot ' }))
router.get('/asistentes', (req, res) => res.render('asistentes', { title: 'Asis ' }))
*/
export default router
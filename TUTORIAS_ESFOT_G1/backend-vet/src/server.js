// Requerir los módulos
import routerEstudiante from './routers/estudiante_routes.js'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';




// Inicializaciones
const app = express()
dotenv.config()

// Configuraciones 
app.set('port',process.env.port || 3000)
app.use(cors())

// Middlewares 
app.use(express.json())


// Variables globales




// Ruta principal
app.get('/',(req,res)=>{
    res.send("Server on")
})
// Rutas para veterinarios
app.use('/api',routerEstudiante)
// Manejo de una ruta que no sea encontrada
app.use((req,res)=>res.status(404).send("Endpoint no encontrado - 404"))


// Exportar la instancia de express por medio de app
export default  app
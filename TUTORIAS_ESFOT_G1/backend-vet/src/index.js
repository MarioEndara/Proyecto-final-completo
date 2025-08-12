
import dotenv from 'dotenv';
dotenv.config();

import app from './server.js';
import connection from './database.js';
import http from 'http';
import { Server } from 'socket.io';
import Administrador from './models/Administrador.js'; // Importa el modelo Admin



// Función para crear el admin por defecto
const crearAdminPorDefecto = async () => {
  try {
    const emailAdmin = "admin@esfot.com";

    const adminExistente = await Administrador.findOne({ email: emailAdmin });
    if (!adminExistente) {
      const nuevoAdmin = new Administrador({
        nombre: "José",
        apellido: "Vargas",
        email: emailAdmin,
        password: await Administrador.prototype.encrypPassword("admin1234"), // cifra la contraseña
        rol: "administrador",
        confirmEmail: true,
      });
      await nuevoAdmin.save();
      console.log("Admin por defecto creado.");
    } else {
      console.log("Admin por defecto ya existe.");
    }
  } catch (error) {
    console.log("Error al crear admin por defecto:", error);
  }
};

const main = async () => {
  try {
    await connection();
    console.log("Conexión a base de datos exitosa.");

    await crearAdminPorDefecto();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      }
    });

    io.on('connection', (socket) => {
      console.log('Usuario conectado:', socket.id);

      socket.on('enviar-mensaje-front-back', (payload) => {
        socket.broadcast.emit('enviar-mensaje-front-back', payload);

        const userMessage = payload.body.toLowerCase();
        let botReply = "";

        if (userMessage.includes("hola")) {
          botReply = `¡Hola, ${payload.from}! ¿Cómo estás? 😊`;
        } else if (userMessage.includes("adiós") || userMessage.includes("chau")) {
          botReply = `Hasta luego, ${payload.from}. ¡Que tengas un buen día! 👋`;
        } else if (userMessage.includes("gracias")) {
          botReply = `¡De nada, ${payload.from}! 😊`;
        } else if (userMessage.includes("hora") || userMessage.includes("atención") || userMessage.includes("atienden")) {
          botReply = `Nuestro horario de atención es de lunes a viernes, desde las 8:00 a.m. hasta las 6:00 p.m. ⏰`;
        } else {
          botReply = `Lo siento, ${payload.from}, no entendí tu mensaje. ¿Puedes intentar con otra frase? 🤖`;
        }

        const respuestaBot = {
          body: botReply,
          from: "ChatBot 🤖"
        };

        socket.emit('enviar-mensaje-front-back', respuestaBot);
      });

      socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
      });
    });

    const PORT = app.get('port') || 3000;
    server.listen(PORT, () => {
      console.log(`Servidor activo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Error iniciando el servidor:", error);
  }
};

main();

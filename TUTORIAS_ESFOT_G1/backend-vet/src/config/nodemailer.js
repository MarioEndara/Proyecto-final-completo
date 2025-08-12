import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config()


let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.HOST_MAILTRAP,
    port: process.env.PORT_MAILTRAP,
    auth: {
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP,
    }
});

const sendMailToRegister = (userMail, token) => {
    let mailOptions = {
        from: '"Tutorías ESFOT" <admin@tuto.esfot.com>',
        to: userMail,
        subject: "TUTORIAS ESFOT - 🩵 🎓 👨 📖 👩 - Confirmación de cuenta",
        html: `
        <p>Hola, haz clic <a href="${process.env.URL_BACKEND}administradores/confirmar/${token}">aquí</a> para confirmar tu cuenta.</p>
        <hr>
        <footer>El equipo de TUTORIAS ESFOT te da la más cordial bienvenida.</footer>
        `,
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Error al enviar el correo (admin):", error);
        } else {
            console.log("Mensaje enviado satisfactoriamente (admin):", info.messageId);
        }
    });
};

// Correo para restablecer contraseña - ADMINISTRADORES
const sendMailToRecoveryPassword = async (userMail, token) => {
    let info = await transporter.sendMail({
    from: '"Tutorías ESFOT" <admin@tuto.esfot.com>',
    to: userMail,
    subject: "Tutorías ESFOT - 🩵 🎓 👨 📖 👩 - Restablecer contraseña",
    html: `
    <h1>Tutorías ESFOT</h1>
    <hr>
    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
    <a href="${process.env.URL_BACKEND}administradores/reset/${token}">Restablecer contraseña</a>
    <hr>
    <footer>El equipo de Tutorías ESFOT te da la bienvenida.</footer>
    `,
    });
    console.log("Correo de recuperación enviado (admin):", info.messageId);
};

// CORREOS PARA TUTORES (NUEVO)

// Correo para confirmar cuenta - TUTORES
const sendMailToRegisterTutor = (userMail, token) => {
  let mailOptions = {
    from: '"Tutorías ESFOT" <admin@tuto.esfot.com>',
    to: userMail,
    subject: "TUTORIAS ESFOT - 🩵 🎓 👨 📖 👩 - Confirmación de cuenta (Tutor)",
    html: `
      <p>Hola, haz clic <a href="${process.env.URL_BACKEND}tutores/confirmar/${token}">aquí</a> para confirmar tu cuenta como tutor.</p>
      <hr>
      <footer>El equipo de TUTORIAS ESFOT te da la más cordial bienvenida.</footer>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Error al enviar el correo (tutor):", error);
    } else {
      console.log("Mensaje enviado satisfactoriamente (tutor):", info.messageId);
    }
  });
};

// Correo para restablecer contraseña - TUTORES
const sendMailToRecoveryPasswordTutor = async (userMail, token) => {
  let info = await transporter.sendMail({
    from: '"Tutorías ESFOT" <admin@tuto.esfot.com>',
    to: userMail,
    subject: "Tutorías ESFOT - 🩵 🎓 👨 📖 👩 - Restablecer contraseña (Tutor)",
    html: `
      <h1>Tutorías ESFOT</h1>
      <hr>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${process.env.URL_BACKEND}tutores/reset/${token}">Restablecer contraseña</a>
      <hr>
      <footer>El equipo de Tutorías ESFOT te da la bienvenida.</footer>
    `,
  });

  console.log("Correo de recuperación enviado (tutor):", info.messageId);
};


// Correo para confirmar cuenta - ESTUDIANTES
const sendMailToRegisterEstudiante = (userMail, token) => {
  let mailOptions = {
    from: '"Tutorías ESFOT" <admin@tuto.esfot.com>',
    to: userMail,
    subject: "TUTORIAS ESFOT - 🩵 🎓 👨 📖 👩 - Confirmación de cuenta (Estudiante)",
    html: `
      <p>Hola, haz clic <a href="${process.env.URL_FRONTEND}confirm/${token}">aquí</a> para confirmar tu cuenta como estudiante.</p>
      <hr>
      <footer>El equipo de TUTORIAS ESFOT te da la más cordial bienvenida.</footer>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Error al enviar el correo (estudiante):", error);
    } else {
      console.log("Mensaje enviado satisfactoriamente (estudiante):", info.messageId);
    }
  });
};

// Correo para restablecer contraseña - ESTUDIANTES
const sendMailToRecoveryPasswordEstudiante = async (userMail, token) => {
  let info = await transporter.sendMail({
    from: '"Tutorías ESFOT" <admin@tuto.esfot.com>',
    to: userMail,
    subject: "Tutorías ESFOT - 🩵 🎓 👨 📖 👩 - Restablecer contraseña (Estudiante)",
    html: `
      <h1>Tutorías ESFOT</h1>
      <hr>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${process.env.URL_FRONTEND}reset/${token}">Restablecer contraseña</a>
      <hr>
      <footer>El equipo de Tutorías ESFOT te da la bienvenida.</footer>
    `,
  });

  console.log("Correo de recuperación enviado (estudiante):", info.messageId);
};

export {
  sendMailToRegister,
  sendMailToRecoveryPassword,
  sendMailToRegisterTutor,
  sendMailToRecoveryPasswordTutor,
  sendMailToRegisterEstudiante, 
  sendMailToRecoveryPasswordEstudiante 
};


//${process.env.URL_FRONTEND}reset/${token}



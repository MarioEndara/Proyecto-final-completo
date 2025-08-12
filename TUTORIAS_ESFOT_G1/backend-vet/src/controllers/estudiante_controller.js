
import Estudiante from "../models/Estudiante.js"
import { sendMailToRegisterEstudiante, sendMailToRecoveryPasswordEstudiante } from "../config/nodemailer.js"
import { crearTokenJWT } from "../middlewares/JWT.js"




const registro = async (req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await Estudiante.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    const nuevoEstudiante = new Estudiante(req.body)
    nuevoEstudiante.password = await nuevoEstudiante.encrypPassword(password)
    const token = nuevoEstudiante.crearToken()
    await sendMailToRegisterEstudiante(email,token)
    await nuevoEstudiante.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})
}




const confirmarMail = async (req, res) => {
    const { token } = req.params;
    const estudianteBDD = await Estudiante.findOne({ token });
    if (!estudianteBDD?.token) {
        return res.status(404).json({ msg: "La cuenta ya ha sido confirmada" });
    }

    estudianteBDD.token = null;
    estudianteBDD.confirmEmail = true;
    await estudianteBDD.save();

    res.status(200).json({ msg: "Token confirmado, ya puedes iniciar sesión" });
};

const recuperarPassword = async (req, res) => {
    const { email } = req.body;

    if (Object.values(req.body).includes("")) {
        return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    const estudianteBDD = await Estudiante.findOne({ email });
    if (!estudianteBDD) {
        return res.status(404).json({ msg: "Lo sentimos, el usuario no existe" });
    }

    const token = estudianteBDD.crearToken();
    estudianteBDD.token = token;
    await sendMailToRecoveryPasswordEstudiante(email, token);
    await estudianteBDD.save();

    res.status(200).json({ msg: "Revisa tu correo para restablecer tu contraseña" });
};

const comprobarTokenPassword = async (req, res) => {
    const { token } = req.params;
    const estudianteBDD = await Estudiante.findOne({ token });

    if (estudianteBDD?.token !== token) {
        return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
    }

    await estudianteBDD.save();
    res.status(200).json({ msg: "Token confirmado, ya puedes crear tu nuevo password" });
};

const crearNuevoPasssword = async (req, res) => {
    const { password, confirmpassword } = req.body;

    if (Object.values(req.body).includes("")) {
        return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    if (password !== confirmpassword) {
        return res.status(404).json({ msg: "Lo sentimos, los passwords no coinciden" });
    }

    const estudianteBDD = await Estudiante.findOne({ token: req.params.token });

    if (estudianteBDD?.token !== req.params.token) {
        return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
    }

    estudianteBDD.token = null;
    estudianteBDD.password = await estudianteBDD.encrypPassword(password);
    await estudianteBDD.save();

    res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nuevo password" });
    
};


const login = async (req, res) => {
    const { email, password } = req.body;

    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    const estudianteBDD = await Estudiante.findOne({ email }).select("-status -__v -token -createdAt -updatedAt");

    if (estudianteBDD?.confirmEmail === false) {
        return res.status(401).json({ msg: "Debes confirmar tu cuenta antes de iniciar sesión" });
    }

    if (!estudianteBDD) {
        return res.status(404).json({ msg: "El usuario no existe" });
    }

    const verificarPassword = await estudianteBDD.matchPassword(password);
    if (!verificarPassword) {
        return res.status(401).json({ msg: "El password es incorrecto" });
    }

    const { nombre, apellido, direccion, telefono, _id, rol } = estudianteBDD;
    const token = crearTokenJWT(estudianteBDD._id, estudianteBDD.rol);

    res.status(200).json({
        token,
        rol,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
    });
};


const perfil = (req, res) => {
    const { token, confirmEmail, createdAt, updatedAt, __v, ...datosPerfil } = req.estudianteBDD;
    res.status(200).json(datosPerfil);
};

const actualizarPerfil = async (req, res) => {
    try {
        const estudiante = await Estudiante.findById(req.estudianteBDD._id);
        if (!estudiante) return res.status(404).json({ msg: "Estudiante no encontrado" });

        const camposPermitidos = ["nombre", "apellido", "telefono", "direccion", "universidad", "facultad", "carrera"];
        camposPermitidos.forEach((campo) => {
            if (req.body[campo] !== undefined) {
                estudiante[campo] = req.body[campo];
            }
        });

        await estudiante.save();
        res.status(200).json({ msg: "Perfil actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar perfil", error });
    }
};

const cambiarPassword = async (req, res) => {
    const { passwordActual, passwordNuevo, confirmarPassword } = req.body;

    if ([passwordActual, passwordNuevo, confirmarPassword].includes("")) {
        return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    const estudianteBDD = await Estudiante.findById(req.estudianteBDD._id);
    const verificarPassword = await estudianteBDD.matchPassword(passwordActual);

    if (!verificarPassword) return res.status(403).json({ msg: "El password actual es incorrecto" });
    if (passwordNuevo !== confirmarPassword) return res.status(400).json({ msg: "Los passwords no coinciden" });

    estudianteBDD.password = await estudianteBDD.encrypPassword(passwordNuevo);
    await estudianteBDD.save();
    res.status(200).json({ msg: "Password actualizado correctamente" });
};

export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPasssword,
    login,
    perfil,
    actualizarPerfil,
    cambiarPassword
};




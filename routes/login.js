var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var SEED = require("../config/config").SEED;
var CLIENT_ID = require("../config/config").CLIENTID;

var app = express();
var Usuario = require("../models/usuario");

//Google
//Validar token con google
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

var mdAutenticacion = require("../middlewares/autenticacion");

//=========================================
//Autenticación Google
//=========================================
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
  return {
    name: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}

// var token = jwt.sign({ usuario: req.usuario }, SEED, {
//   expiresIn: 14400 
// });

//=========================================
//Renovar Token
//=========================================
app.post('/renuevatoken', mdAutenticacion.VerificarToken, (req,resp) => {

  var token = jwt.sign({ usuario: req.usuario }, SEED, {
    expiresIn: 14400
  });

  resp.status(200).json({ 
    ok: true,
    token:token
  });
});

app.post("/google", async (req, res) => {
  var token = req.body.token;
  var googleUser = await verify(token).catch(err => {
    return res.status(403).json({
      ok: false,
      mensaje: "Token no valido"
    });
  });

  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "error al buscar usuarios.",
        errors: err
      });
    }
 
    if (usuarioDB) {
      if (usuarioDB.google === false) {
        return res.status(400).json({
          ok: false,
          mensaje: "Debe de usar su autenticación normal"
        });
      } else {
        var token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400
        });
        usuarioDB.password = ":)";
        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id,
          menu: obtenerMenu(usuarioDB.role)
        });
      }
    } else {
      //El usuario no existe habra que crearlo
      var usuario = new Usuario();
      usuario.nombre = googleUser.name;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = ":)";
      usuario.save((err, usuarioDB) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "error al buscar usuarios.",
            errors: err
          });
        }
        var token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400
        });

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id,
          menu: obtenerMenu(usuarioDB.role)
        });
      });
    }
  });
});
//=========================================
//Autenticación Normal
//=========================================
app.post("/", (req, res) => {
  var body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "error al buscar usuarios.",
        errors: err
      });
    }
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales incorrectas -email",
        errors: err
      });
    }
    //Si llegamos a este punto el usuario al menos ingreso un correo valido
    //Verificamos la contraseña con el método bcrypt.compareSync.

    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales incorrectas -password",
        errors: err
      });
    }
    usuarioDB.password = ":)";
    //Crear un token
    var token = jwt.sign({ usuario: usuarioDB }, SEED, {
      expiresIn: 14400
    });

    res.status(200).json({
      ok: true,
      imagen: usuarioDB.img,
      usuario: usuarioDB,
      token: token,
      id: usuarioDB._id,
      menu: obtenerMenu(usuarioDB.role)
    });
  });
});

function obtenerMenu(Role) {
  var menu = [
    {
      titulo: "Principal",
      icono: "mdi mdi-gauge",
      submenu: [
        { titulo: "Dashboard", url: "/dashboard" },
        { titulo: "ProgressBar", url: "/progress" },
        { titulo: "Graficas", url: "/graficas1" },
        { titulo: "Promesas", url: "/promesas" },
        { titulo: "Rxjs", url: "/rxjs" }
      ]
    },
    {
      titulo: "Mantenimientos",
      icono: "mdi mdi-folder-lock-open",
      submenu: [
        // { titulo: "Usuarios", url: "/usuarios" },
        { titulo: "Hospitales", url: "/hospitales" },
        { titulo: "Medicos", url: "/medicos" }
      ]
    }
  ];

  if (Role === "ADMIN_ROLE") {
    menu[1].submenu.unshift({ titulo: "Usuarios", url: "/usuarios" });
  }

  return menu;
}

module.exports = app;

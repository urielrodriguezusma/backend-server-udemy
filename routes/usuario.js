var express = require("express");

var app = express();
var bcrypt = require("bcryptjs");
var Usuario = require("../models/usuario");

// var jwt = require("jsonwebtoken");

var mdAutenticacion = require("../middlewares/autenticacion");

//Rutas

//==============================================
// Obtener Todos los Usuarios
//==============================================
app.get("/", (request, response, next) => {
  Usuario.find({}, "nombre email img role").exec((err, usuarios) => {
    if (err) {
      return response.status(500).json({
        ok: false,
        mensaje: "Error cargando usuarios",
        errors: err
      });
    }
    response.status(200).json({
      ok: true,
      usuarios: usuarios
    });
  });
});

//==============================================
// Actualizar un usuario
//==============================================
app.put("/:id",mdAutenticacion.VerificarToken, (req, res) => {
  var id = req.params.id;

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "El usuario al buscar usuario.",
        errors: err
      });
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: "El usuario con el id " + id + " no existe.",
        errors: { message: "No existe un usuario con ese id." }
      });
    }

    var body = req.body;
    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el usuario.",
          errors: err
        });
      }
      usuarioGuardado.password = ":)";

      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado
      });
    });
  });
});

//==============================================
// Crear un nuevo registro de usuario
//==============================================

app.post("/", mdAutenticacion.VerificarToken, (req, res) => {
  var body = req.body;

  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear usuario",
        errors: err
      });
    }

    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuarioToken: req.usuario
    });
  });
});

//==============================================
// Eliminar un usuario
//==============================================

app.delete("/:id",mdAutenticacion.VerificarToken ,(req, res) => {
  var id = req.params.id;
  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al eliminar el usuario.",
        errors: err
      });
    }
    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe un usuario con ese id.",
        errors: { message: "No existe un usuario con ese id." }
      });
    }

    res.status(200).json({
      ok: true,
      usuario: usuarioBorrado
    });
  });
});

// app.post("/", (req, resp) => {
//   var body = req.body;
//   var usuario = new Usuario({
//     nombre: body.nombre,
//     email: body.email,
//     password: body.password,
//     img: body.img,
//     role: body.role
//   });
//   usuario.save((err, usuarioGuardado) => {
//     if (err) {
//       return resp.status(500).json({
//         ok: false,
//         mensaje: "Error al crear el usuario",
//         errors: err
//       });
//     }
//     resp.status(201).json({
//       ok: true,
//       usuario: usuarioGuardado
//     });
//   });
// });

module.exports = app;
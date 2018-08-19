var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var SEED = require("../config/config").SEED;

var app = express();
var Usuario = require("../models/usuario");

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
      usuario: usuarioDB,
      token: token,
      id: usuarioDB.id
    });
  });
});

module.exports = app;

var express = require("express");
var app = express();

var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");

app.get("/todo/:busqueda", (req, res) => {
  var busqueda = req.params.busqueda;
  var regEx = new RegExp(busqueda, "i");

  Promise.all([
    buscarHospitales(busqueda, regEx),
    buscarMedicos(busqueda, regEx),
    buscarUsuario(busqueda, regEx)
  ])
    .then(respuestas => {
      return res.status(200).json({
        ok: true,
        hospitales: respuestas[0],
        medicos: respuestas[1],
        usuario: respuestas[2]
      });
    })
    .catch(err => {
      res.status(500).json({
        ok: false,
        mensaje: "error realizando la bísqueda",
        errors: err
      });
    });
});

//================================
// Busqueda por colección
//================================
app.get("/coleccion/:tabla/:busqueda", (req, res) => {
  var tablaBuscar = req.params.tabla.toLowerCase();
  var busqueda = req.params.busqueda;
  var regEx = new RegExp(busqueda, "i");
  var promesa;

  switch (tablaBuscar) {
    case "hospitales":
      promesa = buscarHospitales(busqueda, regEx);
      break;
    case "medicos":
      promesa = buscarMedicos(busqueda, regEx);
      break;
    case "usuarios":
      promesa = buscarUsuario(busqueda, regEx);
      break;
    default:
      return res.status(404).json({
        ok: false,
        mensaje: `No existe la colección ${tablaBuscar}. Las colecciones disponibles son hospitales,medicos o usuarios`
      });
  }
  promesa.then(data => {
    if (data.length > 0) {
      return res.status(200).json({
        ok: true,
        [tablaBuscar]: data
      });
    } else {
      return res.status(200).json({
        ok: true,
        mensaje: `No existen ${tablaBuscar} coincidentes con el parámetro de búsqueda`
      });
    }
  });
});

function buscarHospitales(busqueda, regEx) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regEx })
      .populate("usuario", "nombre email")
      .exec((err, hospitales) => {
        if (err) {
          reject("Error al cargar hospitales", err);
        } else {
          resolve(hospitales);
        }
      });
  });
}
function buscarMedicos(busqueda, regEx) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regEx })
      .populate("usuario", "nombre email")
      .populate("hospital")
      .exec((err, medicos) => {
        if (err) {
          reject("Error al cargar médicos", err);
        } else {
          resolve(medicos);
        }
      });
  });
}

function buscarUsuario(busqueda, regEx) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, "id nombre email role")
      .or([{ nombre: regEx }, { email: regEx }])
      .exec((err, usuarios) => {
        if (err) {
          reject("Error al cargar usuarios", err);
        } else {
          resolve(usuarios);
        }
      });
  });
}

module.exports = app;

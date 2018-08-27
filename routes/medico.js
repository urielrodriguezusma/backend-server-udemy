var express = require("express");
var app = express();

var Medico = require("../models/medico");
var mdAutenticacion = require("../middlewares/autenticacion");

//Rutas

//==============================================
// Obtener Todos los medicos
//==============================================
app.get("/", (req, res) => {
  var desde = req.query.desde || 0;
  desde= Number(desde);
  Medico.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .populate("hospital")
    .exec((err, medicos) => {
      if (err) {
        return res.status(400).json({
          ok: true,
          mensaje: "Error cargando la lista de médicos",
          errors: err
        });
      }

      Medico.count({}, (err, conteo) => {
        if (err) {
          return res.status(400).json({
            ok: true,
            mensaje: "Error calculando el conteo de médicos",
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          medicos: medicos,
          total: conteo
        });
      });
    });
});

//==============================================
// Crear un Médico
//==============================================
app.post("/", mdAutenticacion.VerificarToken, (req, res) => {
  var body = req.body;
  var medico = new Medico({
    nombre: body.nombre,
    img: body.img,
    usuario: req.usuario._id,
    hospital: body.hospital
  });

  medico.save((err, medicoCreado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al almacenar el médico",
        errors: err
      });
    }

    res.status(201).json({
      ok: true,
      mensaje: "Medico creado correctamente",
      medico: medicoCreado
    });
  });
});

//==============================================
// Actualizar Medico
//==============================================
app.put("/:id", mdAutenticacion.VerificarToken, (req, res) => {
  var id = req.params.id;
  Medico.findById(id, (err, medicoEncontrado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al actualizar el registro del médico",
        errors: err
      });
    }
    if (!medicoEncontrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al actualizar el registro del médico " + id,
        errors: { mensaje: "Error al actualizar el registro del médico " + id }
      });
    }

    var body = req.body;
    medicoEncontrado.nombre = body.nombre;
    medicoEncontrado.img = body.img;
    medicoEncontrado.usuario = req.usuario._id;
    medicoEncontrado.hospital = body.hospital;
    medicoEncontrado.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el médico",
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        medico: medicoGuardado
      });
    });
  });
});

//==============================================
// Eliminar Hospital
//==============================================
app.delete("/:id", mdAutenticacion.VerificarToken, (req, res) => {
  var id = req.params.id;
  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error eliminado el registro del médico",
        errors: err
      });
    }
    if (!medicoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe el médico con el id " + id,
        errors: err
      });
    }
    res.status(200).json({
      ok: true,
      mensaje: "Registro eliminado correctamente",
      medico: medicoBorrado
    });
  });
});

module.exports = app;

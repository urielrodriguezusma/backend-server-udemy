var express = require("express");
var app = express();

var Hospital = require("../models/hospital");
var mdAutenticacion = require("../middlewares/autenticacion");

//Rutas

//==============================================
// Obtener Todos los hospitales
//==============================================
app.get("/", (req, res) => {
  var desde = req.query.desde;
  desde = Number(desde);
  
  Hospital.find({}, "nombre img usuario")
    .populate("usuario", "nombre email")
    .skip(desde)
    .limit(5)
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "error cargando la lista de hospitales",
          errors: err
        });
      }

      Hospital.countDocuments({}, (err, conteo) => {
        if (err) {
          return res.status(400).json({
            ok: true,
            mensaje: "Error calculando el conteo de hospitales",
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          hospital: hospitales,
          total: conteo
        });
      });
    });
});

//==============================================
// Crear un hospital
//==============================================
app.post("/", mdAutenticacion.VerificarToken, (req, res) => {
  var body = req.body;
  var hospital = new Hospital({
    nombre: body.nombre,
    img: body.img,
    usuario: req.usuario._id
  });

  hospital.save((err, hospitalGuardado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al almacenar el usuario",
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado
    });
  });
});

//==============================================
// Actualizar Hospital
//==============================================
app.put("/:id", mdAutenticacion.VerificarToken, (req, res) => {
  var id = req.params.id;

  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al buscar el hospital",
        errors: err
      });
    }
    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "Error al actualizar. El hospital con el id " + id + " no existe",
        errors: {
          message:
            "Error al actualizar.El hospital con el id " + id + " no existe"
        }
      });
    }

    var body = req.body;
    hospital.nombre = body.nombre;
    hospital.img = body.img;
    hospital.usuario = req.usuario._id;
    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el hospital",
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado
      });
    });
  });
});

//==============================================
// Eliminar Hospital
//==============================================
app.delete("/:id", mdAutenticacion.VerificarToken, (req, res) => {
  var id = req.params.id;
  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error eliminando el registro del hostpital",
        errors: err
      });
    }

    if (!hospitalBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe el hospital con el id " + id,
        errors: err
      });
    }
    return res.status(200).json({
      ok: true,
      mensaje: "Registro eliminado correctamente",
      hospital: hospitalBorrado
    });
  });
});

module.exports = app;

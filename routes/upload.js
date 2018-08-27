var express = require("express");
var fileUpload = require("express-fileupload");
var fs = require("fs");

//Modelos
var Usuario = require("../models/usuario");
var Medico = require("../models/medico");
var Hospital = require("../models/hospital");

var app = express();

app.use(fileUpload());

app.put("/:tipo/:id", (req, res) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  var tiposColeccion = ["hospitales", "medicos", "usuarios"];
  if (tiposColeccion.indexOf(tipo) < 0) {
    res.status(400).json({
      ok: true,
      mensaje: "Tipo de colección no válida",
      errors: {
        message: "Las colecciones válidas son " + tiposColeccion.join(", ")
      }
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: true,
      mensaje: "No selecciono ninguna imagen",
      errors: { message: "Debe seleccionar una imagen" }
    });
  }
  //Obtener nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split(".");
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];

  //Solo estas extenciones seran aceptadas
  var extencionesValidas = ["png", "jpg", "gif", "jpeg"];
  if (extencionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: true,
      mensaje: "Extención no válida",
      errors: {
        message: "Las extensiones válidas son " + extencionesValidas.join(", ")
      }
    });
  }

  //Nombre del archivo personalizado.
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  //Mover el archivo del temporal a un path (Esta en la documentación de el .js del FileUpload)
  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, err => {
    if (err) {
      res.status(400).json({
        ok: true,
        mensaje: "Tipo de colección no válida",
        errors: err
      });
    }
    subirPorTipo(tipo, id, nombreArchivo, res);
    // return res.status(200).json({
    //     ok: true,
    //     mensaje: "Archivo movido"
    //   });
  });
});

function subirPorTipo(tipoColeccion, id, nombreArchivo, res) {
  if (tipoColeccion === "usuarios") {
    Usuario.findById(id, (err, usuarioEncontrado) => {
      if (err) {
        return res.status(404).json({
          ok: false,
          mensaje: "El usuario no existe",
          errors: err
        });
      }
      if (!usuarioEncontrado) {
        return res.status(400).json({
          ok: false,
          mensaje: "El usuario no existe",
          errors: { message: "El usuario no existe" }
        });
      }
      var pathViejo = `./uploads/usuarios/${usuarioEncontrado.img}`;

      //Si el archivo existe elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo, err => {
          if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error eliminando el archivo",
              errors: err
            });
          }
        });
      }
      usuarioEncontrado.img = nombreArchivo;

      usuarioEncontrado.save((err, usuarioActualizado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar la imagen del usuario",
            errors: err
          });
        }
        usuarioActualizado.password = ":)";
        return res.status(200).json({
          ok: true,
          mensaje: "imagen de usuario actualizada correctamente",
          usuario: usuarioActualizado
        });
      });
    });
  }
  if (tipoColeccion === "medicos") {
    Medico.findById(id, (err, medicoEncontrado) => {
      if (err) {
        return res.status(404).json({
          ok: false,
          mensaje: "El usuario no existe",
          errors: err
        });
      }

      if (!medicoEncontrado) {
        return res.status(400).json({
          ok: false,
          mensaje: "El médico no existe",
          errors: { message: "El médico no existe" }
        });
      }
      var pathViejo = `./uploads/medicos/${medicoEncontrado.img}`;

      //Si el archivo existe elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo, err => {
          if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error eliminando el archivo",
              errors: err
            });
          }
        });
      }

      medicoEncontrado.save((err, medicoActualizado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar la imagen del médico",
            errors: err
          });
        }
        return res.status(200).json({
          ok: true,
          mensaje: "imagen del médico actualizada correctamente",
          medico: medicoActualizado
        });
      });
    });
  }

  if (tipoColeccion === "hospitales") {
    Hospital.findById(id, (err, hospitalEncontrado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "El hospital no existe",
          errors: err
        });
      }
      if (!hospitalEncontrado) {
        return res.status(400).json({
          ok: false,
          mensaje: "El hospital no existe",
          errors: { message: "El hospital no existe" }
        });
      }
 
      var pathViejo = `./uploads/hospitales/${hospitalEncontrado.img}`;
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo, err => {
          if (err) {
            return res.status(400).json({
              ok: false,
              mensaje: "Error eliminando el archivo",
              errors: err
            });
          }
        });
      }
      hospitalEncontrado.img = nombreArchivo;
      hospitalEncontrado.save((err, hospitalActualizado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error actualizando el hospital.",
            errors: err
          });
        }

        return res.status(200).json({
          ok: true,
          mensaje: "El hospital ha sido actualizado correctamente",
          hospital: hospitalActualizado
        });
      });
    });
  }
}

module.exports = app;

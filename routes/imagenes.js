var express = require("express");
var app = express();

const path = require("path");
const fs = require("fs");

app.get("/:tipo/:img", (req, res) => {
  var tipo = req.params.tipo;
  var img = req.params.img;

  var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);
  //Si la imagen existe
  if (fs.existsSync(pathImagen)) {
    res.sendFile(pathImagen);
  } else {
    var patNoImage = path.resolve(__dirname, "../assets/no-img.jpg");
    res.sendFile(patNoImage);
  }
});

module.exports = app;

// var express = require('express');
// var fs = require('fs');

// var app = express();


// app.get('/:tipo/:img', (req, res, next) => {

//     var tipo = req.params.tipo;
//     var img = req.params.img;

//     var path = `./uploads/${ tipo }/${ img }`;

//     fs.exists(path, existe => {

//         if (!existe) {
//             path = './assets/no-img.jpg';
//         }


//         res.sendfile(path);

//     });


// });

// module.exports = app;

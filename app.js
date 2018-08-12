//Requires
var express = require("express");
var mongoose = require("mongoose");

//Inicializar variables
var app = express();

//Conexion con la base de datos
mongoose.connection.openUri("mongodb://localhost:27017/hospitalDB",{ useNewUrlParser: true }, (err, resp) => {
    if (err) throw err; 
     console.log('Base de datos \x1b[32m%s\x1b[0m', 'online');
  }
);



//Rutas
app.get("/", (request, response, next) => {
  response.status(200).json({
    ok: true,
    mensaje: "Peticion realizada correctamente"
  });
});

//Escuchar peticiones.
app.listen(3000, () => {
  // console.log('Express Server puerto:3000 \x1b[32m%s\x1b[0m', 'online');
  console.log("Express Server puerto:3000 \x1b[4m\x1b \x1b[32m", "online");
});

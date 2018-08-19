//Requires
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');

//Inicializar variables
var app = express(); 

//Body Parser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Conexion con la base de datos
mongoose.connection.openUri("mongodb://localhost:27017/hospitalDB",{ useNewUrlParser: true }, (err, resp) => {
    if (err) throw err; 
     console.log('Base de datos \x1b[32m%s\x1b[0m', 'online');
  } 
);



//Importar Rutas
var appRoutes=require('./routes/app');
var usuarioRoutes= require('./routes/usuario');
var loginRoutes= require('./routes/login');

//Rutas
app.use('/',appRoutes);
app.use('/usuario',usuarioRoutes);
app.use('/login',loginRoutes);

//Escuchar peticiones.
app.listen(3000, () => {
  // console.log('Express Server puerto:3000 \x1b[32m%s\x1b[0m', 'online');
  console.log("Express Server puerto:3000 \x1b[4m\x1b \x1b[32m", "online");
});

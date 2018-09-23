//Requires
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

//Inicializar variables
var app = express();
 

//CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Credentials", "true");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers,Content-Type,'
        + 'Authorization,Content-Length, X-Requested-With,Access-Control-Request-Headers,token');

  next();
});


//Body Parser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Conexion con la base de datos
mongoose.connection.openUri(
  "mongodb://localhost:27017/hospitalDB",
  { useNewUrlParser: true },
  (err, resp) => {
    if (err) throw err;
    console.log("Base de datos \x1b[32m%s\x1b[0m", "online");
  }
); 

//Importar Rutas
var appRoutes = require("./routes/app");
var usuarioRoutes = require("./routes/usuario");
var hospitalRoutes = require("./routes/hospital");
var medicoRoutes = require("./routes/medico");
var loginRoutes = require("./routes/login");
var busquedaRoutes = require("./routes/busqueda");
var uploadRoutes = require("./routes/upload");
var imagenesRoutes = require("./routes/imagenes");

//Server index config
// var serveIndex = require("serve-index");
// app.use(express.static(__dirname + "/"));
// app.use("/uploads", serveIndex(__dirname + "/uploads",{icons:true}));

//Rutas
app.use("/usuario", usuarioRoutes);
app.use("/hospital", hospitalRoutes);
app.use("/medico", medicoRoutes);
app.use("/login", loginRoutes);
app.use("/busqueda", busquedaRoutes);
app.use("/upload", uploadRoutes);
app.use("/img", imagenesRoutes);
app.use("/", appRoutes);

//Escuchar peticiones.
app.listen(3000, () => {
  // console.log('Express Server puerto:3000 \x1b[32m%s\x1b[0m', 'online');
  console.log("Express Server puerto:3000 \x1b[4m\x1b \x1b[32m", "online");
});

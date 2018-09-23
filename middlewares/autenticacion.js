var jwt = require("jsonwebtoken");

const SEED = require("../config/config").SEED;

//==============================================
// Verificar Token
//==============================================
exports.VerificarToken = function(req, res, next) {
  // var token = req.query.token;
  var token = req.headers.token;

  jwt.verify(token, SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: "Token incorrecto",
        errors: err
      });
    }

    req.usuario = decoded.usuario;
    next();
    // res.status(200).json({
    //     ok: true,
    //     decoded,decoded
    // });
  });
};

//==============================================
// Verificar ADMIN
//==============================================
exports.VerificarADMIN_ROLE = function(req, res, next) {
  var usuario = req.usuario;
  if (usuario.role === "ADMIN_ROLE") {
    next();
  } else {
    return res.status(401).json({
      ok: false,
      mensaje: "Token incorrecto - No es administrador"
    });
  }
};

//==============================================
// Verificar ADMIN o mismo usuario
//==============================================
exports.VerificarADMIN_O_MismoUsuario = function(req, res, next) {
  var usuario = req.usuario;
  var id = req.params.id;
  if (usuario.role === "ADMIN_ROLE" || usuario._id === id) {
    next();
  } else {
    return res.status(401).json({
      ok: false,
      mensaje: "Token incorrecto - No es administrador ni el mismo usuario"
    });
  }
};

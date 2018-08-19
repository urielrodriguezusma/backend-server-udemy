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
    
    req.usuario=decoded.usuario;
    next();
    // res.status(200).json({
    //     ok: true,
    //     decoded,decoded
    // });
  });
};

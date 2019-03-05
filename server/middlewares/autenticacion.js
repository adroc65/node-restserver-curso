
const jwt = require('jsonwebtoken');

// ============================
//  Vencimiento del TOKEN
// ============================
let verificaToken = ( req, res, next ) => {

    let token = req.get('token'); //Lee el token del Header

    jwt.verify( token, process.env.SEED, (err, decoded) => {

        if( err ) {
            return res.status(401).json({
                ok: false,
                err: {
                    nombre: err.name,
                    message: 'Error verificando Token'
                }
            });
        }
        // La informacion es correcta
        req.usuario = decoded.usuario;
        next();
    });
    

};
// --------------------------------------------------------
//
// ============================
//  Vencimiento AdminRole
// ============================

let verificaAdmin_Role = (req, res, next) =>{

    let usuario = req.usuario;

    if(usuario.role === 'ADMIN_ROLE'){
        next();
    } else {
        return res.status(401).json({
            ok: false,
            message: 'El usuario no es administrador'
        });
    }
};





module.exports = {
    verificaToken,
    verificaAdmin_Role
}
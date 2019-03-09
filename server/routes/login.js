const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);



const Usuario = require('../models/usuario');

const app = express();



app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
         
        if( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        if ( !usuarioDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos !'
                }
            });
        } 
        // Se toma la clave que viene de la pagina, se encripta y se compara
        // con la contraseña encriptada de la DB, que esta en "usuarioDB"
        if( !bcrypt.compareSync( body.password, usuarioDB.password )) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos !'
                }
            });
        }
        
        let token = jwt.sign({
            usuario: usuarioDB
          }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB, //Devuelve todo el Usuario.
            token
        });
    
    
    });

});
// ============================
// Configuraciones de Google
// ============================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img:payload.picture,
        google: true
    }

}
//verify().catch(console.error); -->> Este error se maneja abajo con el ASYNC y AWAIT

app.post('/google', async (req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });
    // Impresión directa del Usuario para monitoreo
    // res.json({
    //     usuario: googleUser
    // });
    // ----------------------------
    // Se procedera a trabajar con la Base de Datos.
    // Se revisa que el Usuario de Google exista en nuestra DB.
    Usuario.findOne( { email: googleUser.email }, (err, usuarioDB) => { 
        
        if( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if( usuarioDB ) {
            
            if( usuarioDB.google === false ){
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });   
            } else {                    // Si es un usuario previamente Logeado en Google
                let token = jwt.sign({  // Se renueva el Token.
                    usuario: usuarioDB
                  }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            // El usuario no existe en nuestra DB = Nuevo Usuario.
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = 'No_Aplica :)'; // Es necesario ponerlo para la validación.

            // Grabando en la DB el usuario nuevo:
            usuario.save( (err, usuarioDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
        
                return res.json({
                    ok: true,
                    usuario: usuarioDB, //Devuelve todo el Usuario.
                    token
                });
            });
        }

    });

});


module.exports = app;
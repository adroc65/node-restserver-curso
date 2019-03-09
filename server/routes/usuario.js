

const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();
// ------------------------------------------------------
// GET: Listar los Usuarios:
//
app.get('/usuario', verificaToken, (req, res) => {
    
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, '_id nombre email role estado google')
        .skip(desde)
        .limit(limite)
        .exec( (err, usuarios) =>{ 
            if( err ){
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            // Hacemos uso del esquema "Usuario"
            // Se sustitulle el 'count' por '.countDocuments'
            //Usuario.count({ estado: true }, (err, conteo) =>{
            Usuario.countDocuments({ estado: true }, (err, conteo) =>{
                res.json({ 
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            });    
            
        });
  });
// ------------------------------------------------------
//
// ------------------------------------------------------
// POST: Crear entradas en la Base de Datos.
//  
  app.post('/usuario', [verificaToken, verificaAdmin_Role] , function(req, res) {

    let body = req.body;

    // res.json({
    //     persona: body
    // });

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10 ),
        role: body.role
    });

    // Salvar lo que se recibe en el POST a la Base de Datos.
    usuario.save( (err, usuarioDB) => {
        if( err ){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        // No enviar el Password a la salida:
        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
  
  });

  // ----------------------------------------------
  // PUT = Actualización de un Registro.
  // Se usa el "_.pick" para filtrar solo los parametros que se desea que se actualicen.
  // ------------------------------------------------
  app.put('/usuario/:id', [verificaToken, verificaAdmin_Role] , function (req, res) {
      let id = req.params.id;
      let body = _.pick( req.body, ['nombre', 'email', 'img', 'role', 'estado'] );

    Usuario.findOneAndUpdate( id, body, { new: true, runValidators: true } , (err, usuarioDB) =>{
        if( err ){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
      });
    });

  // ----------------------------------------------
  // Eliminar un Usuario:
  //
  app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role] , function (req, res) {
      
    let id = req.params.id;

    Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (err, usuarioBorrado) =>{

        if( err ){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        }); 

    }); 

  });
  // ----------------------------------------------

  module.exports = app;


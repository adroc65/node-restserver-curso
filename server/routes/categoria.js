const express = require('express');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

const Categoria = require('../models/categoria');

// ------------------------------------------------------
// GET: Mostrar las Categorias
// ------------------------------------------------------
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categoria) =>{

            if( err ){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            
            res.json({ 
                ok: true,
                categoria
            });
        })    
});

// ------------------------------------------------------
// GET: Mostrar una Categoria por ID
// ------------------------------------------------------
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }


        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });


});

// ------------------------------------------------------
// POST: Crear una nueva Categoria
// ------------------------------------------------------
app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;
    //console.log(req.usuario._id);
    
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    // Salvar lo que se recibe en el POST a la Base de Datos.
    categoria.save( (err, categoriaDB) => {
        if( err ){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
      
});
// ------------------------------------------------------
// PUT: Modificar una Categoria
// ------------------------------------------------------
app.put('/categoria/:id', verificaToken , (req, res) => {
       
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };
    
    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => { 
        
        if( err ){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        
        res.json({ 
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ----------------------------------------------
// Eliminar una Categoria:
// ----------------------------------------------
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) =>{

        if( err ){
            return res.status(500).json({
              ok: false,
              err
            });
        }
        if (!categoriaDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }
        res.json({
            ok: true,
            message: 'Categoria Borrada'
        }); 

    }); 

});

module.exports = app;

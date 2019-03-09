const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');


// default options
app.use( fileUpload({ useTempFiles: true }) );


app.put('/upload/:tipo/:id', function(req, res) { //Asi se llama en el navegador, es usuario o producto (tipo)

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (Object.keys(req.files).length == 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningún archivo'
                }
            });
    }

    // Validar tipo:
    let tiposValidos = ['productos', 'usuarios'];
    if( tiposValidos.indexOf( tipo ) < 0 ){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son: ' + tiposValidos.join(', ')
            }
        });
    } 

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let archivo = req.files.archivo;
    let nombreSeparado = archivo.name.split('.');
    let extension = nombreSeparado[nombreSeparado.length - 1];

    
    // Extensiones permitidas:
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg']
    if( extensionesValidas.indexOf( extension) < 0 ){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son: ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }
    //Cambiar nombre al archivo:
    let nombreArchivo = `${ id }-${ new Date().getTime() }.${ extension }`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        chequearImagen( id,res, nombreArchivo, tipo );
        // // Aqui, ya la imagen esta cargada
        // if (tipo === 'usuarios') {
        //     imagenUsuario(id, res, nombreArchivo); // Se debe de pasar el 'res'
        // } else {
        //     imagenProducto(id, res, nombreArchivo);
        // }
    });

});
// ----------------------------------------------------------
// Comprobar Imagenes de Usuario o Producto, según "tipo".
// ----------------------------------------------------------
function chequearImagen(id, res, nombreArchivo, tipo) {
    if (tipo == 'usuarios'){
        SchemaBase = Usuario;
    } else {
        SchemaBase = Producto;
    }

    SchemaBase.findById(id, (err, datoDB) => {

        if (err) {
            borraArchivo( nombreArchivo, tipo );

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!datoDB) {

            borraArchivo( nombreArchivo, tipo );

            return res.status(400).json({
                ok: false,
                err: {
                    message: `${tipo} no existe`
                }
            });
        }

        borraArchivo(datoDB.img, tipo)

        datoDB.img = nombreArchivo;

        datoDB.save((err, datoGuardado) => {

            res.json({
                ok: true,
                dato: datoGuardado,
                img: nombreArchivo
            });
        });
    });
}


// ---------------------------------------------------
// Asegurarse que solo exista una imagen por Usuario 
// y por producto, hace uso del 'path' para ubicar
// la ruta y del 'fs', para manejar y borrar imagenes.
// ---------------------------------------------------
function borraArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen); //Borra un archivo
    }
}
module.exports = app;
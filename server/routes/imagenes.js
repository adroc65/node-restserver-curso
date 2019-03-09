const express = require('express');

const fs = require('fs');       //Se usa para ver si la imagen existe.
const path = require('path');   //Para construir PATHs absolutos.

const { verificaTokenImg } = require('../middlewares/autenticacion');


let app = express();

// Peticion GET, para ver imagenes
app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {


    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);       //Envía la imagen requerida.
    } else {
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImagePath);
    }
});

module.exports = app;
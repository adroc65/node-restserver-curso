
require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// En /routes/index estan las rutas.
app.use( require('./routes/index'));

// ----------------------------------------------------------------------------------
// Conexión a la DB
mongoose.connect(process.env.URLDB, 
    {useNewUrlParser: true, useCreateIndex: true }, 
    ( err, res ) => { 

        if ( err ) throw err;
        
        console.log('Data Base Online!');
});

// ----------------------------------------------------------------------------------

app.listen(process.env.PORT, () =>{
    console.log('Escuchando puerto: ', process.env.PORT);   
});
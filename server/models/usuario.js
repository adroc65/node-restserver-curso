const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Definiendo los ROLES a tener.
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE}, no es un ROL válido'
};

let Schema = mongoose.Schema;
// Si se usa "mongooseHidden", se esconde el ID
//let mongooseHidden = require('mongoose-hidden')();

let usuarioSchema = new Schema ({
    nombre: {
        type : String,
        required: [true, 'El nombre es necesario!']
    },
    email: {
        type : String,
        unique: true,
        required: [true, 'El correo es necesario!']        
    },
    password: {
        type : String,
        required: [true, 'La contraseña es obligatoria!']
        //hide: true        
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    }, 
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    } 

});

usuarioSchema.methods.toJSON = function() {

    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}
//usuarioSchema.plugin( mongooseHidden );
usuarioSchema.plugin( uniqueValidator, { message: '{PATH} debe de ser único'} );

module.exports = mongoose.model( 'Usuario', usuarioSchema );

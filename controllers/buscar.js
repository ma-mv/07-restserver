const { response } = require("express");

const { ObjectId } = require('mongoose').Types;

const { Usuario, Categoria, Producto } = require('../models');

const coleccionesPermitidas = [
    'usuarios',
    'categoria',
    'productos',
    'role'
];


const buscarUsuarios = async( termino = '', res = response ) => {

    const esMongoID = ObjectId.isValid( termino );

    if( esMongoID ) {
        const usuario = await Usuario.findById( termino );

        return res.json({
            results: ( usuario ) ? [ usuario ] : []
        });
    }


    const regex = new RegExp( termino, 'i' );

    const usuarios = await Usuario.find({ 
        $or: [{ nombre: regex, estado: true }, { correo: regex, estado: true }],
        $and: [{ estado: true }]  
    
    });
    
    
    res.json({
        results: usuarios
    });

}



const buscarCategorias = async( termino = '', res = response ) => {

    const esMongoID = ObjectId.isValid( termino );



}




const buscar = ( req, res = response ) => {

    const { coleccion, termino } = req.params;

    if( !coleccionesPermitidas.includes( coleccion ) ){
        return res.status(400).json({
            msg: `Las coleciones permitidas son: ${ coleccionesPermitidas }`
        })
    }

    
    switch ( coleccion ) {
        case 'usuarios': buscarUsuarios
            buscarUsuarios(termino, res);
        break;

        case 'categoria': buscarCategorias
            buscarCategorias(termino, res);
        break;

        case 'productos':
        break;

        default:
            res.status(500).json({
                msg: 'Se le olvido hacer esta búsqueda'
            })

    }


}




module.exports = {
    buscar
}


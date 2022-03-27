
const path  = require('path');
const fs    = require('fs');
const { v4: uuidv4 } = require('uuid');

const cloudinary = require('cloudinary').v2
cloudinary.config( process.env.CLOUDINARY_URL );

const { response } = require('express');
const { subirArchivo } = require('../helpers');
const { Producto, Usuario } = require('../models');



const cargarArchivo = async( req, res = response ) => {

  
    if ( !req.files || Object.keys(req.files).length === 0 || !req.files.archivo ) {
      res.status(400).json({ msg: 'No hay archivos para subir' });
      return;
    }


    try {
    
        const nombre = await subirArchivo( req.files, undefined, 'imgs' );
        res.json({ nombre });


    } catch (msg) {
        res.status(400).json({ msg });
    }
    
}



const actualizarImagen = async( req, res = response ) => {

    const {  id, coleccion } = req.params;

    let modelo;

    switch (coleccion) {
        case 'usuarios':
            modelo = await Usuario.findById(id);
            if( !modelo ){
                return res.status(400).json({
                    msg: `El usuario con id ${id} no existe`
                })
            }
            
            break;
        case 'productos':
            modelo = await Producto.findById(id);
            if( !modelo ){
                return res.status(400).json({
                    msg: `El producto con id ${id} no existe`
                })
            }
            
            break;
    
        default:
            return res.status(500).json({
                msg: 'Se me olvido hacer esta validación'
            })
    }


    if( modelo.img ){

        const pathImagen = path.join( __dirname, '../uploads', coleccion, modelo.img );
        if( fs.existsSync( pathImagen ) ){
            fs.unlinkSync( pathImagen );
        }

    }


    const nombre = await subirArchivo( req.files, undefined, coleccion );
    modelo.img = nombre

    modelo.save();



    res.json( modelo )

}



const actualizarImagenCloudinary = async( req, res = response ) => {

    const {  id, coleccion } = req.params;

    let modelo;

    switch (coleccion) {
        case 'usuarios':
            modelo = await Usuario.findById(id);
            if( !modelo ){
                return res.status(400).json({
                    msg: `El usuario con id ${id} no existe`
                })
            }
            
            break;
        case 'productos':
            modelo = await Producto.findById(id);
            if( !modelo ){
                return res.status(400).json({
                    msg: `El producto con id ${id} no existe`
                })
            }
            
            break;
    
        default:
            return res.status(500).json({
                msg: 'Se me olvido hacer esta validación'
            })
    }


    if( modelo.img ){

        const nombreArr = modelo.img.split('/');
        const nombre    = nombreArr[ nombreArr.length - 1 ];
        const [ public_id ] = nombre.split('.');
        await cloudinary.uploader.destroy( public_id );        

    }

    const { archivo } = req.files;
    
    const nombreCortado = archivo.name.split(".");

    const extension = nombreCortado[nombreCortado.length - 1];

    const nombreTemp = uuidv4() + ('.') + extension;

    const uploadPath = path.join( __dirname, '../uploads/', nombreTemp );

    archivo.mv(uploadPath)


    const { secure_url } = await cloudinary.uploader.upload( uploadPath ).catch(err => console.log(err));

    modelo.img = secure_url;

    await modelo.save();

    res.json( modelo );


}




const mostrarImagen = async( req, res = response ) => {

    const {  id, coleccion } = req.params;

    let modelo;

    switch (coleccion) {
        case 'usuarios':
            modelo = await Usuario.findById(id);
            if( !modelo ){
                return res.status(400).json({
                    msg: `El usuario con id ${id} no existe`
                })
            }
            
            break;
        case 'productos':
            modelo = await Producto.findById(id);
            if( !modelo ){
                return res.status(400).json({
                    msg: `El producto con id ${id} no existe`
                })
            }
            
            break;
    
        default:
            return res.status(500).json({
                msg: 'Se me olvido hacer esta validación'
            })
    }


    if( modelo.img ){

        const pathImagen = path.join( __dirname, '../uploads', coleccion, modelo.img );
        if( fs.existsSync( pathImagen ) ){
            return res.sendFile( pathImagen )
        }

    }

    const pathPlaceHolder = path.join( __dirname, '../assets', 'no-image.jpg' );
    res.sendFile( pathPlaceHolder )

}




module.exports = {
    cargarArchivo,
    actualizarImagen,
    mostrarImagen,
    actualizarImagenCloudinary
}


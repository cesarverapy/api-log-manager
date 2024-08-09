const axios = require('axios'); // importamos axios para realizar solicitudes http

const url = 'http://localhost:5001/logs'; // definimos la url del servidor central de logging
const headers = { // configuramos los headers de la solicitud
    Authorization: 'Bearer service1_token', // agregamos el token de autenticacion en el header
    'Content-Type': 'application/json' // especificamos que el contenido de la peticion es json
};

const logData = { // definimos los datos del log a enviar
    timestamp: new Date().toISOString(), // generamos un timestamp en formato iso
    service_name: 'Service1', // nombre del servicio que envia el log
    log_level: 'INFO', // nivel del log (informativo)
    message: 'este es un mensaje de log de service1' // mensaje del log
};

axios.post(url, logData, { headers }) // enviamos una solicitud post al servidor con los datos del log
    .then(response => { // manejamos la respuesta exitosa
        console.log(`response from server: ${response.status} - ${response.data.message}`); // mostramos el codigo de estado y el mensaje del servidor
    })
    .catch(error => { // manejamos errores
        console.error(`error: ${error.response ? error.response.status : error.message}`); // mostramos el error si ocurre
    });

const express = require('express'); // importamos el framework express para crear el servidor
const bodyParser = require('body-parser'); // importamos body-parser para procesar el cuerpo de las peticiones http
const fs = require('fs'); // importamos fs (filesystem) para trabajar con archivos
const path = require('path'); // importamos path para trabajar con rutas de archivos y directorios

const app = express(); // inicializamos la aplicacion express
app.use(bodyParser.json()); // configuramos express para usar body-parser y procesar json en las peticiones

const VALID_TOKENS = ['service1_token', 'service2_token']; // definimos una lista de tokens validos para autenticacion
const LOG_FILE = path.join(__dirname, 'logs.json'); // definimos la ruta donde se almacenaran los logs

// funcion para guardar los logs en un archivo
function saveLog(data) {
    if (!fs.existsSync(LOG_FILE)) { // si el archivo de logs no existe
        fs.writeFileSync(LOG_FILE, JSON.stringify([])); // creamos un nuevo archivo de logs vacio
    }
    const logs = JSON.parse(fs.readFileSync(LOG_FILE)); // leemos el archivo de logs existente
    logs.push(data); // agregamos el nuevo log a la lista de logs
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 4)); // guardamos los logs actualizados en el archivo con formato legible
}

app.post('/logs', (req, res) => { // creamos una ruta post para recibir los logs
    const authHeader = req.headers['authorization']; // obtenemos el header de autorizacion de la peticion
    const token = authHeader && authHeader.split(' ')[1]; // extraemos el token del header si existe

    if (!token || !VALID_TOKENS.includes(token)) { // si no hay token o el token no es valido
        return res.status(401).json({ error: 'unauthorized' }); // devolvemos un error 401 de no autorizado
    }

    const logData = req.body; // obtenemos los datos del log desde el cuerpo de la peticion
    if (logData) { // si los datos del log son validos
        saveLog(logData); // guardamos el log usando la funcion saveLog
        return res.status(200).json({ message: 'log received' }); // respondemos con un mensaje de exito
    }
    return res.status(400).json({ error: 'invalid data' }); // si los datos no son validos, devolvemos un error 400
});

app.get('/logs', (req, res) => { // creamos una ruta get para obtener los logs
    const logs = JSON.parse(fs.readFileSync(LOG_FILE)); // leemos los logs desde el archivo
    res.setHeader('Content-Type', 'application/json'); // establecemos el tipo de contenido como json
    res.send(JSON.stringify(logs, null, 4));  // enviamos los logs formateados con una sangria de 4 espacios para mejor legibilidad
});

const PORT = 5001; // definimos el puerto en el que correra el servidor
app.listen(PORT, () => { // iniciamos el servidor en el puerto especificado
    console.log(`central logging server is running on port ${PORT}`); // mostramos un mensaje en la consola indicando que el servidor esta corriendo
});

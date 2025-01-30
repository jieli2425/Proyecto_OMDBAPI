const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

// Configuración del servidor
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// API Key para OMDb
const apiKey = 'b13fdef7';

// Servir los archivos estáticos desde la carpeta "public"
app.use(express.static(__dirname + '/public'));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Manejo de conexión WebSocket
io.on('connection', (socket) => {
    console.log('Cliente conectado');

    // Buscar películas por título
    socket.on('buscarPeliculas', async ({ titulo, page }) => {
        console.log(`Buscando películas con título: "${titulo}", página: ${page}`);
        try {
            const url = `https://www.omdbapi.com/?apikey=${apiKey}&type=movie&s=${encodeURIComponent(titulo)}&page=${page}`;
            const response = await axios.get(url);

            if (response.data.Response === 'True' && response.data.Search) {
                // Obtener detalles completos de las películas
                const movies = await Promise.all(
                    response.data.Search.map(async (movie) => {
                        const detailsUrl = `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`;
                        const detailsResponse = await axios.get(detailsUrl);
                        return detailsResponse.data; // Incluye todos los detalles completos
                    })
                );
                socket.emit('peliculasEncontradas', movies);
            } else {
                socket.emit('errorBusqueda', response.data.Error || 'No se encontraron películas.');
            }
        } catch (error) {
            console.error('Error al buscar películas:', error.message);
            socket.emit('errorBusqueda', 'Error al buscar películas en el servidor.');
        }
    });

    // Buscar películas por género
// Buscar películas por género
socket.on('buscarPorGenero', async ({ genero, page }) => {
    console.log(`Buscando películas por género: "${genero}", página: ${page}`);
    try {
        const url = `https://www.omdbapi.com/?apikey=${apiKey}&type=movie&s=&page=${page}`;
        const response = await axios.get(url);

        if (response.data.Response === 'True' && response.data.Search) {
            // Obtener detalles completos de las películas
            const movies = await Promise.all(
                response.data.Search.map(async (movie) => {
                    const detailsUrl = `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`;
                    const detailsResponse = await axios.get(detailsUrl);
                    return detailsResponse.data; // Incluye todos los detalles completos
                })
            );

            // Filtrar las películas por género
            const filteredMovies = movies.filter((movie) => 
                movie.Genre && movie.Genre.toLowerCase().includes(genero.toLowerCase())
            );

            if (filteredMovies.length > 0) {
                socket.emit('peliculasEncontradas', filteredMovies);
            } else {
                socket.emit('errorBusqueda', 'No se encontraron películas para este género.');
            }
        } else {
            socket.emit('errorBusqueda', response.data.Error || 'No se encontraron películas.');
        }
    } catch (error) {
        console.error('Error al buscar películas por género:', error.message);
        socket.emit('errorBusqueda', 'Error al buscar películas en el servidor.');
    }
});


    // Manejar desconexión del cliente
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Iniciar el servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

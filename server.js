const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const apiKey = 'a834ae02';

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('buscarPeliculas', async ({ titulo, page }) => {
        console.log(`Buscando películas con título: "${titulo}", página: ${page}`);
        try {
            const url = `https://www.omdbapi.com/?apikey=${apiKey}&type=movie&s=${encodeURIComponent(titulo)}&page=${page}`;
            const response = await axios.get(url);

            if (response.data.Response === 'True' && response.data.Search) {
                const movies = await Promise.all(
                    response.data.Search.map(async (movie) => {
                        const detailsUrl = `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`;
                        const detailsResponse = await axios.get(detailsUrl);
                        return detailsResponse.data;
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

    socket.on('buscarPorGenero', async ({ genero, page }) => {
    console.log(`Buscando películas por género: "${genero}", página: ${page}`);
    try {
        let results = [];
        let pageToFetch = page;

        const url = `https://www.omdbapi.com/?apikey=${apiKey}&type=movie&s=${encodeURIComponent(genero)}&page=${pageToFetch}`;
        const response = await axios.get(url);

        if (response.data.Response === 'True' && response.data.Search) {
            const movies = await Promise.all(
                response.data.Search.map(async (movie) => {
                    const detailsUrl = `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`;
                    const detailsResponse = await axios.get(detailsUrl);
                    return detailsResponse.data;
                })
            );

            const filtradas = movies.filter(movie => 
                movie.Genre && movie.Genre.toLowerCase().includes(genero.toLowerCase())
            );

            if (filtradas.length > 0) {
                results = filtradas;
                socket.emit('peliculasEncontradas', results.slice(0, 10));
            } else {
                socket.emit('errorBusqueda', 'No se encontraron películas para este género.');
            }
        } else {
            socket.emit('errorBusqueda', 'No se encontraron películas en la búsqueda por género.');
        }
    } catch (error) {
        console.error('Error al buscar películas por género:', error.message);
        socket.emit('errorBusqueda', 'Error al buscar películas en el servidor.');
    }
});

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

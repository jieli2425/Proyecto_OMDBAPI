const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

class AppPelis {
    constructor() {
        this.apiKey = 'a834ae02';
        this.paginaPrincipal = 1;
        this.tituloPrincipal = '';
        this.app = express();
        this.servidor = http.createServer(this.app);
        this.io = new Server(this.servidor);

        this.rutas();
        this.ConexionSocket();
    }

    rutas() {
        this.app.use(express.static(__dirname + '/public'));

        this.app.get('/', (req, res) => {
            res.sendFile(__dirname + '/public/index.html');
        });
    }

    ConexionSocket() {
        this.io.on('connection', (socket) => {
            console.log('Cliente conectado');

            socket.on('buscarPeliculas', async ({ titulo, pagina }) => this.buscarPeliculas(socket, titulo, pagina));
            socket.on('buscarPorGenero', async ({ genero, pagina }) => this.buscarPorGenero(socket, genero, pagina));

            socket.on('disconnect', () => {
                console.log('Cliente desconectado');
            });
        });
    }

        async buscarPeliculas(socket, titulo, pagina) {
            console.log(`Buscando películas con título: "${titulo}", página: ${pagina}`);
            try {
                const url = `https://www.omdbapi.com/?apikey=${this.apiKey}&type=movie&s=${encodeURIComponent(titulo)}&page=${pagina}`;
                const respuesta = await axios.get(url);

                if (respuesta.data.Response === 'True' && respuesta.data.Search) {
                    const peliculas = await Promise.all(
                        respuesta.data.Search.map(async (pelicula) => {
                            const urlDetalles = `https://www.omdbapi.com/?apikey=${this.apiKey}&i=${pelicula.imdbID}`;
                            const Detalles = await axios.get(urlDetalles);
                            return Detalles.data;
                        })
                    );
                    socket.emit('peliculasEncontradas', peliculas);
                } else {
                    socket.emit('errorBusqueda', respuesta.data.Error || 'No se encontraron películas.');
                }
            } catch (error) {
                console.error('Error al buscar películas:', error.message);
                socket.emit('errorBusqueda', 'Error al buscar películas en el servidor.');
            }
        }

    async buscarPorGenero(socket, genero, pagina) {
        console.log(`Buscando películas por género: "${genero}", página: ${pagina}`);
        try {
            let resultados = [];
            const url = `https://www.omdbapi.com/?apikey=${this.apiKey}&type=movie&s=${encodeURIComponent(genero)}&page=${pagina}`;
            const respuesta = await axios.get(url);

            if (respuesta.data.Response === 'True' && respuesta.data.Search) {
                const peliculas = await Promise.all(
                    respuesta.data.Search.map(async (pelicula) => {
                        const urlDetalles = `https://www.omdbapi.com/?apikey=${this.apiKey}&i=${pelicula.imdbID}`;
                        const Detalles = await axios.get(urlDetalles);
                        return Detalles.data;
                    })
                );

                const filtradas = peliculas.filter(pelicula =>
                    pelicula.Genre && pelicula.Genre.toLowerCase().includes(genero.toLowerCase())
                );

                if (filtradas.length > 0) {
                    resultados = filtradas;
                    socket.emit('peliculasEncontradas', resultados.slice(0, 10));
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
    }

    iniciarServidor() {
        const port = 3000;
        this.servidor.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });
    }
}

const appPelis = new AppPelis();
appPelis.iniciarServidor();
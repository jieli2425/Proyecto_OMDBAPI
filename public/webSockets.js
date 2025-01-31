class AppBusqueda {
    constructor() {
        this.paginaPrincipal = 1;
        this.tituloPrincipal = '';
        this.socket = io();
        this.Elementos();
        this.Funciones();
    }

    Elementos() {
        this.botonBuscar = document.getElementById('botonBuscar');
        this.filtrar = document.getElementById('filtrar');
        this.botonLimpiar = document.getElementById('clearButton');
        this.botonCargar = document.getElementById('botoncargar');
        this.inputPeliculaBuscada = document.getElementById('movieTitle');
        this.filtroGenero = document.getElementById('generoFilter');
        this.contenedorPeliculas = document.getElementById('moviesContainer');
    }

    Funciones() {
        this.botonBuscar.addEventListener('click', () => {
            this.paginaPrincipal = 1;
            this.tituloPrincipal = this.inputPeliculaBuscada.value.trim();
            this.buscarPeliculas();
        });

        this.filtrar.addEventListener('click', () => {
            this.paginaPrincipal = 1;
            this.tituloPrincipal = '';
            let generoSeleccionado = this.filtroGenero.value.trim();
            if (!generoSeleccionado) {
                alert('Por favor, selecciona un género.');
                return;
            }
            this.buscarPorGenero(generoSeleccionado);
        });

        this.botonLimpiar.addEventListener('click', () => {
            this.inputPeliculaBuscada.value = '';
            this.filtroGenero.value = '';
            this.contenedorPeliculas.innerHTML = '';
            this.botonCargar.style.display = 'none';
            this.tituloPrincipal = '';
        });

        this.botonCargar.addEventListener('click', () => {
            this.paginaPrincipal++;
            if (this.tituloPrincipal) {
                this.buscarPeliculas();
            } else {
                this.buscarPorGenero(this.filtroGenero.value.trim());
            }
        });
    }

    buscarPeliculas() {
        if (!this.tituloPrincipal) return alert('Por favor, introduce un título.');
        this.socket.emit('buscarPeliculas', { titulo: this.tituloPrincipal, pagina: this.paginaPrincipal });
    }

    buscarPorGenero(genero) {
        console.log(`Buscando películas por género: ${genero}`);
        this.socket.emit('buscarPorGenero', { genero, pagina: this.paginaPrincipal });
    }

    mostrarPelicula(pelicula) {
        const tarjetaPelicula = document.createElement('div');
        tarjetaPelicula.className = 'movieCard';
        tarjetaPelicula.innerHTML = `
            <div class="card">
                <div class="cartafrontera">
                    <img src="${pelicula.Poster !== 'N/A' ? pelicula.Poster : './images/no-photo.jpg'}" alt="${pelicula.Title}">
                    <p>${pelicula.Title}</p>
                </div>
                <div class="cartatrasera">
                    <p><strong>Año:</strong> ${pelicula.Year || 'Desconocido'}</p>
                    <p><strong>Director:</strong> ${pelicula.Director || 'Desconocido'}</p>
                    <p><strong>Género:</strong> ${pelicula.Genre || 'Desconocido'}</p>
                    <p><strong>Duración:</strong> ${pelicula.Runtime || 'Desconocido'}</p>
                </div>
            </div>
        `;
        this.contenedorPeliculas.appendChild(tarjetaPelicula);
    }

    mostrarPeliculas(peliculas) {
        if (this.paginaPrincipal === 1) this.contenedorPeliculas.innerHTML = '';

        if (peliculas.length > 0) {
            peliculas.forEach((pelicula) => this.mostrarPelicula(pelicula));
            this.botonCargar.style.display = 'block';
        } else {
            if (this.paginaPrincipal === 1) {
                this.contenedorPeliculas.innerHTML = '<p>No se encontraron películas.</p>';
            } else {
                alert('No hay más resultados.');
                this.botonCargar.style.display = 'none';
            }
        }
    }

    manejarError(mensaje) {
        alert(mensaje);
        this.botonCargar.style.display = 'none';
    }

    ConexionSocket() {
        this.socket.on('peliculasEncontradas', (peliculas) => this.mostrarPeliculas(peliculas));
        this.socket.on('errorBusqueda', (mensaje) => this.manejarError(mensaje));
    }
}

const appBusqueda = new AppBusqueda();
appBusqueda.ConexionSocket();
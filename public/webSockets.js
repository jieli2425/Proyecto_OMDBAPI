// Conexión con el servidor de WebSocket
const socket = io();

// Variables globales para la paginación y búsqueda actual
let pagePrincipal = 1;
let titPrincipal = '';

// Elementos del DOM
const botonBuscar = document.getElementById('botonBuscar');
const filtrar = document.getElementById('filtrar');
const clearButton = document.getElementById('clearButton');
const botoncargar = document.getElementById('botoncargar');
const peliBuscado = document.getElementById('movieTitle');
const genreFilter = document.getElementById('generoFilter');
const moviesContainer = document.getElementById('moviesContainer');

// Evento: Buscar películas por título
botonBuscar.addEventListener('click', () => {
    pagePrincipal = 1;
    titPrincipal = peliBuscado.value;
    buscarPeliculas(titPrincipal);
});

// Evento: Filtrar por género
filtrar.addEventListener('click', () => {
    pagePrincipal = 1;
    titPrincipal = '';
    buscarPorGenero(genreFilter.value);
});

// Evento: Limpiar resultados
clearButton.addEventListener('click', () => {
    peliBuscado.value = '';
    genreFilter.value = '';
    moviesContainer.innerHTML = '';
    botoncargar.style.display = 'none';
    titPrincipal = '';
});

// Evento: Cargar más resultados
botoncargar.addEventListener('click', () => {
    pagePrincipal++;
    if (titPrincipal) {
        buscarPeliculas(titPrincipal);
    } else {
        buscarPorGenero(genreFilter.value);
    }
});

// Función para buscar películas por título
function buscarPeliculas(titulo) {
    if (!titulo) return alert('Por favor, introduce un título.');
    socket.emit('buscarPeliculas', { titulo, page: pagePrincipal });
}

// Función para buscar películas por género
function buscarPorGenero(genero) {
    if (!genero) return alert('Por favor, selecciona un género.');
    socket.emit('buscarPorGenero', { genero, page: pagePrincipal });
}

// Escuchar respuesta del servidor con las películas encontradas
socket.on('peliculasEncontradas', (movies) => {
    if (pagePrincipal === 1) moviesContainer.innerHTML = ''; // Limpia los resultados si es la primera página

    if (movies.length > 0) {
        movies.forEach((movie) => mostrarPelicula(movie));
        botoncargar.style.display = 'block';
    } else {
        if (pagePrincipal === 1) {
            moviesContainer.innerHTML = '<p>No se encontraron películas.</p>';
        } else {
            alert('No hay más resultados.');
            botoncargar.style.display = 'none';
        }
    }
});

// Escuchar errores de búsqueda del servidor
socket.on('errorBusqueda', (mensaje) => {
    alert(mensaje);
    botoncargar.style.display = 'none';
});

// Función para mostrar las tarjetas de las películas
function mostrarPelicula(movie) {
    const movieCard = document.createElement('div');
    movieCard.className = 'movieCard';
    movieCard.innerHTML = `
        <div class="card">
            <div class="cartafrontera">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : './images/no-photo.jpg'}" alt="${movie.Title}">
                <p>${movie.Title}</p>
            </div>
            <div class="cartatrasera">
                <p><strong>Año:</strong> ${movie.Year || 'Desconocido'}</p>
                <p><strong>Director:</strong> ${movie.Director || 'Desconocido'}</p>
                <p><strong>Género:</strong> ${movie.Genre || 'Desconocido'}</p>
                <p><strong>Duración:</strong> ${movie.Runtime || 'Desconocido'}</p>
            </div>
        </div>
    `;
    moviesContainer.appendChild(movieCard);
}

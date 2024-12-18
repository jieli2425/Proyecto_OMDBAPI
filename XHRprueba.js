const apiKey = 'a834ae02';
let currentPage = 1;

const botonBuscar = document.getElementById('botonBuscar');
const filtrar = document.getElementById('filtrar');
const clearButton = document.getElementById('clearButton');
const botoncargar = document.getElementById('botoncargar');
const movieTitleInput = document.getElementById('movieTitle');
const genreFilter = document.getElementById('generoFilter');
const moviesContainer = document.getElementById('moviesContainer');

botonBuscar.addEventListener('click', () => {
    currentPage = 1;
    buscarPeliculas(movieTitleInput.value);
});

filtrar.addEventListener('click', () => {
    currentPage = 1;
    buscarPorGenero(genreFilter.value);
});

clearButton.addEventListener('click', () => {
    movieTitleInput.value = '';
    genreFilter.value = '';
    moviesContainer.innerHTML = '';
    botoncargar.style.display = 'none';
});

botoncargar.addEventListener('click', () => {
    currentPage++;
    buscarPorGenero(genreFilter.value)
});

// Función para buscar películas por título
function buscarPeliculas(titulo = '') {
    let url = `https://www.omdbapi.com/?apikey=${apiKey}&type=movie`;

    if (titulo) {
        url += `&s=${encodeURIComponent(titulo)}`;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = () => {
        if (xhr.status === 200) {
            const respuesta = JSON.parse(xhr.responseText);
            if (respuesta.Response === 'True') {
                let movies = respuesta.Search;
                obtenerDetallesDePeliculas(movies);
                botoncargar.style.display = 'none';
            } else {
                moviesContainer.innerHTML = '<p>No se encontraron películas</p>';
            }
        } else {
            console.error('Error al buscar películas');
        }
    };
    xhr.onerror = () => console.error('Conexión fallida');
    xhr.send();
}
// Función para buscar películas por género
function buscarPorGenero(genero = '') {
    if (!genero) return;
    botoncargar.style.display = 'block';

    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(genero)}&type=movie&page=${currentPage}`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = () => {
        if (xhr.status === 200) {
            const respuesta = JSON.parse(xhr.responseText);
            if (respuesta.Response === 'True') {
                let movies = respuesta.Search;
                obtenerDetallesDePeliculas(movies);
            } else {
                moviesContainer.innerHTML = '<p>No se encontraron películas para este género</p>';
            }
        } else {
            console.error('Error al buscar películas');
        }
    };
    xhr.onerror = () => console.error('Conexión fallida');
    xhr.send();
}
// Función para obtener detalles de cada película y mostrarlas
function obtenerDetallesDePeliculas(movies) {
    if (currentPage === 1) {
        moviesContainer.innerHTML = '';
    }

    // Mostrar las películas
    movies.forEach(movie => {
        const detallesUrl = `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', detallesUrl, true);
        xhr.onload = () => {
            if (xhr.status === 200) {
                const movieDetalles = JSON.parse(xhr.responseText);
                if (movieDetalles.Response === 'True') {
                    mostrarPelicula(movieDetalles);
                }
            }
        };
        xhr.onerror = () => console.error('Error al obtener detalles de la película');
        xhr.send();
    });
}
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
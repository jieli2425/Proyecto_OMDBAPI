const apiKey = 'a834ae02';
let pagPrincipal = 1;
let titPrincipal = '';

const botonBuscar = document.getElementById('botonBuscar');
const filtrar = document.getElementById('filtrar');
const clearButton = document.getElementById('clearButton');
const botoncargar = document.getElementById('botoncargar');
const peliBuscado = document.getElementById('movieTitle');
const genreFilter = document.getElementById('generoFilter');
const moviesContainer = document.getElementById('moviesContainer');

botonBuscar.addEventListener('click', () => {
    pagPrincipal = 1;
    titPrincipal = peliBuscado.value;
    buscarPeliculas(titPrincipal);
});

filtrar.addEventListener('click', () => {
    pagPrincipal = 1;
    titPrincipal = '';
    buscarPorGenero(genreFilter.value);
});

clearButton.addEventListener('click', () => {
    peliBuscado.value = '';
    genreFilter.value = '';
    moviesContainer.innerHTML = '';
    botoncargar.style.display = 'none';
    titPrincipal = '';
});

botoncargar.addEventListener('click', () => {
    pagPrincipal++;
    if (titPrincipal) {
        buscarPeliculas(titPrincipal);
    } else {
        buscarPorGenero(genreFilter.value);
    }
});

// Función para buscar películas por título
async function buscarPeliculas(titulo = '') {
    let url = `https://www.omdbapi.com/?apikey=${apiKey}&type=movie`;

    if (titulo) {
        url += `&s=${encodeURIComponent(titulo)}&page=${pagPrincipal}`;
    }

    try {
        const response = await fetch(url);
        const respuesta = await response.json();
        if (respuesta.Response === 'True') {
            let movies = respuesta.Search;
            await obtenerDetallesDePeliculas(movies);
            botoncargar.style.display = 'block';
        } else {
            moviesContainer.innerHTML = '<p>No se encontraron películas</p>';
        }
    } catch (error) {
        console.error('Error al buscar películas', error);
    }
}

// Función para buscar películas por género
async function buscarPorGenero(genero = '') {
    if (!genero) return;
    botoncargar.style.display = 'block';

    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(genero)}&type=movie&page=${pagPrincipal}`;

    try {
        const response = await fetch(url);
        const respuesta = await response.json();
        if (respuesta.Response === 'True') {
            let movies = respuesta.Search;
            await obtenerDetallesDePeliculas(movies);
        } else {
            moviesContainer.innerHTML = '<p>No se encontraron películas para este género</p>';
        }
    } catch (error) {
        console.error('Error al buscar películas', error);
    }
}

// Función para obtener detalles de cada película y mostrarlas
async function obtenerDetallesDePeliculas(movies) {
    if (pagPrincipal === 1) {
        moviesContainer.innerHTML = '';
    }

    const detallesPromises = movies.map(movie => {
        const detallesUrl = `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`;
        return fetch(detallesUrl).then(response => response.json());
    });

    try {
        const raceResult = await Promise.race(detallesPromises);
        mostrarPelicula(raceResult);
    } catch (error) {
        console.error('Error al obtener detalles de las películas', error);
    }
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

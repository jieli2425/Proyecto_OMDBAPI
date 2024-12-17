const apiKey = 'a834ae02';

const searchButton = document.getElementById('searchButton');
const applyFilterButton = document.getElementById('applyFilterButton');
const clearButton = document.getElementById('clearButton');
const movieTitleInput = document.getElementById('movieTitle');
const genreFilter = document.getElementById('generoFilter');
const moviesContainer = document.getElementById('moviesContainer');

searchButton.addEventListener('click', () => buscarPeliculas(movieTitleInput.value));
applyFilterButton.addEventListener('click', () => buscarPeliculas('', genreFilter.value));
clearButton.addEventListener('click', () => {
    movieTitleInput.value = '';
    moviesContainer.innerHTML = '';
});

function buscarPeliculas(titulo = '', genero = '') {
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(titulo || 'movie')}&type=movie`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = () => {
        if (xhr.status === 200) {
            const respuesta = JSON.parse(xhr.responseText);
            if (respuesta.Response === 'True') {
                let movies = respuesta.Search;
                obtenerDetallesDePeliculas(movies, genero);
                actualizarGeneros(movies);
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

function obtenerDetallesDePeliculas(movies, genero) {
    moviesContainer.innerHTML = '';
    movies.forEach(movie => {
        const detallesUrl = `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', detallesUrl, true);
        xhr.onload = () => {
            if (xhr.status === 200) {
                const movieDetalles = JSON.parse(xhr.responseText);
                if (movieDetalles.Response === 'True') {
                    if (!genero || movieDetalles.Genre?.toLowerCase().includes(genero)) {
                        mostrarPelicula(movieDetalles);
                    }
                }
            }
        };
        xhr.onerror = () => console.error('Error al obtener detalles de la película');
        xhr.send();
    });
}

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
        `
    moviesContainer.appendChild(movieCard);
}

function actualizarGeneros(movies) {
    const genres = new Set();
    movies.forEach(movie => movie.Genre?.split(', ').forEach(g => genres.add(g.toLowerCase())));

    const selectedGenre = genreFilter.value;
    Array.from(genres).sort().forEach(g => {
        const option = document.createElement('option');
        option.value = g;
        option.textContent = g.charAt(0).toUpperCase() + g.slice(1);
        genreFilter.appendChild(option);
    });
    genreFilter.value = selectedGenre;
}

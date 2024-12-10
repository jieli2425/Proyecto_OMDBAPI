// Llista de dècades disponibles
const decades = Array.from({ length: 13 }, (_, i) => 1900 + i * 10).concat(2020);

// Llista de gèneres disponibles (exemple)
const genres = [
    'Action', 'Adventure', 'Animation', 'Biography', 
    'Comedy', 'Crime', 'Documentary', 'Drama', 
    'Family', 'Fantasy', 'History', 'Horror', 
    'Music', 'Mystery', 'Romance', 'Sci-Fi', 
    'Sport', 'Thriller', 'War', 'Western'
];

// Omplir opcions de dècades i gèneres
document.addEventListener('DOMContentLoaded', function () {
    const decadeSelect = document.getElementById('decadeFilter');
    const genreSelect = document.getElementById('genreFilter');

    // Afegir opcions de dècades
    decades.forEach(decade => {
        const option = document.createElement('option');
        option.value = decade;
        option.textContent = `${decade}s`;
        decadeSelect.appendChild(option);
    });

    // Afegir opcions de gèneres
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.toLowerCase();
        option.textContent = genre;
        genreSelect.appendChild(option);
    });
});

// Mostrar i ocultar les opcions de filtre
document.getElementById('filterToggleButton').addEventListener('click', function () {
    const filterOptions = document.getElementById('filterOptions');
    filterOptions.style.display = filterOptions.style.display === 'none' ? 'block' : 'none';
});

// Aplicar filtres
document.getElementById('applyFilterButton').addEventListener('click', function () {
    const decade = document.getElementById('decadeFilter').value;
    const genre = document.getElementById('genreFilter').value;
    searchMoviesWithFilters(decade, genre);
});

// Buscar películas
document.getElementById('searchButton').addEventListener('click', function () {
    const movieTitle = document.getElementById('movieTitle').value;
    if (movieTitle) {
        searchMovies(movieTitle);
    } else {
        alert('Introduce un título de película.');
    }
});

// Borrar resultados
document.getElementById('clearButton').addEventListener('click', function () {
    document.getElementById('movieTitle').value = '';
    document.getElementById('decadeFilter').value = '';
    document.getElementById('genreFilter').value = '';
    document.getElementById('moviesContainer').innerHTML = '';
});

// Buscar películas usando OMDB API (con título)
function searchMovies(title) {
    const apiKey = 'a834ae02';
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(title)}`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.Response === 'True') {
                displayMovies(response.Search);
            } else {
                document.getElementById('moviesContainer').innerHTML = '<p>No se han encontrado películas.</p>';
            }
        } else {
            console.error('Error en la solicitud:', xhr.statusText);
        }
    };

    xhr.onerror = function () {
        console.error('Error en la conexión.');
    };

    xhr.send();
}

// Buscar películas usando OMDB API (con filtros)
function searchMoviesWithFilters(decade, genre) {
    const apiKey = 'a834ae02';
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(genre || 'movie')}`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.Response === 'True') {
                const filteredMovies = response.Search.filter(movie => {
                    let matchesDecade = true;

                    if (decade) {
                        const movieYear = parseInt(movie.Year, 10);
                        matchesDecade = movieYear >= parseInt(decade, 10) && movieYear < parseInt(decade, 10) + 10;
                    }

                    return matchesDecade;
                });

                if (filteredMovies.length > 0) {
                    displayMovies(filteredMovies);
                } else {
                    document.getElementById('moviesContainer').innerHTML = '<p>No se han encontrado películas con esos filtros.</p>';
                }
            } else {
                document.getElementById('moviesContainer').innerHTML = '<p>No se han encontrado películas.</p>';
            }
        } else {
            console.error('Error en la solicitud:', xhr.statusText);
        }
    };

    xhr.onerror = function () {
        console.error('Error en la conexión.');
    };

    xhr.send();
}

function updateGenreFilter(movies) {
    const genreSelect = document.getElementById('genreFilter');
    const genresFound = new Set();

    // Buscar géneros únicos en las películas
    movies.forEach(movie => {
        if (movie.Genre) {
            movie.Genre.split(', ').forEach(genre => {
                genresFound.add(genre.toLowerCase());
            });
        }
    });

    // Limpiar las opciones de géneros y agregar las nuevas
    genreSelect.innerHTML = '<option value="">Todos los géneros</option>';

    genresFound.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre.charAt(0).toUpperCase() + genre.slice(1);
        genreSelect.appendChild(option);
    });
}

// Mostrar las películas en pantalla
function displayMovies(movies) {
    const moviesContainer = document.getElementById('moviesContainer');
    moviesContainer.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movieCard';
        movieCard.innerHTML = `
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150'}" alt="${movie.Title}">
            <p>${movie.Title}</p>
            <div class="movieDetails" style="display: none;"></div>
        `;

        movieCard.addEventListener('click', function () {
            const detailsContainer = movieCard.querySelector('.movieDetails');
            if (detailsContainer.style.display === 'none') {
                fetchMovieDetails(movie.imdbID, detailsContainer);
            } else {
                detailsContainer.style.display = 'none';
            }
        });

        moviesContainer.appendChild(movieCard);
    });
}

// Obtener detalles de una película
function fetchMovieDetails(imdbID, container) {
    const apiKey = 'a834ae02';
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const movie = JSON.parse(xhr.responseText);
            if (movie.Response === 'True') {
                displayMovieDetails(movie, container);
            }
        } else {
            console.error('Error en la solicitud:', xhr.statusText);
        }
    };

    xhr.onerror = function () {
        console.error('Error en la conexión.');
    };

    xhr.send();
}

// Mostrar los detalles de la película
function displayMovieDetails(movie, container) {
    container.innerHTML = `
        <p><strong>Año:</strong> ${movie.Year}</p>
        <p><strong>Director:</strong> ${movie.Director}</p>
        <p><strong>Género:</strong> ${movie.Genre}</p>
        <p><strong>Actores:</strong> ${movie.Actors}</p>
    `;
    container.style.display = 'block';
}

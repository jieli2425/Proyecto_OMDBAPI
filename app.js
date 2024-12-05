document.getElementById('searchButton').addEventListener('click', function () {
    const movieTitle = document.getElementById('movieTitle').value;
    if (movieTitle) {
        fetchMovie(movieTitle);
    } else {
        alert('Por favor, ingresa un título de película.');
    }
});

function fetchMovie(title) {
    const apiKey = 'b13fdef7'; 
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(title)}`;


    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.Response === 'True') {
                displayMovie(response);
            } else {
                document.getElementById('movieResult').innerHTML = `<p>No se encontró la película.</p>`;
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

function displayMovie(movie) {
    const movieDetails = `
        <h2>${movie.Title}</h2>
        <p><strong>Año:</strong> ${movie.Year}</p>
        <p><strong>Director:</strong> ${movie.Director}</p>
        <p><strong>Género:</strong> ${movie.Genre}</p>
        <img src="${movie.Poster}" alt="Poster de ${movie.Title}" style="max-width: 200px;">
    `;
    document.getElementById('movieResult').innerHTML = movieDetails;
}
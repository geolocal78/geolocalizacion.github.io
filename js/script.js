let isLoggedIn = false; // Estado de inicio de sesión
const maxLocations = 3; // Máximo de localizaciones gratis
let locationCount = parseInt(localStorage.getItem('locationCount')) || 0; // Recuperar el conteo de localizaciones
let alertShown = false; // Para controlar si se ha mostrado el cuadro de alerta

// Inicializar mapa
var map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var marker = L.marker([0, 0]).addTo(map);

// Comprobar el estado de inicio de sesión al cargar la página
window.onload = function () {
    const savedUser = localStorage.getItem('loggedUser');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        isLoggedIn = true;
        document.getElementById('profile-info').textContent = `Bienvenido, ${userData.username}!`;
        document.getElementById('profile').style.display = 'block'; // Mostrar perfil
        document.getElementById('logout-button').style.display = 'block'; // Mostrar botón de cerrar sesión
        document.getElementById('login-form').style.display = 'none'; // Ocultar formulario de inicio de sesión
    }

    // Mostrar el conteo actual de localizaciones
    document.getElementById('location-count').textContent = `Localizaciones realizadas: ${locationCount}/${maxLocations}`;
};

// Funcionalidad para buscar IP
document.getElementById('search-button').addEventListener('click', function () {
    const ipInput = document.getElementById('ip-input').value.trim();
    if (!ipInput) {
        alert('Por favor, ingresa una dirección IP.');
        return;
    }

    if (locationCount >= maxLocations && !isLoggedIn) {
        if (!alertShown) {
            document.getElementById('alert-box').style.display = 'block'; // Mostrar cuadro de alerta
            alertShown = true;
        }
        return;
    }

    // Llamar a la API de geolocalización
    fetch(`http://ip-api.com/json/${ipInput}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === "fail") {
                alert('No se pudo encontrar la ubicación para esta IP.');
            } else {
                const { lat, lon, city, region, country } = data;
                marker.setLatLng([lat, lon]); // Actualizar la posición del marcador
                map.setView([lat, lon], 10); // Centrar el mapa en la ubicación
                marker.bindPopup(`<b>${city}, ${region}, ${country}</b>`).openPopup();

                // Incrementar el conteo de localizaciones
                locationCount++;
                localStorage.setItem('locationCount', locationCount);
                document.getElementById('location-count').textContent = `Localizaciones realizadas: ${locationCount}/${maxLocations}`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un error al obtener la geolocalización.');
        });
});

// Función para cerrar sesión
document.getElementById('logout-button').addEventListener('click', function () {
    isLoggedIn = false;
    document.getElementById('profile').style.display = 'none';
    localStorage.removeItem('loggedUser'); // Eliminar el estado de inicio de sesión
    document.getElementById('logout-button').style.display = 'none'; // Ocultar botón de cerrar sesión
    document.getElementById('login-form').style.display = 'block'; // Mostrar formulario de inicio de sesión
});

// Mostrar menú y manejar eventos
document.getElementById('menu-button').addEventListener('click', function () {
    document.getElementById('overlay').classList.add('active');
    document.getElementById('menu').style.display = 'block';
});

// Cerrar menú
document.getElementById('close-menu').addEventListener('click', function () {
    document.getElementById('overlay').classList.remove('active');
    document.getElementById('menu').style.display = 'none';
});

// Manejar el botón de alerta para iniciar sesión
document.getElementById('alert-login-button').addEventListener('click', function () {
    document.getElementById('alert-box').style.display = 'none'; // Ocultar cuadro de alerta
    document.getElementById('menu').style.display = 'block'; // Mostrar menú para iniciar sesión
    document.getElementById('overlay').classList.add('active');
});

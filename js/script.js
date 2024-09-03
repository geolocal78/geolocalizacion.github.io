let locationCount = 0; // Contador de localizaciones para usuarios no autenticados
const maxLocations = 3; 
const locationHistory = JSON.parse(localStorage.getItem('locationHistory')) || []; 
const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || []; 

// Verificar estado de inicio de sesión y actualizar el contador
function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        showNotification("Bienvenido de nuevo, " + loggedInUser + "!");
        document.getElementById('logout-button').style.display = 'block'; 
        document.getElementById('login-form').style.display = 'none'; 
        document.getElementById('register-form').style.display = 'none'; 
        document.getElementById('location-count').textContent = 'Localizaciones realizadas: Ilimitadas';
    } else {
        locationCount = parseInt(localStorage.getItem('locationCount')) || 0;
        document.getElementById('location-count').textContent = `Localizaciones realizadas: ${locationCount}/${maxLocations}`;
    }
}

// Inicializar el estado de inicio de sesión
checkLoginStatus();

// Inicializar mapa
var map = L.map('map').setView([20, -100], 5); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var marker = L.marker([20, -100]).addTo(map); 

// Actualizar el conteo de localizaciones
function updateLocationCount() {
    if (localStorage.getItem('loggedInUser')) {
        document.getElementById('location-count').textContent = 'Localizaciones realizadas: Ilimitadas';
    } else {
        document.getElementById('location-count').textContent = `Localizaciones realizadas: ${locationCount}/${maxLocations}`;
    }
}

// Mostrar historial de geolocalizaciones
function showLocationHistory() {
    const historyDiv = document.createElement('div');
    historyDiv.innerHTML = '<h2>Historial de Geolocalizaciones</h2>';
    locationHistory.forEach(loc => {
        const { lat, lon, ip } = loc;
        const locItem = document.createElement('p');
        locItem.textContent = `IP: ${ip} - Lat: ${lat}, Lon: ${lon}`;
        historyDiv.appendChild(locItem);
    });
    document.body.appendChild(historyDiv);
}

// Funcionalidad para buscar IP
document.getElementById('search-button').addEventListener('click', function () {
    const ipInput = document.getElementById('ip-input').value.trim();
    if (!ipInput) {
        showNotification('Por favor, ingresa una dirección IP.');
        return;
    }

    // Lógica para limitar geolocalizaciones
    if (!localStorage.getItem('loggedInUser') && locationCount >= maxLocations) {
        document.getElementById('alert-message').textContent = "Has alcanzado el límite de geolocalizaciones. Inicia sesión para continuar.";
        document.getElementById('alert-box').style.display = 'block'; 
        setTimeout(() => {
            document.getElementById('alert-box').style.display = 'none'; 
        }, 5000);
        return;
    }

    // Llamar a la API de geolocalización
    fetch(`http://ip-api.com/json/${ipInput}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === "fail") {
                showNotification('No se pudo encontrar la ubicación para esta IP.');
            } else {
                const { lat, lon, city, region, country, zip, isp } = data;
                marker.setLatLng([lat, lon]);
                map.setView([lat, lon], 10);
                marker.bindPopup(`<b>IP: ${ipInput}</b><br>Ciudad: ${city}<br>Región: ${region}<br>País: ${country}<br>Código Postal: ${zip}<br>ISP: ${isp}`).openPopup();

                // Incrementar el contador de localizaciones solo si el usuario no ha iniciado sesión
                if (!localStorage.getItem('loggedInUser')) {
                    locationCount++;
                    localStorage.setItem('locationCount', locationCount); // Guardar el contador de localizaciones
                }
                
                updateLocationCount();

                // Guardar en el historial
                locationHistory.push({ lat, lon, ip: ipInput });
                localStorage.setItem('locationHistory', JSON.stringify(locationHistory));

                // Mostrar historial de geolocalizaciones
                showLocationHistory();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Hubo un error al obtener la geolocalización.');
        });
});

// Funciones para mostrar y ocultar el menú
document.getElementById('menu-button').addEventListener('click', function () {
    document.getElementById('overlay').style.display = 'flex';
});

document.getElementById('close-menu').addEventListener('click', function () {
    document.getElementById('overlay').style.display = 'none';
});

// Función para mostrar notificaciones
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.opacity = 1;

    setTimeout(() => {
        notification.style.opacity = 0;
        notification.style.display = 'none';
    }, 3000); 
}

// Manejo del inicio de sesión
document.getElementById('login-button').addEventListener('click', function () {
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;

    document.getElementById('login-message').style.opacity = 0;
    document.querySelector('.loading-icon').style.display = 'inline-block';
    document.getElementById('login-message').textContent = "";

    if (email && password) {
        const user = registeredUsers.find(user => user.email === email && user.password === password);
        setTimeout(() => {
            document.querySelector('.loading-icon').style.display = 'none';
            if (user) {
                localStorage.setItem('loggedInUser', user.email); 
                showNotification("Inicio de sesión exitoso!");
                localStorage.setItem('locationCount', 0); // Reiniciar el contador al iniciar sesión
                updateLocationCount(); // Actualizar el contador de visualización
                document.getElementById('overlay').style.display = 'none'; 
                document.getElementById('alert-box').style.display = 'none'; 
                document.getElementById('logout-button').style.display = 'block'; 
                document.getElementById('login-form').style.display = 'none'; 
                document.getElementById('register-form').style.display = 'none'; 
            } else {
                showNotification("Credenciales incorrectas.");
            }
        }, 2000); 
    } else {
        document.querySelector('.loading-icon').style.display = 'none';
        document.getElementById('login-message').textContent = "Por favor, completa todos los campos.";
        document.getElementById('login-message').style.opacity = 1;
    }
});

// Manejo del registro
document.getElementById('register-button').addEventListener('click', function () {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email-register').value;
    const password = document.getElementById('password-register').value;
    const dob = document.getElementById('dob').value;

    if (name && email && password && dob) {
        const existingUser = registeredUsers.find(user => user.email === email);
        if (existingUser) {
            showNotification("Este correo ya está registrado.");
        } else {
            registeredUsers.push({ name, email, password, dob });
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            showNotification("Registro exitoso. Puedes iniciar sesión ahora.");
            document.getElementById('register-form').reset();
        }
    } else {
        showNotification("Por favor, completa todos los campos.");
    }
});

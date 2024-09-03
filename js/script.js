document.getElementById('search-button').addEventListener('click', function () {
    if (locationCount >= maxLocations && !isLoggedIn) {
        if (!alertShown) { // Mostrar solo una vez
            document.getElementById('alert-box').style.display = 'block'; // Mostrar cuadro de alerta
            alertShown = true; // Marcar que se ha mostrado el cuadro
        }
        return;
    }
    document.getElementById('login-warning').style.display = 'none'; // Ocultar advertencia

    var ip = document.getElementById('ip-input').value.trim();
    if (!ip) {
        alert("Por favor, ingresa una IP válida.");
        return;
    }

    // Usando la API de ip-api.com con HTTPS y proxy para manejar CORS
    fetch(`https://cors-anywhere.herokuapp.com/https://ip-api.com/json/${ip}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === "fail") {
                alert("No se pudo obtener la ubicación. Verifica la IP ingresada.");
            } else {
                // Actualizar el mapa con la ubicación
                const lat = data.lat;
                const lon = data.lon;
                const city = data.city || "Ciudad no disponible";
                const region = data.regionName || "Región no disponible";
                const isp = data.isp || "ISP no disponible";

                marker.setLatLng([lat, lon])
                    .bindPopup(`Ciudad: ${city}<br>Región: ${region}<br>ISP: ${isp}<br>Latitud: ${lat}, Longitud: ${lon}`)
                    .openPopup(); // Mostrar en el popup

                map.setView([lat, lon], 13); // Ajustar el zoom
                locationCount++; // Aumentar el conteo de localizaciones
                localStorage.setItem('locationCount', locationCount); // Guardar el conteo
                document.getElementById('location-count').textContent = `Localizaciones realizadas: ${locationCount}/${maxLocations}`;
            }
        })
        .catch(error => {
            console.error("Error al obtener los datos:", error);
        });
});

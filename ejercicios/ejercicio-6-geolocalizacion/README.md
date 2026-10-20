```js
const locationPermission = document.querySelector('#location-permission');
const locationMessage = document.querySelector('#location-message');
const locationButton = document.querySelector('#location-button');
const locationCoordinates = document.querySelector('#location-coordinates');
const locationLatitude = document.querySelector('#location-latitude');
const locationLongitude = document.querySelector('#location-longitude');
const locationMap = document.querySelector('#location-map');
const GEOLOCATION_ERROR = {
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
};

function showLocationPermission(state) {
    const permissionMessages = {
        granted: 'Permiso concedido',
        prompt: 'Aún no se ha solicitado',
        denied: 'Permiso denegado',
    };

    locationPermission.textContent = permissionMessages[state] || 'Estado no disponible';
}

async function checkLocationPermission() {
    if (!navigator.permissions || typeof navigator.permissions.query !== 'function') {
        locationPermission.textContent = 'Consulta de permisos no disponible en este navegador';
        return;
    }

    try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        showLocationPermission(permission.state);
        permission.addEventListener('change', () => showLocationPermission(permission.state));
    } catch (error) {
        locationPermission.textContent = 'No se pudo consultar el estado del permiso';
        console.error('No se pudo consultar el permiso de geolocalización:', error);
    }
}

locationButton.addEventListener('click', () => {
    if (!window.isSecureContext) {
        locationMessage.textContent = 'La geolocalización necesita una conexión segura (HTTPS o localhost).';
        return;
    }

    if (!navigator.geolocation) {
        locationMessage.textContent = 'Este navegador no ofrece el servicio de geolocalización.';
        return;
    }

    locationButton.disabled = true;
    locationMessage.textContent = 'Si aparece el aviso del navegador, selecciona Permitir. Buscando tu ubicación…';
    locationCoordinates.hidden = true;
    locationMap.hidden = true;

    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const latitudeText = latitude.toFixed(6);
        const longitudeText = longitude.toFixed(6);

        locationLatitude.textContent = `${latitudeText}°`;
        locationLongitude.textContent = `${longitudeText}°`;
        locationCoordinates.hidden = false;
        locationMap.href = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
        locationMap.hidden = false;
        locationMessage.textContent = 'Ubicación obtenida correctamente.';
        locationButton.disabled = false;
        showLocationPermission('granted');
    }, (error) => {
        const errorMessages = {
            [GEOLOCATION_ERROR.PERMISSION_DENIED]: 'Se denegó el permiso. Puedes cambiarlo desde la configuración del navegador.',
            [GEOLOCATION_ERROR.POSITION_UNAVAILABLE]: 'El dispositivo no pudo determinar la ubicación.',
            [GEOLOCATION_ERROR.TIMEOUT]: 'La solicitud tardó demasiado. Inténtalo nuevamente.',
        };

        locationMessage.textContent = errorMessages[error.code] || 'Ocurrió un error al obtener la ubicación.';
        locationButton.disabled = false;

        if (error.code === GEOLOCATION_ERROR.PERMISSION_DENIED) {
            showLocationPermission('denied');
        }
    }, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 30000,
    });
});

checkLocationPermission();
```

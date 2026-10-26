```html
<section class="coffee-api-section history-section" id="ideas-cafeteras" aria-labelledby="coffee-api-title">
    <div class="section-heading">
        <div><span class="eyebrow">RECETAS DESDE UNA API REMOTA</span><h2 id="coffee-api-title">Ideas cafeteras</h2></div>
        <button class="coffee-api-refresh" id="coffee-api-refresh" type="button">Actualizar recetas</button>
    </div>
    <p class="history-empty" id="coffee-api-status" role="status" aria-live="polite">Cargando recetas…</p>
    <ul class="coffee-api-list" id="coffee-api-list" aria-live="polite"></ul>
</section>
```

```js
const COFFEE_API_DATABASE = 'cafe-de-barrio-api-cache';
const COFFEE_API_STORE = 'responses';
const COFFEE_API_KEY = 'hot-coffees';
const COFFEE_API_URL = 'https://api.sampleapis.com/coffee/hot';

function openCoffeeApiDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(COFFEE_API_DATABASE, 1);

        request.addEventListener('upgradeneeded', () => {
            if (!request.result.objectStoreNames.contains(COFFEE_API_STORE)) {
                request.result.createObjectStore(COFFEE_API_STORE, { keyPath: 'key' });
            }
        });
        request.addEventListener('success', () => {
            request.result.addEventListener('versionchange', () => request.result.close());
            resolve(request.result);
        }, { once: true });
        request.addEventListener('error', () => {
            reject(request.error || new Error('No se pudo abrir la caché local de la API.'));
        }, { once: true });
    });
}

async function saveCoffeeApiResponse(data) {
    const database = await openCoffeeApiDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(COFFEE_API_STORE, 'readwrite');
        transaction.objectStore(COFFEE_API_STORE).put({
            key: COFFEE_API_KEY,
            data,
            cachedAt: new Date().toISOString(),
        });
        transaction.addEventListener('complete', () => {
            database.close();
            resolve();
        }, { once: true });
        transaction.addEventListener('error', () => {
            database.close();
            reject(transaction.error || new Error('No se pudo guardar la respuesta de la API.'));
        }, { once: true });
        transaction.addEventListener('abort', () => {
            database.close();
            reject(transaction.error || new Error('La transacción de caché fue cancelada.'));
        }, { once: true });
    });
}

async function getCoffeeApiResponse() {
    const database = await openCoffeeApiDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(COFFEE_API_STORE, 'readonly');
        const request = transaction.objectStore(COFFEE_API_STORE).get(COFFEE_API_KEY);
        request.addEventListener('success', () => resolve(request.result), { once: true });
        request.addEventListener('error', () => {
            reject(request.error || new Error('No se pudo leer la respuesta guardada de la API.'));
        }, { once: true });
        transaction.addEventListener('complete', () => database.close(), { once: true });
        transaction.addEventListener('abort', () => {
            database.close();
            reject(transaction.error || new Error('No se pudo leer la caché local de la API.'));
        }, { once: true });
    });
}

const coffeeApiStatus = document.querySelector('#coffee-api-status');
const coffeeApiList = document.querySelector('#coffee-api-list');
const coffeeApiRefresh = document.querySelector('#coffee-api-refresh');
let coffeeApiRequest;
let coffeeApiController;

function isCoffeeApiResponse(data) {
    return Array.isArray(data) && data.length > 0 && data.every((coffee) => (
        coffee
        && typeof coffee.id === 'number'
        && typeof coffee.title === 'string'
        && typeof coffee.description === 'string'
        && Array.isArray(coffee.ingredients)
        && coffee.ingredients.every((ingredient) => typeof ingredient === 'string')
    ));
}

function renderCoffeeRecipes(coffees) {
    coffeeApiList.replaceChildren();

    coffees.slice(0, 6).forEach((coffee) => {
        const item = document.createElement('li');
        item.className = 'coffee-api-card';

        const title = document.createElement('h3');
        title.textContent = coffee.title;
        const description = document.createElement('p');
        description.textContent = coffee.description;
        const ingredients = document.createElement('p');
        ingredients.className = 'coffee-api-ingredients';
        ingredients.textContent = `Ingredientes: ${coffee.ingredients.join(', ') || 'No disponibles'}`;

        item.append(title, description, ingredients);
        coffeeApiList.append(item);
    });
}

async function showCachedCoffeeRecipes(networkError) {
    try {
        const cachedResponse = await getCoffeeApiResponse();
        if (!cachedResponse || !isCoffeeApiResponse(cachedResponse.data)) {
            coffeeApiList.replaceChildren();
            coffeeApiStatus.textContent = 'No hay una copia guardada. Conéctate a internet e inténtalo de nuevo.';
            return;
        }

        renderCoffeeRecipes(cachedResponse.data);
        const cachedDate = new Date(cachedResponse.cachedAt).toLocaleString('es-MX');
        coffeeApiStatus.textContent = `Sin conexión con la API. Se muestra la última respuesta guardada (${cachedDate}).`;
        console.info('Se muestran recetas guardadas porque la API no está disponible:', networkError);
    } catch (error) {
        console.error('No se pudo recuperar la respuesta de la API desde IndexedDB:', error);
        coffeeApiList.replaceChildren();
        coffeeApiStatus.textContent = `No se pudieron cargar las recetas guardadas: ${error.message}`;
    }
}

function loadCoffeeRecipes() {
    if (coffeeApiRequest) return coffeeApiRequest;

    coffeeApiRefresh.disabled = true;
    coffeeApiStatus.textContent = navigator.onLine
        ? 'Consultando la API de recetas…'
        : 'Sin conexión. Buscando la última respuesta guardada…';

    coffeeApiRequest = (async () => {
        if (!navigator.onLine) {
            await showCachedCoffeeRecipes(new Error('El dispositivo no tiene conexión a internet.'));
            return;
        }

        coffeeApiController = new AbortController();
        const timeout = window.setTimeout(() => coffeeApiController.abort(), 10000);

        try {
            const response = await fetch(COFFEE_API_URL, {
                cache: 'no-store',
                signal: coffeeApiController.signal,
            });
            if (!response.ok) {
                throw new Error(`La API respondió con el estado ${response.status}.`);
            }

            const data = await response.json();
            if (!isCoffeeApiResponse(data)) {
                throw new Error('La API devolvió un formato de datos inesperado.');
            }

            renderCoffeeRecipes(data);
            try {
                await saveCoffeeApiResponse(data);
                coffeeApiStatus.textContent = `Recetas actualizadas desde la API. ${data.length} disponibles; copia local guardada.`;
            } catch (error) {
                console.error('No se pudo guardar la respuesta de la API en IndexedDB:', error);
                coffeeApiStatus.textContent = `Se muestran recetas en vivo, pero no se pudo guardar una copia local: ${error.message}`;
            }
        } catch (error) {
            await showCachedCoffeeRecipes(error);
        } finally {
            window.clearTimeout(timeout);
        }
    })().finally(() => {
        coffeeApiController = null;
        coffeeApiRequest = null;
        coffeeApiRefresh.disabled = false;
    });

    return coffeeApiRequest;
}

coffeeApiRefresh.addEventListener('click', loadCoffeeRecipes);
window.addEventListener('online', loadCoffeeRecipes);
window.addEventListener('offline', () => {
    if (coffeeApiController) {
        coffeeApiController.abort();
    } else {
        loadCoffeeRecipes();
    }
});

loadCoffeeRecipes();
```

- [`cafeteria.js`](../../public/cafeteria.js)
- [`cafeteria.css`](../../public/cafeteria.css)
- [`welcome.blade.php`](../../resources/views/welcome.blade.php)

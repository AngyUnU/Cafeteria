# Ejercicio 9

```html
<section class="history-section local-records-section" id="registros-locales" aria-labelledby="local-records-title">
    <div class="section-heading">
        <div><span class="eyebrow">DATOS GUARDADOS EN ESTE DISPOSITIVO</span><h2 id="local-records-title">Notas locales</h2></div>
        <p>Guarda y consulta tus notas<br>incluso sin conexión.</p>
    </div>
    <form class="local-record-form" id="local-record-form">
        <label for="local-record-title">Título</label>
        <input id="local-record-title" name="title" type="text" maxlength="80" required>
        <label for="local-record-description">Nota</label>
        <textarea id="local-record-description" name="description" rows="3" maxlength="500" required></textarea>
        <button class="checkout-button location-button" id="local-record-submit" type="submit">Guardar nota <span aria-hidden="true">→</span></button>
    </form>
    <p class="history-empty" id="local-record-status" role="status" aria-live="polite">Cargando notas guardadas…</p>
    <ul class="local-record-list" id="local-record-list"></ul>
</section>
```

```js
const LOCAL_RECORD_DATABASE = 'cafe-de-barrio-notas';
const LOCAL_RECORD_STORE = 'notas';

function openLocalRecordDatabase() {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            reject(new Error('Este navegador no ofrece IndexedDB.'));
            return;
        }

        const request = indexedDB.open(LOCAL_RECORD_DATABASE, 1);

        request.addEventListener('upgradeneeded', () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(LOCAL_RECORD_STORE)) {
                database.createObjectStore(LOCAL_RECORD_STORE, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
            }
        });
        request.addEventListener('success', () => {
            request.result.addEventListener('versionchange', () => request.result.close());
            resolve(request.result);
        }, { once: true });
        request.addEventListener('error', () => {
            reject(request.error || new Error('No se pudo abrir la base de datos local.'));
        }, { once: true });
    });
}

async function runLocalRecordTransaction(mode, operation) {
    const database = await openLocalRecordDatabase();

    return new Promise((resolve, reject) => {
        let result;

        try {
            const transaction = database.transaction(LOCAL_RECORD_STORE, mode);
            const request = operation(transaction.objectStore(LOCAL_RECORD_STORE));

            if (request) {
                request.addEventListener('success', () => {
                    result = request.result;
                }, { once: true });
                request.addEventListener('error', () => {
                    reject(request.error || new Error('No se pudo completar la operación local.'));
                }, { once: true });
            }

            transaction.addEventListener('complete', () => {
                database.close();
                resolve(result);
            }, { once: true });
            transaction.addEventListener('error', () => {
                database.close();
                reject(transaction.error || new Error('La transacción local falló.'));
            }, { once: true });
            transaction.addEventListener('abort', () => {
                database.close();
                reject(transaction.error || new Error('La transacción local fue cancelada.'));
            }, { once: true });
        } catch (error) {
            database.close();
            reject(error);
        }
    });
}

function saveLocalRecord(record) {
    return runLocalRecordTransaction('readwrite', (store) => store.add(record));
}

function getLocalRecords() {
    return runLocalRecordTransaction('readonly', (store) => store.getAll());
}

function deleteLocalRecord(id) {
    return runLocalRecordTransaction('readwrite', (store) => store.delete(id));
}

const localRecordForm = document.querySelector('#local-record-form');
const localRecordTitle = document.querySelector('#local-record-title');
const localRecordDescription = document.querySelector('#local-record-description');
const localRecordSubmit = document.querySelector('#local-record-submit');
const localRecordStatus = document.querySelector('#local-record-status');
const localRecordList = document.querySelector('#local-record-list');

function renderLocalRecords(records) {
    records.sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
    localRecordList.replaceChildren();
    localRecordStatus.textContent = records.length
        ? `${records.length} ${records.length === 1 ? 'nota guardada' : 'notas guardadas'} en este dispositivo.`
        : 'Todavía no hay notas guardadas. Puedes agregarlas incluso sin conexión.';

    records.forEach((record) => {
        const item = document.createElement('li');
        item.className = 'local-record-card';

        const content = document.createElement('div');
        const title = document.createElement('h3');
        title.textContent = record.title;
        const description = document.createElement('p');
        description.textContent = record.description;
        const date = document.createElement('time');
        date.dateTime = record.createdAt;
        date.textContent = new Date(record.createdAt).toLocaleString('es-MX');
        content.append(title, description, date);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'local-record-delete';
        deleteButton.type = 'button';
        deleteButton.dataset.recordId = record.id;
        deleteButton.textContent = 'Eliminar';
        deleteButton.setAttribute('aria-label', `Eliminar nota: ${record.title}`);
        item.append(content, deleteButton);
        localRecordList.append(item);
    });
}

localRecordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    localRecordSubmit.disabled = true;
    localRecordStatus.textContent = 'Guardando nota en este dispositivo…';

    try {
        await saveLocalRecord({
            title: localRecordTitle.value.trim(),
            description: localRecordDescription.value.trim(),
            createdAt: new Date().toISOString(),
        });
        localRecordForm.reset();
        renderLocalRecords(await getLocalRecords());
    } catch (error) {
        console.error('No se pudo guardar la nota en IndexedDB:', error);
        localRecordStatus.textContent = `No se pudo guardar la nota: ${error.message}`;
    } finally {
        localRecordSubmit.disabled = false;
    }
});

localRecordList.addEventListener('click', async (event) => {
    const deleteButton = event.target.closest('[data-record-id]');
    if (!deleteButton || !localRecordList.contains(deleteButton)) return;

    deleteButton.disabled = true;

    try {
        await deleteLocalRecord(Number(deleteButton.dataset.recordId));
        renderLocalRecords(await getLocalRecords());
    } catch (error) {
        console.error('No se pudo eliminar la nota de IndexedDB:', error);
        localRecordStatus.textContent = `No se pudo eliminar la nota: ${error.message}`;
        deleteButton.disabled = false;
    }
});

getLocalRecords()
    .then(renderLocalRecords)
    .catch((error) => {
        console.error('No se pudieron consultar las notas de IndexedDB:', error);
        localRecordStatus.textContent = `No se pudieron cargar las notas: ${error.message}`;
    });
```

- [`cafeteria.js`](../../public/cafeteria.js)
- [`cafeteria.css`](../../public/cafeteria.css)
- [`welcome.blade.php`](../../resources/views/welcome.blade.php)

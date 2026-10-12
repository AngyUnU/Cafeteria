const DATABASE_NAME = 'cafe-de-barrio';
const STORE_NAME = 'orders';

function openOrdersDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, 1);

        request.addEventListener('upgradeneeded', () => {
            if (!request.result.objectStoreNames.contains(STORE_NAME)) {
                request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        });
        request.addEventListener('success', () => resolve(request.result), { once: true });
        request.addEventListener('error', () => reject(request.error), { once: true });
    });
}

async function saveConfirmedOrder(order) {
    const database = await openOrdersDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).put(order);
        transaction.addEventListener('complete', () => {
            database.close();
            resolve();
        }, { once: true });
        transaction.addEventListener('error', () => {
            database.close();
            reject(transaction.error);
        }, { once: true });
        transaction.addEventListener('abort', () => {
            database.close();
            reject(transaction.error || new Error('No se pudo guardar el pedido en IndexedDB.'));
        }, { once: true });
    });
}

async function getConfirmedOrders() {
    const database = await openOrdersDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readonly');
        const request = transaction.objectStore(STORE_NAME).getAll();
        request.addEventListener('success', () => resolve(request.result), { once: true });
        request.addEventListener('error', () => reject(request.error), { once: true });
        transaction.addEventListener('complete', () => database.close(), { once: true });
        transaction.addEventListener('abort', () => {
            database.close();
            reject(transaction.error || new Error('No se pudo leer el historial de IndexedDB.'));
        }, { once: true });
    });
}

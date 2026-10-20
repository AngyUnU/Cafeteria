```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Captura de medios</title>
</head>
<body>
    <button id="add-product" type="button">Agregar producto al carrito</button>
    <p id="message" role="status" aria-live="polite">Agrega un producto para activar la cámara.</p>
    <video id="video" autoplay playsinline muted hidden></video>
    <canvas id="photo" hidden></canvas>
    <div>
        <button id="start" type="button">Iniciar cámara</button>
        <button id="capture" type="button" disabled>Tomar fotografía</button>
        <button id="delete" type="button" hidden>Eliminar fotografía</button>
        <button id="stop" type="button" hidden>Apagar cámara</button>
    </div>

    <script>
        const message = document.querySelector('#message');
        const video = document.querySelector('#video');
        const canvas = document.querySelector('#photo');
        const addProductButton = document.querySelector('#add-product');
        const startButton = document.querySelector('#start');
        const captureButton = document.querySelector('#capture');
        const deleteButton = document.querySelector('#delete');
        const stopButton = document.querySelector('#stop');
        let cartHasProduct = false;
        let stream = null;

        function stopCamera() {
            stream?.getTracks().forEach((track) => track.stop());
            stream = null;
            video.srcObject = null;
            video.hidden = true;
            captureButton.disabled = true;
            stopButton.hidden = true;
        }

        addProductButton.addEventListener('click', () => {
            cartHasProduct = true;
            message.textContent = 'Producto agregado. Ya puedes usar la cámara.';
        });

        startButton.addEventListener('click', async () => {
            if (!cartHasProduct) {
                message.textContent = 'Agrega un producto al carrito antes de iniciar la cámara.';
                return;
            }

            if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
                message.textContent = 'La cámara requiere HTTPS o localhost y un navegador compatible.';
                return;
            }

            startButton.disabled = true;

            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: 'environment' } },
                    audio: false,
                });
                video.srcObject = stream;
                await video.play();
                video.hidden = false;
                captureButton.disabled = false;
                stopButton.hidden = false;
                message.textContent = 'Cámara activa. Toma tu fotografía.';
            } catch (error) {
                stopCamera();
                startButton.disabled = false;
                message.textContent = `No se pudo iniciar la cámara: ${error.message}`;
            }
        });

        captureButton.addEventListener('click', () => {
            if (!cartHasProduct || !stream || !video.videoWidth) {
                message.textContent = 'Agrega un producto y espera a que la cámara esté lista.';
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            canvas.hidden = false;
            deleteButton.hidden = false;
            message.textContent = 'Fotografía capturada.';
        });

        deleteButton.addEventListener('click', () => {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = 0;
            canvas.height = 0;
            canvas.hidden = true;
            deleteButton.hidden = true;
            message.textContent = 'Fotografía eliminada.';
        });

        stopButton.addEventListener('click', () => {
            stopCamera();
            startButton.disabled = false;
            message.textContent = 'Cámara apagada.';
        });

        window.addEventListener('pagehide', stopCamera);
    </script>
</body>
</html>
```

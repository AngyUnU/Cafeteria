<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f8f5ef">
    <meta name="description" content="Pide café de especialidad y algo rico para acompañar en Café de Barrio.">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Café de Barrio">
    <link rel="manifest" href="{{ asset('manifest.json') }}">
    <link rel="icon" href="{{ asset('icons/icon-192.png') }}" type="image/png">
    <link rel="apple-touch-icon" href="{{ asset('icons/icon-192.png') }}">
    <link rel="stylesheet" href="{{ asset('cafeteria.css') }}">
    <title>Café de Barrio — Tu pausa favorita</title>
</head>
<body>
    <div class="app-shell">
        <header class="topbar">
            <a class="brand" href="#inicio" aria-label="Café de Barrio, inicio">
                <span class="brand-mark" aria-hidden="true">☕</span>
                <span class="brand-name">café <strong>de barrio</strong></span>
            </a>
            <nav class="main-nav" aria-label="Navegación principal">
                <a class="nav-link active" href="#menu">Menú</a>
                <a class="nav-link" href="#nosotros">Nuestra historia</a>
                <a class="nav-link" href="#historial">Historial</a>
                <a class="nav-link" href="#ubicacion">Ubicación</a>
                <a class="nav-link" href="#notificaciones">Notificaciones</a>
            </nav>
            <div class="header-actions">
                <span class="open-status"><span class="status-dot"></span> Abierto hoy</span>
                <button class="install-button" id="install-button" type="button" hidden>Instalar app</button>
                <a class="cart-button" href="#pedido" aria-label="Ver pedido">
                    <span aria-hidden="true">🛍</span><span class="cart-label">Mi pedido</span>
                    <span class="cart-count" id="cart-count" aria-live="polite">0</span>
                </a>
            </div>
        </header>

        <main id="inicio">
            <section class="hero" aria-labelledby="hero-title">
                <div class="hero-copy">
                    <span class="eyebrow"><span class="eyebrow-line"></span> CAFÉ DE ESPECIALIDAD · HECHO CON CARIÑO</span>
                    <h1 id="hero-title">Un buen café<br>lo <em>cambia todo.</em></h1>
                    <p class="hero-description">Tu rincón favorito, ahora a un clic. Pide algo rico y lo preparamos al momento.</p>
                    <a class="primary-button" href="#menu">Explorar el menú <span aria-hidden="true">→</span></a>
                    <div class="hero-note"><span aria-hidden="true">✳</span> Café recién molido, todos los días</div>
                </div>
                <div class="hero-art" role="img" aria-label="Una taza de café caliente acompañada de granos de café">
                    <div class="art-sun"></div>
                    <span class="art-spark spark-one">✳</span><span class="art-spark spark-two">✦</span>
                    <div class="coffee-beans beans-one"></div><div class="coffee-beans beans-two"></div>
                    <div class="plate"><div class="cup"><div class="cup-coffee"></div><div class="cup-handle"></div><div class="cup-steam steam-one"></div><div class="cup-steam steam-two"></div><span class="cup-heart">♥</span></div></div>
                    <span class="art-caption">hecho para disfrutar</span>
                    <div class="art-sticker"><span>☕</span><small>BUEN<br>CAFÉ</small></div>
                </div>
            </section>

            <section class="menu-section" id="menu" aria-labelledby="menu-title">
                <div class="section-heading">
                    <div><span class="eyebrow">ALGO RICO TE ESTÁ ESPERANDO</span><h2 id="menu-title">Nuestro menú</h2></div>
                    <p>Preparado al momento,<br>con ingredientes de verdad.</p>
                </div>
                <div class="category-list" role="group" aria-label="Filtrar menú por categoría">
                    <button class="category-chip selected" type="button" data-category="todos">Todo el menú</button>
                    <button class="category-chip" type="button" data-category="cafe">☕ Cafecito</button>
                    <button class="category-chip" type="button" data-category="frio">🧊 Bebidas frías</button>
                    <button class="category-chip" type="button" data-category="comida">🥐 Para acompañar</button>
                </div>
                <div class="menu-grid" id="menu-grid">
                    <article class="menu-card" data-category="cafe">
                        <div class="product-art product-latte"><span>☕</span><span class="product-tag">FAVORITO</span></div>
                        <div class="product-info"><div><h3>Latte de la casa</h3><p>Espresso doble, leche cremosa y un toque de canela.</p></div><div class="product-bottom"><strong>$65</strong><button class="add-button" data-product-id="latte" data-name="Latte de la casa" data-price="65" aria-label="Agregar Latte de la casa al pedido">+</button></div></div>
                    </article>
                    <article class="menu-card" data-category="cafe">
                        <div class="product-art product-mocha"><span>🍫</span></div>
                        <div class="product-info"><div><h3>Mocha nube</h3><p>Chocolate artesanal, espresso y espuma suave.</p></div><div class="product-bottom"><strong>$72</strong><button class="add-button" data-product-id="mocha" data-name="Mocha nube" data-price="72" aria-label="Agregar Mocha nube al pedido">+</button></div></div>
                    </article>
                    <article class="menu-card" data-category="frio">
                        <div class="product-art product-cold"><span>🧋</span><span class="product-tag tag-cold">BIEN FRÍO</span></div>
                        <div class="product-info"><div><h3>Cold brew cítrico</h3><p>18 horas de extracción, naranja y mucho hielo.</p></div><div class="product-bottom"><strong>$68</strong><button class="add-button" data-product-id="cold-brew" data-name="Cold brew cítrico" data-price="68" aria-label="Agregar Cold brew cítrico al pedido">+</button></div></div>
                    </article>
                    <article class="menu-card" data-category="comida">
                        <div class="product-art product-croissant"><span>🥐</span><span class="product-tag tag-new">RECIÉN HORNEADO</span></div>
                        <div class="product-info"><div><h3>Croissant de mantequilla</h3><p>Hojaldrado, doradito y hecho cada mañana.</p></div><div class="product-bottom"><strong>$48</strong><button class="add-button" data-product-id="croissant" data-name="Croissant de mantequilla" data-price="48" aria-label="Agregar Croissant de mantequilla al pedido">+</button></div></div>
                    </article>
                    <article class="menu-card" data-category="comida">
                        <div class="product-art product-toast"><span>🥑</span></div>
                        <div class="product-info"><div><h3>Toast de aguacate</h3><p>Pan de masa madre, aguacate y semillas tostadas.</p></div><div class="product-bottom"><strong>$89</strong><button class="add-button" data-product-id="toast-aguacate" data-name="Toast de aguacate" data-price="89" aria-label="Agregar Toast de aguacate al pedido">+</button></div></div>
                    </article>
                    <article class="menu-card" data-category="frio">
                        <div class="product-art product-matcha"><span>🍵</span></div>
                        <div class="product-info"><div><h3>Matcha vainilla</h3><p>Matcha ceremonial batido con leche y vainilla.</p></div><div class="product-bottom"><strong>$76</strong><button class="add-button" data-product-id="matcha" data-name="Matcha vainilla" data-price="76" aria-label="Agregar Matcha vainilla al pedido">+</button></div></div>
                    </article>
                </div>
            </section>

            <section class="coffee-api-section history-section" id="ideas-cafeteras" aria-labelledby="coffee-api-title">
                <div class="section-heading">
                    <div><span class="eyebrow">RECETAS DESDE UNA API REMOTA</span><h2 id="coffee-api-title">Ideas cafeteras</h2></div>
                    <button class="coffee-api-refresh" id="coffee-api-refresh" type="button">Actualizar recetas</button>
                </div>
                <p class="history-empty" id="coffee-api-status" role="status" aria-live="polite">Cargando recetas…</p>
                <ul class="coffee-api-list" id="coffee-api-list" aria-live="polite"></ul>
            </section>

            <section class="order-section" id="pedido" aria-labelledby="order-title">
                <div class="order-copy"><span class="order-icon" aria-hidden="true">🛍</span><div><h2 id="order-title">Tu pedido</h2><p id="order-message">Todavía no agregas nada rico. ¡Elige algo del menú!</p></div></div>
                <div class="order-total"><span>Total</span><strong id="order-total">$0</strong><button class="checkout-button" id="checkout-button" type="button" disabled>Hacer mi pedido <span aria-hidden="true">→</span></button></div>
            </section>
            <section class="history-section" id="historial" aria-labelledby="history-title">
                <div class="section-heading">
                    <div><span class="eyebrow">TUS PEDIDOS EN ESTE NAVEGADOR</span><h2 id="history-title">Historial de pedidos</h2></div>
                    <p>Guardado en IndexedDB<br>y en la base de datos del café.</p>
                </div>
                <p class="history-empty" id="history-empty">Todavía no hay pedidos guardados en este navegador.</p>
                <ol class="order-history" id="order-history" aria-live="polite"></ol>
            </section>
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
            <section class="location-section" id="ubicacion" aria-labelledby="location-title">
                <div class="section-heading">
                    <div><span class="eyebrow">TU UBICACIÓN, SOLO SI TÚ LO PERMITES</span><h2 id="location-title">Permisos y geolocalización</h2></div>
                    <p>Consulta el permiso y obtén<br>tus coordenadas actuales.</p>
                </div>
                <div class="location-card">
                    <div class="permission-summary">
                        <span class="permission-label">Permiso de ubicación</span>
                        <strong id="location-permission" role="status" aria-live="polite">Consultando permiso…</strong>
                    </div>
                    <p class="location-description" id="location-message" role="status" aria-live="polite">Al pulsar el botón, el navegador puede pedir permiso. Selecciona Permitir para compartir tu ubicación.</p>
                    <button class="checkout-button location-button" id="location-button" type="button">Compartir mi ubicación <span aria-hidden="true">→</span></button>
                    <div class="coordinates" id="location-coordinates" hidden>
                        <p>Latitud: <strong id="location-latitude"></strong></p>
                        <p>Longitud: <strong id="location-longitude"></strong></p>
                    </div>
                    <a class="map-link" id="location-map" href="#" target="_blank" rel="noopener noreferrer" hidden>Abrir ubicación en OpenStreetMap ↗</a>
                </div>
            </section>
            <section class="location-section" id="notificaciones" aria-labelledby="notification-title">
                <div class="section-heading">
                    <div><span class="eyebrow">AVISOS DE CAFÉ DE BARRIO</span><h2 id="notification-title">Notificaciones locales</h2></div>
                    <p>Recibe un aviso personalizado<br>desde el Service Worker.</p>
                </div>
                <div class="location-card">
                    <p class="location-description" id="notification-message" role="status" aria-live="polite">Pulsa el botón para solicitar permiso y mostrar una notificación de prueba.</p>
                    <button class="checkout-button location-button" id="notification-button" type="button">Activar notificaciones <span aria-hidden="true">→</span></button>
                </div>
            </section>
            <section class="story-section" id="nosotros"><span class="eyebrow">UN RINCÓN PARA QUEDARSE</span><p>Creemos que los días se disfrutan más <em>con un buen café</em> y buena compañía.</p></section>
        </main>

        <footer class="footer"><a class="brand footer-brand" href="#inicio"><span class="brand-mark" aria-hidden="true">☕</span><span class="brand-name">café <strong>de barrio</strong></span></a><span>Hecho con cariño y mucho café. © 2026</span><a href="#menu">Volver al menú ↑</a></footer>
        <div class="toast" id="toast" role="status" aria-live="polite"></div>
        <div class="offline-banner" id="offline-banner" role="status" hidden>Estás sin conexión. Puedes seguir viendo el menú guardado.</div>
    </div>
    <script src="{{ asset('cafeteria.js') }}" defer></script>
</body>
</html>

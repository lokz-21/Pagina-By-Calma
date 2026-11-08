/* ==========================================================================
   BY CALMA ESTÉTICA — Interacciones
   JavaScript puro, sin librerías ni dependencias externas.

   >>> DATOS DE CONTACTO: editá el objeto CONFIG de abajo y se actualizan
       todos los enlaces del sitio de una sola vez.
   ========================================================================== */

const CONFIG = {
  // Número de WhatsApp en formato internacional, sin "+" ni espacios.
  // Es el mismo al que apunta el link corto wa.link/yxgf4b (se verificó la
  // redirección). Ir directo a wa.me ahorra un salto y no depende de un
  // servicio de terceros: si wa.link cambiara o cayera, los botones seguirían.
  whatsappNumero: "541144473467",

  // Link corto de respaldo: se usa si whatsappNumero queda vacío.
  whatsapp: "https://wa.link/yxgf4b",

  // Lo primero que le llega a la doctora, según desde dónde se tocó el botón.
  // Todos arrancan con "Vi la web": así, mirando el chat, se sabe qué consultas
  // vienen del sitio y de qué sección, sin necesidad de ninguna herramienta.
  // Claves = id de la sección donde está el botón.
  whatsappMensajes: {
    inicio: "Hola! Vi la web de By Calma Estética y quiero reservar una consulta.",
    tratamientos: "Hola! Vi la web de By Calma Estética y quiero saber qué tratamiento me conviene.",
    faq: "Hola! Vi la web de By Calma Estética y tengo una consulta.",
    contacto: "Hola! Vi la web de By Calma Estética y quiero pedir un turno.",
    menu: "Hola! Vi la web de By Calma Estética y quiero pedir un turno.",
    defecto: "Hola! Vi la web de By Calma Estética y quiero consultar.",
  },

  // Perfil de Instagram
  instagram: "https://www.instagram.com/by.calmaestetica/",

  // Google Analytics 4: pegá acá el ID de medición ("G-XXXXXXXXXX").
  // Mientras esté vacío no se carga nada ni se envía ningún dato.
  ga4: "",
};

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ------------------------------------------------------------------
     Medición (Google Analytics 4)
     Apagada mientras CONFIG.ga4 esté vacío. track() siempre es seguro de
     llamar: si no hay analítica, no hace nada.
     ------------------------------------------------------------------ */
  if (CONFIG.ga4) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", CONFIG.ga4);
    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src =
      "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(CONFIG.ga4);
    document.head.appendChild(gaScript);
  }

  function track(nombre, parametros) {
    if (typeof window.gtag !== "function") return;
    // "beacon" asegura que el evento salga aunque el botón abra otra pestaña
    window.gtag("event", nombre, Object.assign({ transport_type: "beacon" }, parametros));
  }

  /* ------------------------------------------------------------------
     Enlaces de contacto — un solo lugar para actualizarlos
     ------------------------------------------------------------------ */
  // ¿Desde qué parte de la página se tocó? Sirve para el mensaje de WhatsApp
  // y para saber, en las estadísticas, qué botón trae más consultas.
  function seccionDe(el) {
    if (el.closest("#navMobile")) return "menu";
    if (el.closest("footer")) return "pie";
    const seccion = el.closest("section[id]");
    return seccion ? seccion.id : "defecto";
  }

  function linkWhatsApp(seccion) {
    if (!CONFIG.whatsappNumero) return CONFIG.whatsapp;
    const texto =
      CONFIG.whatsappMensajes[seccion] || CONFIG.whatsappMensajes.defecto;
    return (
      "https://wa.me/" + CONFIG.whatsappNumero + "?text=" + encodeURIComponent(texto)
    );
  }

  document.querySelectorAll("[data-wa]").forEach((el) => {
    const seccion = seccionDe(el);
    el.dataset.seccion = seccion;
    el.href = linkWhatsApp(seccion);
  });

  document.querySelectorAll("[data-ig]").forEach((el) => {
    el.dataset.seccion = seccionDe(el);
    el.href = CONFIG.instagram;
  });

  // Un solo oyente para todos los botones de contacto
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-wa], a[data-ig], a[data-track]");
    if (!link) return;
    if (link.dataset.track) {
      // Links con evento propio (por ejemplo, "resenas_google" en el hero)
      track(link.dataset.track);
    } else if (link.hasAttribute("data-wa")) {
      // "generate_lead" es el evento estándar de GA4 para una consulta nueva
      track("generate_lead", { method: "whatsapp", seccion: link.dataset.seccion });
    } else {
      track("click_instagram", { seccion: link.dataset.seccion });
    }
  });

  /* ------------------------------------------------------------------
     Año actual en el footer
     ------------------------------------------------------------------ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     Entrada del hero: se dispara en el primer cuadro después de pintar,
     para que la secuencia empiece con la página ya compuesta.
     ------------------------------------------------------------------ */
  const heroEl = document.getElementById("inicio");
  if (heroEl) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => heroEl.classList.add("is-ready"));
    });
  }

  /* ------------------------------------------------------------------
     Header: fondo sólido al salir del hero
     ------------------------------------------------------------------ */
  const header = document.getElementById("siteHeader");
  const hero = document.getElementById("inicio");

  if (header && hero && "IntersectionObserver" in window) {
    /* El header se vuelve opaco cuando la FOTO del hero deja de cubrir su
       franja superior. Se observa la foto y no la sección entera porque en
       celular el hero sigue hacia abajo con fondo claro: si miráramos la
       sección, el logo blanco quedaría invisible sobre el beige. En escritorio
       la foto está en position:absolute e inset:0, o sea que mide exactamente
       lo mismo que el hero y el comportamiento no cambia. */
    const heroWatchTarget = hero.querySelector(".hero-media") || hero;
    const heroWatcher = new IntersectionObserver(
      ([entry]) => header.classList.toggle("is-stuck", !entry.isIntersecting),
      { rootMargin: "-76px 0px 0px 0px", threshold: 0 }
    );
    heroWatcher.observe(heroWatchTarget);
  } else if (header) {
    // Fallback para navegadores sin IntersectionObserver
    const onScroll = () =>
      header.classList.toggle("is-stuck", window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------
     Menú móvil
     ------------------------------------------------------------------ */
  const navToggle = document.getElementById("navToggle");
  const navClose = document.getElementById("navClose");
  const navMobile = document.getElementById("navMobile");

  function setMenu(open) {
    if (!navMobile || !navToggle) return;
    navMobile.dataset.open = String(open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("is-locked", open);
    if (open && navClose) navClose.focus();
    else if (!open) navToggle.focus();
  }

  if (navToggle) navToggle.addEventListener("click", () => setMenu(true));
  if (navClose) navClose.addEventListener("click", () => setMenu(false));

  if (navMobile) {
    // Al elegir una sección, cerrar el menú
    navMobile.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });
  }

  /* ------------------------------------------------------------------
     FAQ: acordeón (permite varias respuestas abiertas a la vez)
     ------------------------------------------------------------------ */
  document.querySelectorAll(".faq-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".faq-item");
      if (!item) return;
      const open = item.dataset.open !== "true";
      item.dataset.open = String(open);
      trigger.setAttribute("aria-expanded", String(open));
      if (open) track("faq_abierta", { pregunta: trigger.textContent.trim().slice(0, 80) });
    });
  });

  /* ------------------------------------------------------------------
     Antes y después
     ------------------------------------------------------------------ */
  const resultCards = document.querySelectorAll(".result-card");

  /* ------------------------------------------------------------------
     Lightbox de la galería
     ------------------------------------------------------------------ */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxFigura = document.getElementById("lightboxFigura");
  let lastFocused = null;

  function openLightbox(src, caption, alt, esAntesDespues) {
    if (!lightbox || !lightboxImg) return;
    lastFocused = document.activeElement;
    // Las etiquetas Antes/Después solo aplican a las composiciones mitad y mitad
    if (lightboxFigura) lightboxFigura.dataset.ab = String(!!esAntesDespues);
    lightboxImg.src = src;
    lightboxImg.alt = alt || caption || "";
    if (lightboxCaption) lightboxCaption.textContent = caption || "";
    lightbox.dataset.open = "true";
    document.body.classList.add("is-locked");
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.dataset.open = "false";
    document.body.classList.remove("is-locked");
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  }

  resultCards.forEach((card) => {
    card.addEventListener("click", () => {
      const img = card.querySelector("img");
      track("ver_resultado", { caso: (card.dataset.caption || "").slice(0, 80) });
      openLightbox(
        card.dataset.src,
        card.dataset.caption,
        img ? img.alt : "",
        card.hasAttribute("data-ab")
      );
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);

  if (lightbox) {
    // Click en el fondo (no en la imagen) cierra
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  /* ------------------------------------------------------------------
     Escape cierra cualquier overlay abierto
     ------------------------------------------------------------------ */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (lightbox && lightbox.dataset.open === "true") closeLightbox();
    else if (navMobile && navMobile.dataset.open === "true") setMenu(false);
  });

  /* ------------------------------------------------------------------
     Navegación: resalta la sección visible
     ------------------------------------------------------------------ */
  const navLinks = document.querySelectorAll(".nav-desktop a");
  const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const sectionWatcher = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            const isCurrent =
              link.getAttribute("href") === "#" + entry.target.id;
            if (isCurrent) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-50% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach((section) => sectionWatcher.observe(section));
  }

  /* ------------------------------------------------------------------
     Contadores del hero (+5 años, +200 pacientes)

     El número final ya está escrito en el HTML. Acá se lo lleva a cero y se
     lo hace subir; si el visitante pidió menos animaciones en su sistema, se
     deja el valor final tal cual.
     ------------------------------------------------------------------ */
  const counters = document.querySelectorAll("[data-count]");

  function animarContador(el) {
    const destino = parseInt(el.dataset.count, 10);
    const prefijo = el.dataset.countPrefix || "";
    if (!Number.isFinite(destino)) return;

    const duracion = 2000;
    // Espera opcional: en el hero, los números arrancan recién cuando el
    // bloque terminó de aparecer, para que el conteo se vea entero.
    const retraso = parseInt(el.dataset.countDelay, 10) || 0;
    const inicio = performance.now() + retraso;

    function paso(ahora) {
      if (ahora < inicio) return requestAnimationFrame(paso);
      const t = Math.min((ahora - inicio) / duracion, 1);
      // easeOutCubic: reparte el conteo a lo largo de toda la animación.
      // Con curvas más agresivas (easeOutExpo) el número llega al final en el
      // primer tercio y el efecto no se llega a percibir.
      const p = 1 - Math.pow(1 - t, 3);
      el.textContent = prefijo + Math.round(destino * p).toLocaleString("es-AR");
      if (t < 1) requestAnimationFrame(paso);
    }

    el.textContent = prefijo + "0";
    requestAnimationFrame(paso);
  }

  if (counters.length && !prefersReducedMotion && "IntersectionObserver" in window) {
    const contadorWatcher = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animarContador(entry.target);
          observer.unobserve(entry.target); // se anima una sola vez
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => contadorWatcher.observe(el));
  }

  /* ------------------------------------------------------------------
     Animación de entrada al hacer scroll
     Si el sistema pide movimiento reducido, se muestra todo directamente.
     ------------------------------------------------------------------ */
  const revealItems = document.querySelectorAll("[data-reveal]");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealWatcher = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    revealItems.forEach((el) => revealWatcher.observe(el));
  }
})();

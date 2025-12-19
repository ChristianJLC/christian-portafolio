// ====== Utilidades básicas ======
const SECCIONES = ["sobremi", "proyectos", "skills", "contacto"];
const DEFAULT_SECTION = "sobremi";

function isSectionId(id) {
    return SECCIONES.includes(id);
}

function $(sel, parent = document) {
    return parent.querySelector(sel);
}
function $all(sel, parent = document) {
    return [...parent.querySelectorAll(sel)];
}

// ====== Mostrar/Ocultar secciones (tabs) ======
function mostrarSeccion(id, opts = {}) {
    const { scroll = true, updateHash = true } = opts;
    if (!isSectionId(id)) return;

    // Toggle de visibilidad
    SECCIONES.forEach((sec) => {
        const el = document.getElementById(sec);
        if (el) el.classList.toggle("activo", sec === id);
    });

    // Actualiza estado visual del menú de tabs (la barra con SOBRE MI / PROYECTOS / ...)
    actualizarTabsActivos(id);

    // Scroll suave a la sección visible
    const destino = document.getElementById(id);
    if (scroll && destino && destino.classList.contains("activo")) {
        // pequeño delay para que el display:block tome efecto
        setTimeout(() => {
            destino.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
    }

    // Actualiza hash sin recargar página
    if (updateHash) {
        history.pushState({ section: id }, "", `#${id}`);
    }
}

function actualizarTabsActivos(id) {
    // quita estado anterior
    $all(".secciones__item, .secciones__item-seleccionado").forEach((item) => {
        item.classList.remove("secciones__item-seleccionado");
        item.classList.add("secciones__item");
    });

    // marca activo el que corresponda en la barra de secciones (si existe)
    const enlace = document.querySelector(`.secciones__contenedor a[href="#${id}"]`);
    if (enlace && enlace.parentElement) {
        enlace.parentElement.classList.add("secciones__item-seleccionado");
        enlace.parentElement.classList.remove("secciones__item");
    }
}

// ====== Enlaces internos con hash ======
function prepararNavegacionInterna() {
    // Cualquier <a href="#..."> que apunte a una de nuestras secciones
    $all('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (e) => {
            const destino = link.getAttribute("href").slice(1); // sin "#"
            if (isSectionId(destino)) {
                e.preventDefault();
                mostrarSeccion(destino, { scroll: true, updateHash: true });
            }
            // Si no es una sección (ej. #descargarCV inexistente), dejamos el comportamiento por defecto.
        });
    });
}

// ====== Botón "Contáctame" ======
function prepararBotonContactame() {
    const btnContactame = document.getElementById("btn-contactame");
    if (!btnContactame) return;

    btnContactame.addEventListener("click", () => {
        mostrarSeccion("contacto", { scroll: true, updateHash: true });

        // También marca el tab de CONTACTO como seleccionado
        actualizarTabsActivos("contacto");
    });
}

// ====== EmailJS (envío del formulario) ======
function prepararFormularioEmail() {
    const form = document.getElementById("form");
    const btn = document.getElementById("button");
    if (!form || !btn) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Deshabilita el botón mientras enviamos
        const prevLabel = btn.value || btn.textContent || "Enviar";
        if (btn.tagName === "INPUT") btn.value = "Enviando...";
        else btn.textContent = "Enviando...";
        btn.disabled = true;

        try {
            // Asegúrate de tener estas IDs bien configuradas en EmailJS
            const serviceID = "default_service";
            const templateID = "template_mnr7irh";

            await emailjs.sendForm(serviceID, templateID, form);

            // Éxito
            alert("¡Enviado correctamente!");
            form.reset();
        } catch (err) {
            // Error
            console.error(err);
            alert("Ocurrió un error al enviar. Intenta nuevamente.");
        } finally {
            if (btn.tagName === "INPUT") btn.value = prevLabel;
            else btn.textContent = prevLabel;
            btn.disabled = false;
        }
    });
}

// ====== Cargar sección desde hash (incluye back/forward del navegador) ======
function iniciarSeccionInicial() {
    const hash = (location.hash || "").slice(1);
    const inicial = isSectionId(hash) ? hash : DEFAULT_SECTION;
    mostrarSeccion(inicial, { scroll: false, updateHash: false });
}

function escucharHistorial() {
    // Soporta botón atrás/adelante del navegador
    window.addEventListener("popstate", (e) => {
        const section = e.state?.section || (location.hash || "").slice(1) || DEFAULT_SECTION;
        if (isSectionId(section)) {
            // Al navegar en historial, no hacemos scroll (navegador ya posiciona)
            mostrarSeccion(section, { scroll: false, updateHash: false });
        }
    });
}

// ====== Init ======
document.addEventListener("DOMContentLoaded", () => {
    // Marca que JS está activo (para CSS progressive enhancement)
    document.body.classList.add("js");

    prepararNavegacionInterna();
    prepararBotonContactame();
    prepararFormularioEmail();
    iniciarSeccionInicial();
    escucharHistorial();
});




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

function mostrarSeccion(id, opts = {}) {
    const { scroll = true, updateHash = true } = opts;
    if (!isSectionId(id)) return;
    SECCIONES.forEach((sec) => {
        const el = document.getElementById(sec);
        if (el) el.classList.toggle("activo", sec === id);
    });

    actualizarTabsActivos(id);

    const destino = document.getElementById(id);
    if (scroll && destino && destino.classList.contains("activo")) {
        setTimeout(() => {
            destino.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
    }
    if (updateHash) {
        history.pushState({ section: id }, "", `#${id}`);
    }
}

function actualizarTabsActivos(id) {
    $all(".secciones__item, .secciones__item-seleccionado").forEach((item) => {
        item.classList.remove("secciones__item-seleccionado");
        item.classList.add("secciones__item");
    });

    const enlace = document.querySelector(`.secciones__contenedor a[href="#${id}"]`);
    if (enlace && enlace.parentElement) {
        enlace.parentElement.classList.add("secciones__item-seleccionado");
        enlace.parentElement.classList.remove("secciones__item");
    }
}

function prepararNavegacionInterna() {
    $all('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (e) => {
            const destino = link.getAttribute("href").slice(1); // sin "#"
            if (isSectionId(destino)) {
                e.preventDefault();
                mostrarSeccion(destino, { scroll: true, updateHash: true });
            }
        });
    });
}

function prepararBotonContactame() {
    const btnContactame = document.getElementById("btn-contactame");
    if (!btnContactame) return;

    btnContactame.addEventListener("click", () => {
        mostrarSeccion("contacto", { scroll: true, updateHash: true });

        actualizarTabsActivos("contacto");
    });
}

function prepararFormularioEmail() {
    const form = document.getElementById("form");
    const btn = document.getElementById("button");
    if (!form || !btn) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const prevLabel = btn.value || btn.textContent || "Enviar";
        if (btn.tagName === "INPUT") btn.value = "Enviando...";
        else btn.textContent = "Enviando...";
        btn.disabled = true;

        try {
            const serviceID = "default_service";
            const templateID = "template_mnr7irh";

            await emailjs.sendForm(serviceID, templateID, form);

            alert("¡Enviado correctamente!");
            form.reset();
        } catch (err) {
            console.error(err);
            alert("Ocurrió un error al enviar. Intenta nuevamente.");
        } finally {
            if (btn.tagName === "INPUT") btn.value = prevLabel;
            else btn.textContent = prevLabel;
            btn.disabled = false;
        }
    });
}

function iniciarSeccionInicial() {
    const hash = (location.hash || "").slice(1);
    const inicial = isSectionId(hash) ? hash : DEFAULT_SECTION;
    mostrarSeccion(inicial, { scroll: false, updateHash: false });
}

function escucharHistorial() {
    window.addEventListener("popstate", (e) => {
        const section = e.state?.section || (location.hash || "").slice(1) || DEFAULT_SECTION;
        if (isSectionId(section)) {
            mostrarSeccion(section, { scroll: false, updateHash: false });
        }
    });
}

function prepararModales() {
    let activeModal = null;
    let currentIndex = 0;
    let images = [];
    let timer = null;
    const AUTOPLAY_MS = 4000;

    function stopAutoplay() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    function startAutoplay(modal) {
        stopAutoplay();
        if (images.length <= 1) return;

        timer = setInterval(() => {
            if (activeModal !== modal) return;
            setImage(modal, currentIndex + 1);
        }, AUTOPLAY_MS);
    }

    function setImage(modal, index) {
        const imgEl = modal.querySelector(".carousel__img");
        if (!imgEl || images.length === 0) return;

        const nextIndex = (index + images.length) % images.length;

        imgEl.classList.add("fade-out");

        setTimeout(() => {
            currentIndex = nextIndex;
            imgEl.src = images[currentIndex];

            const dots = modal.querySelectorAll(".carousel__dot");
            dots.forEach((d, i) => d.classList.toggle("activo", i === currentIndex));

            imgEl.classList.remove("fade-out");
        }, 350); 
    }


    function renderDots(modal) {
        const dotsWrap = modal.querySelector(".carousel__dots");
        if (!dotsWrap) return;

        if (images.length <= 1) {
            dotsWrap.innerHTML = "";
            return;
        }

        dotsWrap.innerHTML = images
            .map((_, i) =>
                `<button class="carousel__dot ${i === 0 ? "activo" : ""}" type="button" aria-label="Ir a imagen ${i + 1}"></button>`
            )
            .join("");

        dotsWrap.querySelectorAll(".carousel__dot").forEach((dot, i) => {
            dot.addEventListener("click", () => {
                setImage(modal, i);
                startAutoplay(modal);
            });
        });
    }

    function openModal(modal, imgs) {
        activeModal = modal;
        images = imgs;
        currentIndex = 0;

        renderDots(modal);
        setImage(modal, 0);

        modal.classList.add("activo");
        document.body.style.overflow = "hidden";

        startAutoplay(modal);
    }

    function closeModal(modal) {
        stopAutoplay();

        modal.classList.remove("activo");
        document.body.style.overflow = "";

        if (activeModal === modal) {
            activeModal = null;
            images = [];
            currentIndex = 0;
        }
    }

    document.querySelectorAll(".proyecto").forEach((card) => {
        card.addEventListener("click", () => {
            const modalId = card.dataset.modal;
            const modal = document.getElementById(modalId);
            if (!modal) return;

            const raw = (card.dataset.images || "").trim();
            const imgs = raw
                ? raw.split("|").map((s) => s.trim()).filter(Boolean)
                : [];

            if (imgs.length === 0) {
                const fallback = modal.querySelector(".carousel__img")?.getAttribute("src");
                if (fallback) imgs.push(fallback);
            }

            openModal(modal, imgs);
        });
    });

    document.querySelectorAll(".modal").forEach((modal) => {
        const overlay = modal.querySelector(".modal__overlay");
        const closeBtn = modal.querySelector(".modal__close");
        const prevBtn = modal.querySelector(".carousel__prev");
        const nextBtn = modal.querySelector(".carousel__next");

        overlay?.addEventListener("click", () => closeModal(modal));
        closeBtn?.addEventListener("click", () => closeModal(modal));

        prevBtn?.addEventListener("click", (e) => {
            e.stopPropagation();
            if (activeModal !== modal) return;
            setImage(modal, currentIndex - 1);
            startAutoplay(modal);
        });

        nextBtn?.addEventListener("click", (e) => {
            e.stopPropagation();
            if (activeModal !== modal) return;
            setImage(modal, currentIndex + 1);
            startAutoplay(modal);
        });
    });

    document.addEventListener("keydown", (e) => {
        if (!activeModal) return;

        if (e.key === "Escape") closeModal(activeModal);
        if (e.key === "ArrowLeft") { setImage(activeModal, currentIndex - 1); startAutoplay(activeModal); }
        if (e.key === "ArrowRight") { setImage(activeModal, currentIndex + 1); startAutoplay(activeModal); }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("js");

    prepararNavegacionInterna();
    prepararBotonContactame();
    prepararFormularioEmail();
    iniciarSeccionInicial();
    escucharHistorial();
    prepararModales()
});
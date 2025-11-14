// ========================================
// TELARES PAULINA CHISCAO - JAVASCRIPT
// ========================================

// ========== CONFIGURACIÓN ==========
const ADMIN_PASSWORD = 'Paulina2025';
let isLoggedIn = false;

// ========== MENÚ RESPONSIVE ==========
function toggleMenu() {
    const menu = document.getElementById('navMenu');
    menu.classList.toggle('active');
}

// Cerrar menú al hacer clic en un enlace (móvil)
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                document.getElementById('navMenu').classList.remove('active');
            }
        });
    });

    // Inicializar sistema de visitas
    initVisitSystem();
});

// ========== SISTEMA DE VISITAS CON GOOGLE APPS SCRIPT ==========
// Contador global usando Google Sheets como base de datos
// Las visitas se registran en: https://docs.google.com (tu hoja de cálculo)
const VISIT_API = 'https://script.google.com/macros/s/AKfycbyEJj1qMk5dsH-5xHrDsAYwci5tUOhCssdS1I6O5g6YvjbcPBDupX9N3RyX1-w2fScb/exec';

async function initVisitSystem() {
    try {
        // Registrar visita única por sesión
        const sessionVisited = sessionStorage.getItem('visited');
        
        if (!sessionVisited) {
            await registerVisit();
            sessionStorage.setItem('visited', 'true');
        }
        
        // Registrar visita a la página inicial
        await registerPageVisit('Inicio');
    } catch (error) {
        console.error('Error al inicializar sistema de visitas:', error);
    }
}

// Registrar visita de usuario único
async function registerVisit() {
    try {
        // Guardar localmente para historial
        let localVisits = JSON.parse(localStorage.getItem('telares_local_visits') || '[]');
        const visit = {
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('es-CL'),
            time: new Date().toLocaleTimeString('es-CL')
        };
        localVisits.push(visit);
        localStorage.setItem('telares_local_visits', JSON.stringify(localVisits));
        
        // Registrar en servidor (Google Apps Script)
        if (VISIT_API !== 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI') {
            try {
                const response = await fetch(VISIT_API + '?action=addVisit', {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'visit',
                        date: visit.date,
                        time: visit.time,
                        timestamp: visit.timestamp
                    })
                });
                console.log('✅ Visita registrada globalmente');
            } catch (error) {
                console.log('ℹ️ Visita guardada solo localmente');
            }
        }
    } catch (error) {
        console.error('❌ Error al registrar visita:', error);
    }
}

// Registrar visita a página específica
async function registerPageVisit(pageName) {
    try {
        // Guardar localmente
        let localPageVisits = JSON.parse(localStorage.getItem('telares_local_page_visits') || '[]');
        const visit = {
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('es-CL'),
            time: new Date().toLocaleTimeString('es-CL'),
            page: pageName
        };
        localPageVisits.push(visit);
        localStorage.setItem('telares_local_page_visits', JSON.stringify(localPageVisits));
        
        // Registrar en servidor
        if (VISIT_API !== 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI') {
            try {
                await fetch(VISIT_API + '?action=addPageVisit', {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'page',
                        page: pageName,
                        date: visit.date,
                        time: visit.time,
                        timestamp: visit.timestamp
                    })
                });
                console.log(`📄 Página ${pageName} registrada`);
            } catch (error) {
                // Silenciar error
            }
        }
    } catch (error) {
        console.error(`❌ Error al registrar visita a ${pageName}:`, error);
    }
}

// Caché para evitar demasiadas peticiones
let statsCache = {
    data: null,
    timestamp: 0,
    ttl: 30000 // 30 segundos de caché
};

// Actualizar estadísticas en el panel admin
async function updateVisitStats() {
    try {
        // Obtener visitas locales
        let localVisits = JSON.parse(localStorage.getItem('telares_local_visits') || '[]');
        let localPageVisits = JSON.parse(localStorage.getItem('telares_local_page_visits') || '[]');
        
        // Intentar obtener contador total desde servidor
        let totalVisits = localVisits.length;
        let useAPI = false;
        
        // Usar caché si está disponible y es reciente
        const now = Date.now();
        if (statsCache.data && (now - statsCache.timestamp) < statsCache.ttl) {
            totalVisits = statsCache.data.totalVisits || localVisits.length;
            useAPI = true;
            console.log('📦 Usando estadísticas en caché');
        } else {
        
            // Obtener datos del servidor si está configurado
            if (VISIT_API !== 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI') {
                try {
                    const response = await fetch(VISIT_API + '?action=getStats', {
                        method: 'GET',
                        mode: 'cors',
                        cache: 'force-cache'
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    if (data && data.totalVisits !== undefined) {
                        totalVisits = data.totalVisits;
                        useAPI = true;
                        // Guardar en caché
                        statsCache.data = { totalVisits: data.totalVisits };
                        statsCache.timestamp = now;
                    }
                } catch (error) {
                    console.log('ℹ️ Usando datos locales:', error.message);
                    // Si hay error 429, usar caché antigua si existe
                    if (statsCache.data) {
                        totalVisits = statsCache.data.totalVisits;
                        useAPI = true;
                    }
                }
            }
        }
        
        // Calcular visitas de hoy (local)
        const today = new Date().toLocaleDateString('es-CL');
        const todayVisits = localVisits.filter(v => v.date === today).length;
        
        // Actualizar números principales
        document.getElementById('totalVisits').textContent = totalVisits;
        document.getElementById('todayVisits').textContent = todayVisits;
        document.getElementById('currentDate').textContent = today;
        
        // Actualizar lista de visitas
        const visitList = document.getElementById('visitList');
        visitList.innerHTML = '';
        
        // Obtener estadísticas de cada página
        const pages = ['Inicio', 'Tienda', 'Productos', 'Catalogo', 'Contacto', 'Ubicacion', 'Galeria'];
        const titulo = useAPI ? '📊 Visitas por Sección (Total Global):' : '📊 Visitas por Sección (Local):';
        visitList.innerHTML += `<h4 style="color: #667eea; margin-bottom: 15px;">${titulo}</h4>`;
        
        if (useAPI && statsCache.data && statsCache.data.pageStats) {
            // Usar pageStats del caché
            pages.forEach(page => {
                const count = statsCache.data.pageStats[page] || 0;
                const item = document.createElement('div');
                item.className = 'visit-item';
                item.style.background = 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)';
                item.innerHTML = `
                    <strong>${page}</strong>
                    <div style="font-size: 2rem; font-weight: bold; color: #667eea;">${count}</div>
                    <small>visitas totales</small>
                `;
                visitList.appendChild(item);
            });
        } else if (useAPI) {
            // Obtener desde servidor solo si no hay caché
            try {
                const response = await fetch(VISIT_API + '?action=getPageStats', {
                    method: 'GET',
                    mode: 'cors',
                    cache: 'force-cache'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data && data.pageStats) {
                    // Guardar en caché
                    if (statsCache.data) {
                        statsCache.data.pageStats = data.pageStats;
                    } else {
                        statsCache.data = { pageStats: data.pageStats };
                    }
                    
                    pages.forEach(page => {
                        const count = data.pageStats[page] || 0;
                        const item = document.createElement('div');
                        item.className = 'visit-item';
                        item.style.background = 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)';
                        item.innerHTML = `
                            <strong>${page}</strong>
                            <div style="font-size: 2rem; font-weight: bold; color: #667eea;">${count}</div>
                            <small>visitas totales</small>
                        `;
                        visitList.appendChild(item);
                    });
                }
            } catch (error) {
                console.log('ℹ️ Error obteniendo estadísticas de páginas:', error.message);
                useAPI = false;
            }
        }
        
        if (!useAPI) {
            // Usar estadísticas locales
            const pageStats = {};
            localPageVisits.forEach(v => {
                pageStats[v.page] = (pageStats[v.page] || 0) + 1;
            });
            
            pages.forEach(page => {
                const count = pageStats[page] || 0;
                const item = document.createElement('div');
                item.className = 'visit-item';
                item.style.background = 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)';
                item.innerHTML = `
                    <strong>${page}</strong>
                    <div style="font-size: 2rem; font-weight: bold; color: #667eea;">${count}</div>
                    <small>visitas locales</small>
                `;
                visitList.appendChild(item);
            });
        }

        // Mostrar últimas visitas locales
        if (localPageVisits.length > 0) {
            visitList.innerHTML += '<h4 style="color: #667eea; margin: 25px 0 15px 0;">🕒 Últimas Visitas (Locales):</h4>';
            const recentPageVisits = localPageVisits.slice(-20).reverse();
            recentPageVisits.forEach(visit => {
                const item = document.createElement('div');
                item.className = 'visit-item';
                item.innerHTML = `
                    <strong>${visit.page}</strong> - ${visit.date} a las ${visit.time}
                `;
                visitList.appendChild(item);
            });
        }

        if (localVisits.length > 0) {
            visitList.innerHTML += '<h4 style="color: #667eea; margin: 25px 0 15px 0;">👥 Visitantes Únicos (Locales):</h4>';
            const recentVisits = localVisits.slice(-15).reverse();
            recentVisits.forEach(visit => {
                const item = document.createElement('div');
                item.className = 'visit-item';
                item.style.borderLeft = '5px solid #764ba2';
                item.innerHTML = `
                    <strong>${visit.date}</strong> a las ${visit.time}
                `;
                visitList.appendChild(item);
            });
        }
        
        console.log('📊 Estadísticas actualizadas - Total:', totalVisits);
    } catch (error) {
        console.error('Error al actualizar estadísticas:', error);
        document.getElementById('visitList').innerHTML = 
            '<div class="visit-item" style="color: #dc3545;">Error al cargar estadísticas</div>';
    }
}

// Actualizar estadísticas cada 60 segundos si está logueado (reducir peticiones)
setInterval(() => {
    if (isLoggedIn) {
        updateVisitStats();
    }
}, 60000);

// ========== MODAL ADMINISTRACIÓN ==========
function openAdminModal() {
    document.getElementById('adminModal').style.display = 'flex';
    document.getElementById('adminPassword').focus();
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
    document.getElementById('errorMsg').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

async function checkPassword() {
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        isLoggedIn = true;
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('errorMsg').style.display = 'none';
        
        // Cargar estadísticas
        await updateVisitStats();
    } else {
        document.getElementById('errorMsg').style.display = 'block';
    }
}

function logout() {
    isLoggedIn = false;
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminPassword').value = '';
    closeAdminModal();
}

// Enter para login
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('adminPassword');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }
});

// ========== NAVEGACIÓN ENTRE SECCIONES ==========
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', async function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            // Extraer nombre limpio sin emojis
            const pageName = this.textContent.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').trim();
            
            // Registrar visita a la página
            await registerPageVisit(pageName || targetId);
            
            // Cambiar sección activa
            document.querySelectorAll('section').forEach(section => {
                section.classList.remove('activo');
            });
            document.getElementById(targetId).classList.add('activo');
            
            // Cambiar enlace activo
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
            
            // Scroll suave al inicio
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
});

// ========== FILTROS DE GALERÍA ==========
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('#category-filter li').forEach(filter => {
        filter.addEventListener('click', function() {
            const category = this.getAttribute('data-filter');
            
            // Actualizar filtro activo
            document.querySelectorAll('#category-filter li').forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            
            // Filtrar imágenes
            document.querySelectorAll('.img-gallery img').forEach(img => {
                if (category === 'todos' || img.getAttribute('data-category') === category) {
                    img.style.display = 'block';
                } else {
                    img.style.display = 'none';
                }
            });
        });
    });
});

// ========== GALERÍA DE IMÁGENES ========== 
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.img-gallery img').forEach(img => {
        img.addEventListener('click', function() {
            openFulImg(this.src);
        });
    });
});

function openFulImg(src) {
    const fulImgBox = document.getElementById('fulImgBox');
    const fulImg = document.getElementById('fulImg');
    fulImg.src = src;
    fulImgBox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeImg() {
    document.getElementById('fulImgBox').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Cerrar con click en el fondo
document.addEventListener('DOMContentLoaded', function() {
    const fulImgBox = document.getElementById('fulImgBox');
    if (fulImgBox) {
        fulImgBox.addEventListener('click', function(e) {
            if (e.target === this) {
                closeImg();
            }
        });
    }
});

// Cerrar con ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeImg();
        if (!isLoggedIn) {
            closeAdminModal();
        }
    }
});

// ========== PREVENIR ZOOM EN DOBLE TAP (iOS) ==========
let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

console.log('✨ Telares Paulina Chiscao - Sistema iniciado correctamente');

// ========== NAVEGACIÓN CON FUNCIONES ==========
function navigateTo(targetId) {
    // Cambiar sección activa
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('activo');
    });
    document.getElementById(targetId).classList.add('activo');
    
    // Cambiar enlace activo
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    document.querySelector(`a[data-target="${targetId}"]`).classList.add('active');
    
    // Registrar visita si existe la función
    if (typeof registerPageVisit === 'function') {
        const pageNames = {
            'portafolio': 'Inicio',
            'tienda': 'Tienda',
            'productos': 'Productos',
            'catalogo': 'Catálogo',
            'contacto': 'Contacto',
            'ubicacion': 'Ubicación',
            'galeria': 'Galería'
        };
        registerPageVisit(pageNames[targetId] || 'Página');
    }
    
    // Scroll suave al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== BOTÓN VOLVER ARRIBA ==========
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ========== ANIMACIONES AL SCROLL ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    // Observar elementos con animación
    document.querySelectorAll('.producto-card, .feature-item, .contact-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

// ========== VISOR DE PDF (usando object tag nativo) ==========
// El PDF se visualiza directamente con el navegador usando <object>
// No se necesita PDF.js ni canvas - el navegador maneja todo automáticamente

// ========== PRODUCTOS ==========

function agregarCarritoModal() {
  const titulo = document.getElementById('modalTitulo').textContent;
  const precioTexto = document.getElementById('modalPrecio').textContent;
  
  // Aquí podrías generar dinámicamente un link con el producto, precio, etc.
  // Para ahora, redirigimos al enlace de pago:
  const LINK_PAGO = "https://www.mercadopago.cl/checkout/link-xxxxxx";
  
  // Opcionalmente añadir parámetros (utm, producto) …
  window.location.href = LINK_PAGO;
}

// Datos de los productos
const productos = [
  {
    titulo: "Hilado Artesanal",
    precio: 1,
    img: "./img/hilados.jpeg",
    descripcion: "",
    caracteristicas: [
      { nombre: "Material", valor: "" },
      { nombre: "Peso", valor: "" },
      { nombre: "Técnica", valor: "" }
    ]
  },
  {
    titulo: "Hilado Especial",
    precio: 1,
    img: "./img/hilados2.jpeg",
    descripcion: "",
    caracteristicas: [
      { nombre: "Material", valor: "" },
      { nombre: "Peso", valor: "" },
      { nombre: "Color", valor: "" }
    ]
  },
  {
    titulo: "Hilado Premium",
    precio: 1,
    img: "./img/hilados3.jpeg",
    descripcion: "",
    caracteristicas: [
      { nombre: "Material", valor: "" },
      { nombre: "Peso", valor: "}" },
      { nombre: "Certificación", valor: "" }
    ]
  },
  {
    titulo: "Hilado Tradicional",
    precio: 1,
    img: "./img/hilados4.jpeg",
    descripcion: "",
    caracteristicas: [
      { nombre: "Material", valor: "" },
      { nombre: "Peso", valor: "" },
      { nombre: "Origen", valor: "" }
    ]
  },
  {
    titulo: "Hilado Natural",
    precio: 1,
    img: "./img/hilados5.jpeg",
    descripcion: "",
    caracteristicas: [
      { nombre: "Material", valor: "" },
      { nombre: "Peso", valor: "" },
      { nombre: "Certificación", valor: "" }
    ]
  },
  {
    titulo: "Poncho Artesanal",
    precio: 1,
    img: "./img/poncho.jpeg",
    descripcion: "",
    caracteristicas: [
      { nombre: "Material", valor: "" },
      { nombre: "Tamaño", valor: "" },
      { nombre: "Diseño", valor: "" }
    ]
  },
  {
    titulo: "Poncho Tradicional",
    precio: 1,
    img: "./img/poncho2.jpeg",
    descripcion: "",
    caracteristicas: [
      { nombre: "Material", valor: "" },
      { nombre: "Tamaño", valor: "" },
      { nombre: "Origen", valor: "" }
    ]
  },
  {
    titulo: "Chal Tejido",
    precio: 1,
    img: "./img/chal.jpeg",
    descripcion: "",
    caracteristicas: [
      { nombre: "Material", valor: "" },
      { nombre: "Tamaño", valor: "" },
      { nombre: "Color", valor: "" }
    ]
  },
  {
    titulo: "Chal Elegante",
    precio: 1,
    img: "./img/chal2.jpeg",
    descripcion: "",
    caracteristicas: [
      { nombre: "Material", valor: "" },
      { nombre: "Tamaño", valor: "" },
      { nombre: "Acabado", valor: "" }
    ]
  }
];

// Función para abrir modal y mostrar producto
function abrirModalProducto(index) {
  const prod = productos[index];
  if (!prod) return;
  document.getElementById('modalImagen').src = prod.img;
  document.getElementById('modalTitulo').textContent = prod.titulo;
  document.getElementById('modalPrecio').textContent = "$" + prod.precio.toLocaleString("es-CL") + " CLP";
  document.getElementById('modalDescripcion').textContent = prod.descripcion;

  const carr = document.getElementById('modalCaracteristicas');
  carr.innerHTML = ""; // limpiar
  prod.caracteristicas.forEach(c => {
    const div = document.createElement('div');
    div.className = "caracteristica-item";
    div.innerHTML = `<strong>${c.nombre}</strong><span>${c.valor}</span>`;
    carr.appendChild(div);
  });

  document.getElementById('modalProducto').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Cerrar modal de producto
function cerrarModalProducto() {
  document.getElementById('modalProducto').classList.remove('active');
  document.body.style.overflow = 'auto';
}

// Cerrar modal si se hace click fuera del contenido
function cerrarModalProductoClick(e) {
  if (e.target.id === 'modalProducto') {
    cerrarModalProducto();
  }
}

// Función para "añadir al carrito" desde modal (puede ajustarse a tu lógica)
function agregarCarritoModal() {
  const titulo = document.getElementById('modalTitulo').textContent;
  const precioTexto = document.getElementById('modalPrecio').textContent;
  alert('Añadido al carrito: ' + titulo + ' por ' + precioTexto);
  // Aquí puedes añadir lógica: guardar en localStorage, enviar a backend, etc.
  cerrarModalProducto();
}

// ========== FUNCIONES PDF SIN SERVIDOR ==========
let currentPdfPage = 1;
const totalPdfPages = 7;

function pdfNextPage() {
    if (currentPdfPage < totalPdfPages) {
        currentPdfPage++;
        updatePdfPage();
    }
}

function pdfPreviousPage() {
    if (currentPdfPage > 1) {
        currentPdfPage--;
        updatePdfPage();
    }
}

function pdfGoToPage() {
    const input = document.getElementById('pageInput');
    const page = parseInt(input.value);
    if (page >= 1 && page <= totalPdfPages) {
        currentPdfPage = page;
        updatePdfPage();
    }
}

function updatePdfPage() {
    const viewer = document.getElementById('pdfViewer');
    const currentPageSpan = document.getElementById('currentPage');
    const pageInput = document.getElementById('pageInput');
    
    if (viewer) {
        viewer.src = `./docs/catalogo.pdf#page=${currentPdfPage}`;
    }
    if (currentPageSpan) {
        currentPageSpan.textContent = currentPdfPage;
    }
    if (pageInput) {
        pageInput.value = currentPdfPage;
    }
}

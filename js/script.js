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

// ========== SISTEMA DE VISITAS CON ALMACENAMIENTO PERSISTENTE ==========
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
        // Obtener visitas actuales
        let visits = [];
        try {
            const result = await window.storage.get('telares_visits', true);
            if (result && result.value) {
                visits = JSON.parse(result.value);
            }
        } catch (error) {
            // Si no existe, se creará un nuevo array
            visits = [];
        }
        
        // Agregar nueva visita
        const visit = {
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('es-CL'),
            time: new Date().toLocaleTimeString('es-CL')
        };
        
        visits.push(visit);
        
        // Guardar en storage compartido
        await window.storage.set('telares_visits', JSON.stringify(visits), true);
        
        console.log('✅ Visita registrada exitosamente');
    } catch (error) {
        console.error('❌ Error al registrar visita:', error);
    }
}

// Registrar visita a página específica
async function registerPageVisit(pageName) {
    try {
        let pageVisits = [];
        try {
            const result = await window.storage.get('telares_page_visits', true);
            if (result && result.value) {
                pageVisits = JSON.parse(result.value);
            }
        } catch (error) {
            pageVisits = [];
        }
        
        const visit = {
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('es-CL'),
            time: new Date().toLocaleTimeString('es-CL'),
            page: pageName
        };
        
        pageVisits.push(visit);
        await window.storage.set('telares_page_visits', JSON.stringify(pageVisits), true);
    } catch (error) {
        console.error('Error al registrar visita de página:', error);
    }
}

// Actualizar estadísticas en el panel admin
async function updateVisitStats() {
    try {
        // Obtener visitas totales
        let visits = [];
        try {
            const result = await window.storage.get('telares_visits', true);
            if (result && result.value) {
                visits = JSON.parse(result.value);
            }
        } catch (error) {
            visits = [];
        }
        
        // Calcular visitas de hoy
        const today = new Date().toLocaleDateString('es-CL');
        const todayVisits = visits.filter(v => v.date === today).length;
        
        // Actualizar números
        document.getElementById('totalVisits').textContent = visits.length;
        document.getElementById('todayVisits').textContent = todayVisits;
        document.getElementById('currentDate').textContent = today;
        
        // Obtener visitas por página
        let pageVisits = [];
        try {
            const pageResult = await window.storage.get('telares_page_visits', true);
            if (pageResult && pageResult.value) {
                pageVisits = JSON.parse(pageResult.value);
            }
        } catch (error) {
            pageVisits = [];
        }
        
        // Actualizar lista de visitas
        const visitList = document.getElementById('visitList');
        visitList.innerHTML = '';
        
        if (visits.length === 0) {
            visitList.innerHTML = '<div class="visit-item">No hay visitas registradas aún</div>';
            return;
        }

        // Estadísticas por página
        const pageStats = {};
        pageVisits.forEach(v => {
            pageStats[v.page] = (pageStats[v.page] || 0) + 1;
        });

        visitList.innerHTML += '<h4 style="color: #667eea; margin-bottom: 15px;">📊 Visitas por Sección:</h4>';
        for (const [page, count] of Object.entries(pageStats)) {
            const item = document.createElement('div');
            item.className = 'visit-item';
            item.style.background = 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)';
            item.innerHTML = `
                <strong>${page}</strong>
                <div style="font-size: 2rem; font-weight: bold; color: #667eea;">${count}</div>
                <small>visitas totales</small>
            `;
            visitList.appendChild(item);
        }

        visitList.innerHTML += '<h4 style="color: #667eea; margin: 25px 0 15px 0;">🕒 Últimas Visitas por Sección:</h4>';
        const recentPageVisits = pageVisits.slice(-20).reverse();
        recentPageVisits.forEach(visit => {
            const item = document.createElement('div');
            item.className = 'visit-item';
            item.innerHTML = `
                <strong>${visit.page}</strong> - ${visit.date} a las ${visit.time}
            `;
            visitList.appendChild(item);
        });

        visitList.innerHTML += '<h4 style="color: #667eea; margin: 25px 0 15px 0;">👥 Visitantes Únicos:</h4>';
        const recentVisits = visits.slice(-15).reverse();
        recentVisits.forEach(visit => {
            const item = document.createElement('div');
            item.className = 'visit-item';
            item.style.borderLeft = '5px solid #764ba2';
            item.innerHTML = `
                <strong>${visit.date}</strong> a las ${visit.time}
            `;
            visitList.appendChild(item);
        });
        
        console.log('📊 Estadísticas actualizadas');
    } catch (error) {
        console.error('Error al actualizar estadísticas:', error);
        document.getElementById('visitList').innerHTML = 
            '<div class="visit-item" style="color: #dc3545;">Error al cargar estadísticas</div>';
    }
}

// Actualizar estadísticas cada 10 segundos si está logueado
setInterval(() => {
    if (isLoggedIn) {
        updateVisitStats();
    }
}, 10000);

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
            const pageName = this.textContent;
            
            // Registrar visita a la página
            await registerPageVisit(pageName);
            
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
    
    // Cargar PDF si es catálogo
    if (targetId === 'catalogo' && !pdfDoc) {
        setTimeout(() => loadPDF(), 100);
    }
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

// ========== VISOR DE PDF ==========
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let canvas = null;
let ctx = null;

// Inicializar canvas cuando el DOM esté listo
function initPDFCanvas() {
    canvas = document.getElementById('pdfCanvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
        console.log('Canvas inicializado correctamente');
    } else {
        console.error('No se encontró el elemento canvas');
    }
}

// Configurar PDF.js cuando se cargue
window.addEventListener('load', function() {
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        console.log('PDF.js configurado correctamente');
    } else {
        console.error('PDF.js no se cargó correctamente');
    }
    initPDFCanvas();
});

// Cargar PDF cuando se abre la sección
document.addEventListener('DOMContentLoaded', function() {
    const catalogoLink = document.querySelector('a[data-target="catalogo"]');
    if (catalogoLink) {
        catalogoLink.addEventListener('click', function() {
            setTimeout(function() {
                if (!pdfDoc) {
                    loadPDF();
                }
            }, 100);
        });
    }
});

// Cargar el documento PDF
function loadPDF() {
    const loadingDiv = document.getElementById('pdfLoading');
    const errorDiv = document.getElementById('pdfError');
    const canvasElement = document.getElementById('pdfCanvas');
    
    console.log('Intentando cargar PDF...');
    console.log('Canvas existe:', !!canvasElement);
    console.log('PDF.js cargado:', typeof pdfjsLib !== 'undefined');
    
    if (loadingDiv) loadingDiv.style.display = 'block';
    if (errorDiv) errorDiv.style.display = 'none';

    const url = './docs/catalogo.pdf';
    
    if (typeof pdfjsLib === 'undefined') {
        console.error('PDF.js no está cargado');
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (errorDiv) errorDiv.style.display = 'block';
        return;
    }
    
    pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        console.log('PDF cargado correctamente. Páginas:', pdfDoc.numPages);
        
        const pageCountElement = document.getElementById('pageCount');
        if (pageCountElement) {
            pageCountElement.textContent = pdfDoc.numPages;
        }
        
        const pageInputElement = document.getElementById('pageInput');
        if (pageInputElement) {
            pageInputElement.max = pdfDoc.numPages;
        }
        
        if (loadingDiv) loadingDiv.style.display = 'none';
        
        // Renderizar primera página y generar números
        renderPage(pageNum);
        updatePageNumbers();
    }).catch(function(error) {
        console.error('Error al cargar PDF:', error);
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (errorDiv) errorDiv.style.display = 'block';
    });
}

// Renderizar una página específica
function renderPage(num) {
    if (!pdfDoc || !canvas || !ctx) return;
    
    pageRendering = true;
    
    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        
        renderTask.promise.then(function() {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    document.getElementById('pageNum').textContent = num;
    updatePageNumbers();
    updatePageInput();
}

// Actualizar campo de entrada de página
function updatePageInput() {
    const pageInput = document.getElementById('pageInput');
    if (pageInput && pdfDoc) {
        pageInput.max = pdfDoc.numPages;
        pageInput.value = pageNum;
    }
}

// Ir a página específica desde input
function goToPage() {
    const pageInput = document.getElementById('pageInput');
    if (!pageInput || !pdfDoc) return;
    
    const targetPage = parseInt(pageInput.value);
    
    if (targetPage >= 1 && targetPage <= pdfDoc.numPages) {
        pageNum = targetPage;
        queueRenderPage(pageNum);
    } else {
        alert(`Por favor ingrese un número entre 1 y ${pdfDoc.numPages}`);
        pageInput.value = pageNum;
    }
}

// Ir a página específica desde número clickeable
function goToPageNumber(page) {
    if (!pdfDoc || page < 1 || page > pdfDoc.numPages) return;
    pageNum = page;
    queueRenderPage(pageNum);
}

// Actualizar números de página clickeables
function updatePageNumbers() {
    if (!pdfDoc) return;
    
    const pageNumbersDiv = document.getElementById('pageNumbers');
    if (!pageNumbersDiv) return;
    
    pageNumbersDiv.innerHTML = '';
    
    const totalPages = pdfDoc.numPages;
    const currentPage = pageNum;
    
    // Mostrar máximo 7 números de página con elipsis
    let pagesToShow = [];
    
    if (totalPages <= 7) {
        // Mostrar todos los números
        for (let i = 1; i <= totalPages; i++) {
            pagesToShow.push(i);
        }
    } else {
        // Siempre mostrar primera página
        pagesToShow.push(1);
        
        if (currentPage > 3) {
            pagesToShow.push('...');
        }
        
        // Mostrar páginas alrededor de la actual
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) {
            if (!pagesToShow.includes(i)) {
                pagesToShow.push(i);
            }
        }
        
        if (currentPage < totalPages - 2) {
            pagesToShow.push('...');
        }
        
        // Siempre mostrar última página
        if (!pagesToShow.includes(totalPages)) {
            pagesToShow.push(totalPages);
        }
    }
    
    // Crear elementos
    pagesToShow.forEach(page => {
        const pageElement = document.createElement('div');
        
        if (page === '...') {
            pageElement.className = 'page-number ellipsis';
            pageElement.textContent = '...';
        } else {
            pageElement.className = 'page-number';
            if (page === currentPage) {
                pageElement.classList.add('active');
            }
            pageElement.textContent = page;
            pageElement.onclick = () => goToPageNumber(page);
        }
        
        pageNumbersDiv.appendChild(pageElement);
    });
}

// Enter para ir a página
document.addEventListener('DOMContentLoaded', function() {
    const pageInput = document.getElementById('pageInput');
    if (pageInput) {
        pageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                goToPage();
            }
        });
    }
});

// Encolar renderizado de página
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

// Página anterior
function previousPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

// Página siguiente
function nextPage() {
    if (!pdfDoc || pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

// Zoom in
function zoomIn() {
    scale += 0.25;
    if (scale > 3) scale = 3;
    queueRenderPage(pageNum);
}

// Zoom out
function zoomOut() {
    scale -= 0.25;
    if (scale < 0.5) scale = 0.5;
    queueRenderPage(pageNum);
}

// Navegación con teclado
document.addEventListener('keydown', function(e) {
    const catalogoSection = document.getElementById('catalogo');
    if (catalogoSection && catalogoSection.classList.contains('activo')) {
        if (e.key === 'ArrowLeft') {
            previousPage();
        } else if (e.key === 'ArrowRight') {
            nextPage();
        } else if (e.key === '+' || e.key === '=') {
            zoomIn();
        } else if (e.key === '-') {
            zoomOut();
        }
    }
});

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

// Función para “añadir al carrito” desde modal (puede ajustarse a tu lógica)
function agregarCarritoModal() {
  const titulo = document.getElementById('modalTitulo').textContent;
  const precioTexto = document.getElementById('modalPrecio').textContent;
  alert('Añadido al carrito: ' + titulo + ' por ' + precioTexto);
  // Aquí puedes añadir lógica: guardar en localStorage, enviar a backend, etc.
  cerrarModalProducto();
}

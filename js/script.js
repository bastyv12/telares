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
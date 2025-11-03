   // Registrar visita al cargar la página
        trackVisit();

        // Navegación entre secciones
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');
                
                document.querySelectorAll('section').forEach(section => {
                    section.classList.remove('activo');
                });
                
                document.getElementById(targetId).classList.add('activo');
                
                document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
                this.classList.add('active');
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

  // Sistema de tracking de visitas (almacenado localmente)
        function trackVisit() {
            const today = new Date().toDateString();
            let stats = JSON.parse(localStorage.getItem('siteStats') || '{"total":0,"unique":[],"daily":{}}');
            
            // Incrementar total
            stats.total++;
            
            // Tracking diario
            if (!stats.daily[today]) {
                stats.daily[today] = 0;
            }
            stats.daily[today]++;
            
            // Tracking único (por sesión)
            const sessionId = sessionStorage.getItem('sessionId') || Date.now().toString();
            sessionStorage.setItem('sessionId', sessionId);
            
            if (!stats.unique.includes(sessionId)) {
                stats.unique.push(sessionId);
            }
            
            localStorage.setItem('siteStats', JSON.stringify(stats));
        }

        function loadStats() {
            const today = new Date().toDateString();
            const stats = JSON.parse(localStorage.getItem('siteStats') || '{"total":0,"unique":[],"daily":{}}');
            
            document.getElementById('total-visits').textContent = stats.total;
            document.getElementById('today-visits').textContent = stats.daily[today] || 0;
            document.getElementById('unique-visits').textContent = stats.unique.length;
        }
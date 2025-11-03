  // SEGURIDAD: Contraseña hasheada (debes cambiar esto por tu propia contraseña)
        const ADMIN_PASSWORD_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'; // hash de "password"

        // Función simple de hash (en producción usar bcrypt o similar)
        async function hashPassword(password) {
            const msgBuffer = new TextEncoder().encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        // Sistema de autenticación
        async function adminLogin() {
            const password = document.getElementById('admin-password').value;
            const errorMsg = document.getElementById('error-msg');
            
            if (!password) {
                errorMsg.textContent = 'Por favor ingresa una contraseña';
                return;
            }

            const hash = await hashPassword(password);
            
            if (hash === ADMIN_PASSWORD_HASH) {
                document.getElementById('login-form').style.display = 'none';
                document.getElementById('admin-content').style.display = 'block';
                loadStats();
                errorMsg.textContent = '';
            } else {
                errorMsg.textContent = 'Contraseña incorrecta';
                document.getElementById('admin-password').value = '';
            }
        }

        function adminLogout() {
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('admin-content').style.display = 'none';
            document.getElementById('admin-password').value = '';
        }

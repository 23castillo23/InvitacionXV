// Esta línea le dice al navegador que espere a que toda la página cargue antes de activar las funciones
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LÓGICA PARA LEER NOMBRE Y NÚMERO DE PASES ---
    // Esta sección se encarga de buscar el nombre de la familia y los pases en el link que envías
    const urlParams = new URLSearchParams(window.location.search); // Revisa la dirección de la página para buscar datos
    
    // Leemos el nombre (?n=)
    const nombreInvitado = urlParams.get('n'); // Busca el nombre que pusiste después de la "n" en el link
    const displayNombre = document.getElementById('invitadoNombre'); // Busca el lugar en el pase donde debe ir el nombre

    // Leemos los pases (&p=)
    const pasesInvitado = urlParams.get('p'); // Busca el número que pusiste después de la "p" en el link
    const displayPases = document.getElementById('numPases'); // Busca el lugar en el pase donde va el número de personas
    const albumLink = document.getElementById('albumLink');

    // Inyectamos el nombre en la tarjeta
    if (nombreInvitado && displayNombre) { // Si el link trae un nombre, hace lo siguiente:
        // Convierte guiones bajos en espacios y pone todo en MAYÚSCULAS para que se vea elegante
        displayNombre.innerText = nombreInvitado.replace(/_/g, ' ').toUpperCase();
    }

    // Inyectamos el número de pases
    if (pasesInvitado && displayPases) { // Si el link trae un número de pases:
        displayPases.innerText = pasesInvitado; // Pone ese número en el óvalo dorado
    } else if (displayPases) {
        displayPases.innerText = "1"; // Si el link no tiene número, pone "1" por defecto
    }

    // Mantener datos del invitado al pasar al álbum
    if (albumLink) {
        const params = new URLSearchParams();
        if (nombreInvitado) params.set('n', nombreInvitado);
        if (pasesInvitado) params.set('p', pasesInvitado);
        const q = params.toString();
        albumLink.href = q ? `album.html?${q}` : 'album.html';
    }

    // --- 2. LÓGICA DE APERTURA, CIERRE Y MÚSICA INTELIGENTE ---
    const sealBtn = document.getElementById('entrarBtn');
    const closeBtn = document.getElementById('closeBtn');
    const wrapper = document.getElementById('wrapper');
    const music = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicToggle');
    const musicIcon = document.getElementById('musicIcon');

    // PRE-UNLOCK: al primer toque en cualquier parte, desbloqueamos el audio
    // sin reproducirlo todavía — así el navegador ya no lo bloquea después
    let audioUnlocked = false;
    function unlockAudio() {
        if (audioUnlocked || !music) return;
        music.muted = true;
        music.play().then(() => {
            music.pause();
            music.currentTime = 0;
            music.muted = false;
            audioUnlocked = true;
        }).catch(() => {});
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('click', unlockAudio);
    }
    document.addEventListener('touchstart', unlockAudio, { passive: true });
    document.addEventListener('click', unlockAudio);

    // Abrir y reproducir
    if (sealBtn && wrapper) {
        sealBtn.addEventListener('click', () => {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#84b6f4', '#c4dafa', '#ffffff'],
                ticks: 300
            });

            setTimeout(() => {
                wrapper.classList.add('open');
                document.body.style.overflow = 'auto';

                if (music) {
                    music.muted = false;
                    music.volume = 1.0;
                    music.play().then(() => {
                        musicBtn.classList.add('visible');
                        musicIcon.innerText = "🔊";
                    }).catch(() => {
                        musicBtn.classList.add('visible');
                        musicIcon.innerText = "🔇";
                    });
                }
            }, 300);
        });
    }

    // Cerrar y PAUSAR (Lo que pasa al tocar el sello al final)
    if (closeBtn && wrapper) {
        closeBtn.addEventListener('click', (e) => { // Cuando el invitado toca "CERRAR":
            e.stopPropagation(); // Evita que se activen otros botones por error
            wrapper.classList.remove('open'); // Enrolla y oculta la invitación
            document.body.style.overflow = 'hidden'; // Bloquea el movimiento de la pantalla
            
            if (music) {
                music.pause(); // Detiene la canción de inmediato
                musicIcon.innerText = "🔇"; // Cambia el icono a sonido apagado
            }

            // Regresa la pantalla hasta arriba suavemente para mostrar de nuevo el pase
            setTimeout(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, 1500); 
            setTimeout(() => { document.body.style.overflow = 'auto'; }, 1800); 
        });
    }

    // Pausa automática al salir del navegador (Para no molestar si el invitado se sale de la página)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { 
            if (music) music.pause(); 
        } else {
            if (wrapper && wrapper.classList.contains('open') && music) {
                music.play();
                musicIcon.innerText = "🔊";
            }
        }
    });

    // Control manual (Botón flotante circular)
    if (musicBtn && music) {
        musicBtn.addEventListener('click', (e) => { 
            e.stopPropagation();
            // TRUCO PARA EVITAR MUDO: Forzamos muted = false al dar clic
            music.muted = false; 
            if (music.paused) {
                music.play();
                musicIcon.innerText = "🔊";
            } else {
                music.pause();
                musicIcon.innerText = "🔇";
            }
        });
    }

    // --- 3. ACORDEONES ---
    // Esta sección controla las ventanitas informativas que se abren y cierran (Iglesia, Recepción, etc.)
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => { // Cuando el invitado toca una sección:
            const item = header.parentElement; // Identifica la sección que se tocó
            document.querySelectorAll('.accordion-item').forEach(other => {
                if (other !== item) other.classList.remove('active'); // Si hay otra abierta, la cierra
            });
            item.classList.toggle('active'); // Abre la sección tocada o la cierra si ya estaba abierta
        });
    });

    // --- MODO ADMINISTRADOR (3 Clics en el nombre del pergamino) ---
    const nombrePergamino = document.querySelector('.princess-name');
    let clicsAdmin = 0;

    if (nombrePergamino) {
        nombrePergamino.addEventListener('click', () => {
            clicsAdmin++;
            if (clicsAdmin === 3) {
                const albumLink = document.getElementById('albumLink');
                const albumMsg = document.getElementById('albumStatusMsg');
                
                if (albumLink) albumLink.style.display = 'inline-flex';
                if (albumMsg) albumMsg.style.display = 'none';
                
                alert("✨ Modo Administrador: Álbum habilitado para pruebas.");
                clicsAdmin = 0; 
            }
        });
    } 

    // ******************************************************
    // AQUÍ ES DONDE LLAMAMOS AL RELOJ PARA QUE ENCIENDA
    // ******************************************************
    // Esta línea es el interruptor que pone a funcionar el reloj de los días
    iniciarReloj(); 

}); // <-- Aquí termina el bloque principal que espera la carga de la página

// --- 4. DEFINICIÓN DEL RELOJ (Instrucciones de cómo debe contar) ---
function iniciarReloj() {
    const fechaFiesta = new Date('2026-12-19T12:00:00').getTime();
    const display = document.getElementById('mainCountdown');
    const daysBox = document.getElementById('daysBox');
    
    // Elementos nuevos del aviso
    const albumLink = document.getElementById('albumLink');
    const albumMsg = document.getElementById('albumStatusMsg');
    const albumTimer = document.getElementById('albumCountdownTimer');

    if (!display) return;

    const timer = setInterval(() => {
        const ahora = new Date().getTime();
        const diff = fechaFiesta - ahora;

        if (diff <= 0) {
            clearInterval(timer);
            display.innerHTML = "<div class='finish-msg'>¡ES HOY EL GRAN DÍA!</div>";
            if (daysBox) daysBox.innerText = "0 DÍAS";
            if (albumLink) albumLink.style.display = "inline-flex";
            if (albumMsg) albumMsg.style.display = "none";
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        // Actualiza la tarjeta azul
        if (daysBox) daysBox.innerText = `${d} DÍAS`;
        display.innerHTML = `
            <div class="countdown-unit"><span class="countdown-number">${d}</span><span class="countdown-label">Días</span></div>
            <div class="countdown-unit"><span class="countdown-number">${h}</span><span class="countdown-label">Hrs</span></div>
            <div class="countdown-unit"><span class="countdown-number">${m}</span><span class="countdown-label">Min</span></div>
            <div class="countdown-unit"><span class="countdown-number">${s}</span><span class="countdown-label">Seg</span></div>
        `;

        // Actualiza el contador del álbum con cajitas igual al pase
        if (albumTimer) {
            albumTimer.innerHTML = `
                <div class="countdown-unit"><span class="countdown-number">${d}</span><span class="countdown-label">Días</span></div>
                <div class="countdown-unit"><span class="countdown-number">${h}</span><span class="countdown-label">Hrs</span></div>
                <div class="countdown-unit"><span class="countdown-number">${m}</span><span class="countdown-label">Min</span></div>
                <div class="countdown-unit"><span class="countdown-number">${s}</span><span class="countdown-label">Seg</span></div>
            `;
        }

    }, 1000);
}

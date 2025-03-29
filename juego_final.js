// Configuración de Supabase
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_KEY = 'tu-clave-anonima-publica';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variables del juego
let canvas, ctx;
let jugador, cpu, pelota, campoJuego;
let puntajeJugador = 0;
let puntajeCPU = 0;
let juegoActivo = false;
let nivelDificultad = 'media'; // 'facil', 'media', 'dificil'
let velocidadJugador = 8;
let velocidadCPU = 5;
let velocidadPelota = 7;
let direccionPelotaX = 0;
let direccionPelotaY = 0;
let nombreUsuario = '';
let puntajeMaximo = 0;
let tiempoRestante = 59;
let temporizador;

// Elementos del DOM
const formLogin = document.getElementById('login-form');
const formRegistro = document.getElementById('registro-form');
const pantallaLogin = document.getElementById('pantalla-login');
const pantallaJuego = document.getElementById('pantalla-juego');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
const btnDificultadFacil = document.getElementById('btn-facil');
const btnDificultadMedia = document.getElementById('btn-media');
const btnDificultadDificil = document.getElementById('btn-dificil');
const btnComenzar = document.getElementById('btn-comenzar');
const tablaClasificacion = document.getElementById('tabla-clasificacion');
const nombreUsuarioSpan = document.getElementById('nombre-usuario');
const puntajeMaximoSpan = document.getElementById('puntaje-maximo');
const mensajeLoginForm = document.getElementById('mensaje-login');
const mensajeRegistroForm = document.getElementById('mensaje-registro');
const contadorTiempo = document.getElementById('contador-tiempo');

// Inicializar el juego
window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    campoJuego = {
        width: canvas.width,
        height: canvas.height,
        color: '#000',
        lineaMedia: {
            width: 10,
            color: '#888'
        }
    };
    
    jugador = {
        width: 12,
        height: 80,
        color: '#FFF',
        y: campoJuego.height / 2 - 40,
        x: 10
    };
    
    cpu = {
        width: 12,
        height: 80,
        color: '#FFF',
        y: campoJuego.height / 2 - 40,
        x: campoJuego.width - 22
    };
    
    pelota = {
        size: 12,
        color: '#FFF',
        x: campoJuego.width / 2,
        y: campoJuego.height / 2,
        velocidad: velocidadPelota
    };
    
    // Verificar si hay una sesión activa
    verificarSesion();
    
    // Event listeners
    formLogin.addEventListener('submit', manejarLogin);
    formRegistro.addEventListener('submit', manejarRegistro);
    btnCerrarSesion.addEventListener('click', cerrarSesion);
    btnDificultadFacil.addEventListener('click', () => cambiarDificultad('facil'));
    btnDificultadMedia.addEventListener('click', () => cambiarDificultad('media'));
    btnDificultadDificil.addEventListener('click', () => cambiarDificultad('dificil'));
    btnComenzar.addEventListener('click', iniciarJuego);
    
    document.addEventListener('keydown', manejarTeclaPresionada);
    document.addEventListener('keyup', manejarTeclaSoltada);
    
    // Cambiar dificultad por defecto al cargar
    cambiarDificultad('media');
    
    // Dibujar el campo inicial
    dibujarCampo();
};

// Verificar si hay una sesión activa
async function verificarSesion() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        mostrarLogin();
        return;
    }
    
    // Usuario está autenticado
    const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('username, puntaje_maximo')
        .eq('id', user.id)
        .single();
    
    if (perfilError || !perfil) {
        console.error('Error al obtener perfil:', perfilError);
        mostrarLogin();
        return;
    }
    
    // Guardar datos del usuario
    nombreUsuario = perfil.username;
    puntajeMaximo = perfil.puntaje_maximo || 0;
    
    // Actualizar interfaz
    nombreUsuarioSpan.textContent = nombreUsuario;
    puntajeMaximoSpan.textContent = puntajeMaximo;
    
    // Mostrar pantalla de juego
    mostrarJuego();
    
    // Cargar clasificación
    cargarClasificacion();
}

// Mostrar pantalla de login
function mostrarLogin() {
    pantallaLogin.style.display = 'flex';
    pantallaJuego.style.display = 'none';
}

// Mostrar pantalla de juego
function mostrarJuego() {
    pantallaLogin.style.display = 'none';
    pantallaJuego.style.display = 'block';
}

// Manejar login de usuario
async function manejarLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        // Limpiar formulario
        formLogin.reset();
        mensajeLoginForm.textContent = '';
        
        // Verificar sesión
        verificarSesion();
    } catch (error) {
        mostrarMensajeEnForm(mensajeLoginForm, 'Error: ' + error.message, 'error');
    }
}

// Manejar registro de usuario
async function manejarRegistro(event) {
    event.preventDefault();
    
    const email = document.getElementById('registro-email').value;
    const password = document.getElementById('registro-password').value;
    const username = document.getElementById('registro-username').value;
    
    try {
        // Crear usuario
        const { data: { user }, error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) throw error;
        
        // Crear perfil para el usuario
        const { data: perfil, error: perfilError } = await supabase
            .from('perfiles')
            .insert([
                { id: user.id, username, puntaje_maximo: 0 }
            ]);
        
        if (perfilError) throw perfilError;
        
        // Limpiar formulario
        formRegistro.reset();
        mostrarMensajeEnForm(mensajeRegistroForm, '¡Registro exitoso! Por favor inicia sesión.', 'success');
    } catch (error) {
        mostrarMensajeEnForm(mensajeRegistroForm, 'Error: ' + error.message, 'error');
    }
}

// Cerrar sesión
async function cerrarSesion() {
    await supabase.auth.signOut();
    mostrarLogin();
    
    // Resetear puntajes
    puntajeJugador = 0;
    puntajeCPU = 0;
    detenerJuego();
}

// Mostrar mensaje en formulario
function mostrarMensajeEnForm(elemento, mensaje, tipo) {
    elemento.textContent = mensaje;
    elemento.className = '';
    elemento.classList.add(tipo);
}

// Cargar clasificación desde Supabase
async function cargarClasificacion() {
    try {
        const { data, error } = await supabase
            .from('perfiles')
            .select('username, puntaje_maximo')
            .order('puntaje_maximo', { ascending: false })
            .limit(10);
        
        if (error) throw error;
        
        // Limpiar tabla
        while (tablaClasificacion.rows.length > 1) {
            tablaClasificacion.deleteRow(1);
        }
        
        // Agregar filas con datos
        data.forEach((jugador, index) => {
            const fila = tablaClasificacion.insertRow();
            
            const celdaPosicion = fila.insertCell(0);
            const celdaNombre = fila.insertCell(1);
            const celdaPuntaje = fila.insertCell(2);
            
            celdaPosicion.textContent = index + 1;
            celdaNombre.textContent = jugador.username;
            celdaPuntaje.textContent = jugador.puntaje_maximo;
            
            // Resaltar al usuario actual
            if (jugador.username === nombreUsuario) {
                fila.classList.add('usuario-actual');
            }
        });
    } catch (error) {
        console.error('Error al cargar clasificación:', error);
    }
}

// Actualizar puntaje máximo del usuario
async function actualizarPuntajeMaximo() {
    if (puntajeJugador > puntajeMaximo) {
        puntajeMaximo = puntajeJugador;
        puntajeMaximoSpan.textContent = puntajeMaximo;
        
        // Actualizar en Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            const { error } = await supabase
                .from('perfiles')
                .update({ puntaje_maximo: puntajeMaximo })
                .eq('id', user.id);
            
            if (error) {
                console.error('Error al actualizar puntaje máximo:', error);
            } else {
                // Actualizar tabla de clasificación
                cargarClasificacion();
            }
        }
    }
}

// Finalizar juego
function finalizarJuego(ganador) {
    detenerJuego();
    
    let mensaje;
    if (ganador === 'jugador') {
        mensaje = '¡Has ganado! 🏆';
    } else if (ganador === 'cpu') {
        mensaje = 'Has perdido 😢';
    } else {
        mensaje = 'Se acabó el tiempo ⏱️';
    }
    
    // Actualizar puntaje máximo
    actualizarPuntajeMaximo();
    
    // Mostrar mensaje
    alert(mensaje);
}

// Reestablecer posiciones
function resetearPosiciones() {
    // Posición inicial de la pelota
    pelota.x = campoJuego.width / 2;
    pelota.y = campoJuego.height / 2;
    
    // Direcciones iniciales aleatorias
    direccionPelotaX = (Math.random() > 0.5 ? 1 : -1) * pelota.velocidad;
    direccionPelotaY = (Math.random() * 2 - 1) * pelota.velocidad;
    
    // Posiciones iniciales de las paletas
    jugador.y = campoJuego.height / 2 - jugador.height / 2;
    cpu.y = campoJuego.height / 2 - cpu.height / 2;
}

// Actualizar estado del juego
function actualizarJuego() {
    if (!juegoActivo) return;
    
    // Movimiento de la pelota
    moverPelota();
    
    // Movimiento de la CPU
    moverCPU();
    
    // Detección de colisiones
    detectarColisiones();
    
    // Dibujar elementos
    dibujarCampo();
    dibujarJugadores();
    dibujarPelota();
    dibujarPuntaje();
    
    // Actualizar en bucle
    requestAnimationFrame(actualizarJuego);
}

// Mover la pelota
function moverPelota() {
    pelota.x += direccionPelotaX;
    pelota.y += direccionPelotaY;
}

// Mover jugador con teclas
let teclaArribaPresionada = false;
let teclaAbajoPresionada = false;

function moverJugador() {
    if (teclaArribaPresionada && jugador.y > 0) {
        jugador.y -= velocidadJugador;
    }
    
    if (teclaAbajoPresionada && jugador.y < campoJuego.height - jugador.height) {
        jugador.y += velocidadJugador;
    }
}

// Mover CPU basado en posición de la pelota
function moverCPU() {
    // Probabilidad de reacción basada en dificultad
    let probabilidadReaccion;
    
    switch (nivelDificultad) {
        case 'facil':
            probabilidadReaccion = 0.7;
            break;
        case 'media':
            probabilidadReaccion = 0.85;
            break;
        case 'dificil':
            probabilidadReaccion = 0.95;
            break;
        default:
            probabilidadReaccion = 0.85;
    }
    
    // Decidir si la CPU reacciona a la pelota
    if (Math.random() < probabilidadReaccion) {
        // Calcular posición objetivo
        const centroRaqueta = cpu.y + cpu.height / 2;
        const centroPelota = pelota.y;
        
        // Mover hacia la pelota
        if (centroRaqueta < centroPelota - 10) {
            cpu.y += velocidadCPU;
        } else if (centroRaqueta > centroPelota + 10) {
            cpu.y -= velocidadCPU;
        }
        
        // Limitar movimiento al área del juego
        if (cpu.y < 0) {
            cpu.y = 0;
        } else if (cpu.y > campoJuego.height - cpu.height) {
            cpu.y = campoJuego.height - cpu.height;
        }
    }
}

// Detectar colisiones
function detectarColisiones() {
    // Colisión con bordes superior e inferior
    if (pelota.y <= 0 || pelota.y >= campoJuego.height - pelota.size) {
        direccionPelotaY *= -1;
    }
    
    // Colisión con paleta del jugador
    if (pelota.x <= jugador.x + jugador.width && 
        pelota.x >= jugador.x && 
        pelota.y + pelota.size >= jugador.y && 
        pelota.y <= jugador.y + jugador.height) {
        
        // Calcular posición relativa para determinar ángulo de rebote
        const relativePosY = (pelota.y - (jugador.y + jugador.height / 2)) / (jugador.height / 2);
        
        // Cambiar dirección y ajustar ángulo
        direccionPelotaX = Math.abs(direccionPelotaX);
        direccionPelotaY = relativePosY * pelota.velocidad;
        
        // Incrementar velocidad ligeramente
        direccionPelotaX *= 1.05;
    }
    
    // Colisión con paleta de la CPU
    if (pelota.x + pelota.size >= cpu.x && 
        pelota.x <= cpu.x + cpu.width && 
        pelota.y + pelota.size >= cpu.y && 
        pelota.y <= cpu.y + cpu.height) {
        
        // Calcular posición relativa para determinar ángulo de rebote
        const relativePosY = (pelota.y - (cpu.y + cpu.height / 2)) / (cpu.height / 2);
        
        // Cambiar dirección y ajustar ángulo
        direccionPelotaX = -Math.abs(direccionPelotaX);
        direccionPelotaY = relativePosY * pelota.velocidad;
        
        // Incrementar velocidad ligeramente
        direccionPelotaX *= 1.05;
    }
    
    // Punto para CPU
    if (pelota.x < 0) {
        anotarPunto('cpu');
    }
    
    // Punto para jugador
    if (pelota.x > campoJuego.width) {
        anotarPunto('jugador');
    }
}

// Anotar punto
function anotarPunto(jugadorAnotador) {
    if (jugadorAnotador === 'jugador') {
        puntajeJugador++;
    } else if (jugadorAnotador === 'cpu') {
        puntajeCPU++;
    }
    
    // Verificar si hay un ganador
    if (puntajeJugador >= 5) {
        finalizarJuego('jugador');
        return;
    } else if (puntajeCPU >= 5) {
        finalizarJuego('cpu');
        return;
    }
    
    // Resetear posiciones para siguiente punto
    resetearPosiciones();
}

// Manejar tecla presionada
function manejarTeclaPresionada(event) {
    if (!juegoActivo) return;
    
    switch (event.key) {
        case 'ArrowUp':
            teclaArribaPresionada = true;
            break;
        case 'ArrowDown':
            teclaAbajoPresionada = true;
            break;
    }
    
    // Actualizar posición del jugador
    moverJugador();
}

// Manejar tecla soltada
function manejarTeclaSoltada(event) {
    switch (event.key) {
        case 'ArrowUp':
            teclaArribaPresionada = false;
            break;
        case 'ArrowDown':
            teclaAbajoPresionada = false;
            break;
    }
}

// Cambiar dificultad
function cambiarDificultad(dificultad) {
    nivelDificultad = dificultad;
    
    // Remover selección anterior
    btnDificultadFacil.classList.remove('seleccionado');
    btnDificultadMedia.classList.remove('seleccionado');
    btnDificultadDificil.classList.remove('seleccionado');
    
    // Aplicar nueva selección
    switch (dificultad) {
        case 'facil':
            btnDificultadFacil.classList.add('seleccionado');
            velocidadCPU = 3;
            break;
        case 'media':
            btnDificultadMedia.classList.add('seleccionado');
            velocidadCPU = 5;
            break;
        case 'dificil':
            btnDificultadDificil.classList.add('seleccionado');
            velocidadCPU = 7;
            break;
    }
}

// Iniciar el juego
function iniciarJuego() {
    if (juegoActivo) return;
    
    // Resetear puntajes
    puntajeJugador = 0;
    puntajeCPU = 0;
    
    // Activar estado de juego
    juegoActivo = true;
    
    // Posiciones iniciales
    resetearPosiciones();
    
    // Iniciar temporizador
    tiempoRestante = 59;
    contadorTiempo.textContent = tiempoRestante;
    
    temporizador = setInterval(() => {
        tiempoRestante--;
        contadorTiempo.textContent = tiempoRestante;
        
        if (tiempoRestante <= 0) {
            finalizarJuego('tiempo');
        }
    }, 1000);
    
    // Iniciar bucle de juego
    actualizarJuego();
    
    // Cambiar estado del botón
    btnComenzar.textContent = 'Jugando...';
    btnComenzar.disabled = true;
}

// Detener el juego
function detenerJuego() {
    juegoActivo = false;
    clearInterval(temporizador);
    btnComenzar.textContent = '¡Comenzar!';
    btnComenzar.disabled = false;
}

// Dibujar campo de juego
function dibujarCampo() {
    // Fondo
    ctx.fillStyle = campoJuego.color;
    ctx.fillRect(0, 0, campoJuego.width, campoJuego.height);
    
    // Línea central
    ctx.strokeStyle = campoJuego.lineaMedia.color;
    ctx.lineWidth = campoJuego.lineaMedia.width;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(campoJuego.width / 2, 0);
    ctx.lineTo(campoJuego.width / 2, campoJuego.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Dibujar jugadores
function dibujarJugadores() {
    // Jugador
    ctx.fillStyle = jugador.color;
    ctx.fillRect(jugador.x, jugador.y, jugador.width, jugador.height);
    
    // CPU
    ctx.fillStyle = cpu.color;
    ctx.fillRect(cpu.x, cpu.y, cpu.width, cpu.height);
}

// Dibujar pelota
function dibujarPelota() {
    ctx.fillStyle = pelota.color;
    ctx.fillRect(pelota.x, pelota.y, pelota.size, pelota.size);
}

// Dibujar puntaje
function dibujarPuntaje() {
    ctx.font = '32px Arial';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    
    // Puntaje del jugador
    ctx.fillText(puntajeJugador, campoJuego.width * 0.25, 50);
    
    // Puntaje de la CPU
    ctx.fillText(puntajeCPU, campoJuego.width * 0.75, 50);
}
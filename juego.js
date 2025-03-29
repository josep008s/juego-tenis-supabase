// Juego de Tenis - Código JavaScript
// Este archivo controla toda la lógica del juego

// Configuración de Supabase
// TODO: Reemplaza con tus propias credenciales de Supabase
const SUPABASE_URL = 'https://tu-url-de-supabase.supabase.co';
const SUPABASE_KEY = 'tu-clave-publica-supabase';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Esperamos a que el DOM (estructura del documento HTML) esté completamente cargado
document.addEventListener('DOMContentLoaded', inicializarJuego);

// Variables principales del juego
let juegoIniciado = false;         // Controla si el juego está en marcha
let idAnimacion;                   // Identificador para cancelar la animación
let dificultad = 'medio';          // Nivel de dificultad (fácil, medio, difícil)

// Variables para el temporizador
let tiempoRestante = 59;          // Tiempo inicial en segundos
let idTemporizador;               // ID del intervalo del temporizador
let elementoTiempo;               // Elemento del DOM para mostrar el tiempo

// Variables para los elementos del DOM (los objetos HTML)
let cancha, pelota, raquetaJugador, raquetaCPU;
let puntajeJugador, puntajeCPU, botonInicio;
let botonesNivel;

// Variables para el sistema de autenticación
let usuarioActual = null;
let modales = {};
let botonLogin, botonRegistro, botonLogout, nombreUsuario, valorPuntajeMaximo;
let usuarioConectado, usuarioNoConectado;
let formLogin, formRegistro;
let botonClasificacion;

// Variables para el movimiento
let velocidadPelotaX = 5;          // Velocidad horizontal de la pelota
let velocidadPelotaY = 5;          // Velocidad vertical de la pelota
let velocidadRaquetaJugador = 8;   // Velocidad de la raqueta del jugador
let velocidadRaquetaCPU = 4;       // Velocidad de la CPU (cambia según dificultad)

// Variables para controlar el estado de las teclas
let teclaArribaPresionada = false;
let teclaAbajoPresionada = false;

// Función que inicializa el juego
function inicializarJuego() {
    // Obtenemos referencias a los elementos del DOM
    cancha = document.getElementById('cancha');
    pelota = document.getElementById('pelota');
    raquetaJugador = document.getElementById('raqueta-jugador');
    raquetaCPU = document.getElementById('raqueta-cpu');
    puntajeJugador = document.getElementById('puntaje-jugador');
    puntajeCPU = document.getElementById('puntaje-cpu');
    botonInicio = document.getElementById('boton-inicio');
    botonesNivel = document.querySelectorAll('.nivel-dificultad');
    elementoTiempo = document.getElementById('tiempo-restante');
    
    // Elementos de autenticación
    botonLogin = document.getElementById('boton-login');
    botonRegistro = document.getElementById('boton-registro');
    botonLogout = document.getElementById('boton-logout');
    nombreUsuario = document.getElementById('nombre-usuario');
    valorPuntajeMaximo = document.getElementById('valor-puntaje-maximo');
    usuarioConectado = document.getElementById('usuario-conectado');
    usuarioNoConectado = document.getElementById('usuario-no-conectado');
    formLogin = document.getElementById('form-login');
    formRegistro = document.getElementById('form-registro');
    botonClasificacion = document.getElementById('boton-clasificacion');
    
    // Referencias a los modales
    modales = {
        login: document.getElementById('modal-login'),
        registro: document.getElementById('modal-registro'),
        clasificacion: document.getElementById('modal-clasificacion')
    };
    
    // Configuramos el evento del botón de inicio
    botonInicio.addEventListener('click', toggleJuego);
    
    // Configuramos los eventos de teclado
    document.addEventListener('keydown', manejarTeclaPresionada);
    document.addEventListener('keyup', manejarTeclaSoltada);
    
    // Configuramos los eventos para los botones de dificultad
    botonesNivel.forEach(boton => {
        boton.addEventListener('click', cambiarDificultad);
        
        // Marcamos el nivel medio como activo por defecto
        if (boton.dataset.dificultad === 'medio') {
            boton.classList.add('activo');
        }
    });
    
    // Inicializamos eventos de autenticación
    inicializarEventosAutenticacion();
    
    // Verificamos si hay un usuario guardado en Supabase
    verificarSesionSupabase();
}

// Función para iniciar o pausar el juego
function toggleJuego() {
    if (!juegoIniciado) {
        // Inicia el juego
        juegoIniciado = true;
        botonInicio.textContent = 'Pausar';
        reiniciarPosiciones();
        pelota.style.display = 'block';
        actualizarJuego();
        
        // Iniciar temporizador
        iniciarTemporizador();
    } else {
        // Pausa el juego
        juegoIniciado = false;
        botonInicio.textContent = 'Continuar';
        cancelAnimationFrame(idAnimacion);
        
        // Pausar temporizador
        clearInterval(idTemporizador);
    }
}

// Función para iniciar el temporizador
function iniciarTemporizador() {
    // Reiniciamos el tiempo
    tiempoRestante = 59;
    elementoTiempo.textContent = tiempoRestante;
    elementoTiempo.classList.remove('poca-tiempo');
    
    // Limpiamos cualquier intervalo existente
    clearInterval(idTemporizador);
    
    // Creamos un nuevo intervalo
    idTemporizador = setInterval(() => {
        tiempoRestante--;
        elementoTiempo.textContent = tiempoRestante;
        
        // Si quedan menos de 10 segundos, añadimos animación
        if (tiempoRestante <= 10) {
            elementoTiempo.classList.add('poca-tiempo');
        }
        
        // Si el tiempo llega a cero, terminamos el juego
        if (tiempoRestante <= 0) {
            clearInterval(idTemporizador);
            
            // Determinamos el ganador por puntos
            const puntosJugador = parseInt(puntajeJugador.textContent);
            const puntosCPU = parseInt(puntajeCPU.textContent);
            
            if (puntosJugador > puntosCPU) {
                finalizarJuego('¡Has ganado! 🏆 ¡Se acabó el tiempo!');
            } else if (puntosCPU > puntosJugador) {
                finalizarJuego('Has perdido. 😢 ¡Se acabó el tiempo!');
            } else {
                finalizarJuego('¡Empate! 🤝 ¡Se acabó el tiempo!');
            }
        }
    }, 1000);
}

// Función para verificar sesión en Supabase
async function verificarSesionSupabase() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
            // El usuario está autenticado
            const { data: perfil, error: perfilError } = await supabase
                .from('perfiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
            if (perfilError) throw perfilError;
            
            usuarioActual = {
                id: session.user.id,
                username: perfil.username,
                email: session.user.email,
                puntajeMaximo: perfil.puntaje_maximo || 0
            };
            
            actualizarUIUsuarioConectado();
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error.message);
    }
}

// Función para inicializar eventos de autenticación
function inicializarEventosAutenticacion() {
    // Eventos para mostrar modales
    botonLogin.addEventListener('click', () => mostrarModal('login'));
    botonRegistro.addEventListener('click', () => mostrarModal('registro'));
    botonClasificacion.addEventListener('click', () => {
        cargarTablaClasificacion();
        mostrarModal('clasificacion');
    });
    
    // Evento para cerrar sesión
    botonLogout.addEventListener('click', cerrarSesion);
    
    // Cerrar modales al hacer clic en X
    document.querySelectorAll('.cerrar-modal').forEach(boton => {
        boton.addEventListener('click', () => {
            ocultarModales();
        });
    });
    
    // Cerrar modales al hacer clic fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            ocultarModales();
        }
    });
    
    // Manejar formulario de inicio de sesión
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        iniciarSesion();
    });
    
    // Manejar formulario de registro
    formRegistro.addEventListener('submit', (e) => {
        e.preventDefault();
        registrarUsuario();
    });
}

// Continuación en una segunda parte...
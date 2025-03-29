// Juego de Tenis - Código JavaScript
// Este archivo controla toda la lógica del juego

// Sistema de almacenamiento local para puntuaciones
const almacenLocal = {
    guardarPuntuacion: function(puntos, dificultad) {
        const nombre = localStorage.getItem('nombreJugador') || 'Anónimo';
        const puntuaciones = JSON.parse(localStorage.getItem('puntuacionesTenis') || '[]');
        puntuaciones.push({ 
            nombre: nombre, 
            puntos: puntos, 
            dificultad: dificultad, 
            fecha: new Date().toISOString() 
        });
        puntuaciones.sort((a, b) => b.puntos - a.puntos);
        localStorage.setItem('puntuacionesTenis', JSON.stringify(puntuaciones));
    },
    obtenerPuntuaciones: function() {
        return JSON.parse(localStorage.getItem('puntuacionesTenis') || '[]');
    },
    guardarNombreJugador: function(nombre) {
        localStorage.setItem('nombreJugador', nombre);
    },
    obtenerNombreJugador: function() {
        return localStorage.getItem('nombreJugador') || 'Anónimo';
    }
};

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

// Variables del juego
let canvas;                       // Elemento canvas para el juego
let ctx;                          // Contexto 2D del canvas
let botonInicio;                  // Botón para iniciar el juego
let selectorDificultad;           // Selector de dificultad
let elementoPuntos;               // Elemento para mostrar los puntos
let puntos = 0;                   // Contador de puntos actual

// Variables de la física del juego
let pelota = {
    x: 0,
    y: 0,
    radio: 10,
    dx: 5,
    dy: -5,
    color: '#FFFFFF'
};

let raqueta = {
    x: 0,
    y: 0,
    ancho: 100,
    alto: 20,
    color: '#00FF00'
};

// Función principal de inicialización
function inicializarJuego() {
    // Obtener referencias a elementos del DOM
    canvas = document.getElementById('canvas-juego');
    ctx = canvas.getContext('2d');
    botonInicio = document.getElementById('boton-inicio');
    selectorDificultad = document.getElementById('selector-dificultad');
    elementoTiempo = document.getElementById('tiempo');
    elementoPuntos = document.getElementById('puntos');
    
    // Eventos para mouse
    canvas.addEventListener('mousemove', moverRaqueta);
    
    // Soporte para dispositivos táctiles
    canvas.addEventListener('touchmove', moverRaquetaTouch);
    
    // Otros eventos
    botonInicio.addEventListener('click', iniciarJuego);
    selectorDificultad.addEventListener('change', cambiarDificultad);
    
    // Inicializar posiciones
    reiniciarPosiciones();
    
    // Dibujar el estado inicial
    dibujarJuego();
    
    // Mostrar récords almacenados localmente
    mostrarMejoresPuntuaciones();
    
    // Ajustar tamaño del canvas en dispositivos móviles
    ajustarTamañoCanvas();
    window.addEventListener('resize', ajustarTamañoCanvas);
}

// Función para ajustar el tamaño del canvas según el dispositivo
function ajustarTamañoCanvas() {
    const contenedor = document.querySelector('.contenedor-juego');
    const anchoDisponible = contenedor.clientWidth - 40; // 40px de margen
    
    if (window.innerWidth < 800) {
        // Dispositivo móvil
        canvas.width = anchoDisponible;
        canvas.height = anchoDisponible / 2;
    } else {
        // Escritorio
        canvas.width = 800;
        canvas.height = 400;
    }
    
    // Reposicionar elementos al cambiar tamaño
    reiniciarPosiciones();
    dibujarJuego();
}

// Función para cambiar la dificultad
function cambiarDificultad() {
    dificultad = selectorDificultad.value;
    ajustarDificultad();
}

// Función para ajustar parámetros según la dificultad
function ajustarDificultad() {
    switch(dificultad) {
        case 'facil':
            pelota.dx = pelota.dx > 0 ? 4 : -4;
            pelota.dy = pelota.dy > 0 ? 4 : -4;
            raqueta.ancho = canvas.width * 0.15; // 15% del ancho del canvas
            break;
        case 'medio':
            pelota.dx = pelota.dx > 0 ? 6 : -6;
            pelota.dy = pelota.dy > 0 ? 6 : -6;
            raqueta.ancho = canvas.width * 0.125; // 12.5% del ancho del canvas
            break;
        case 'dificil':
            pelota.dx = pelota.dx > 0 ? 8 : -8;
            pelota.dy = pelota.dy > 0 ? 8 : -8;
            raqueta.ancho = canvas.width * 0.1; // 10% del ancho del canvas
            break;
    }
}

// Función para iniciar el juego
function iniciarJuego() {
    if (juegoIniciado) return;
    
    juegoIniciado = true;
    botonInicio.textContent = 'Juego en curso';
    botonInicio.disabled = true;
    
    // Reiniciar valores
    puntos = 0;
    elementoPuntos.textContent = '0';
    tiempoRestante = 59;
    elementoTiempo.textContent = '60';
    
    // Iniciar temporizador
    idTemporizador = setInterval(actualizarTemporizador, 1000);
    
    // Iniciar el bucle de animación
    idAnimacion = requestAnimationFrame(actualizarJuego);
}

// Función para actualizar el temporizador
function actualizarTemporizador() {
    if (tiempoRestante <= 0) {
        finalizarJuego();
        return;
    }
    
    tiempoRestante--;
    elementoTiempo.textContent = tiempoRestante + 1;
}

// Función para finalizar el juego
function finalizarJuego() {
    juegoIniciado = false;
    cancelAnimationFrame(idAnimacion);
    clearInterval(idTemporizador);
    
    botonInicio.textContent = 'Iniciar Juego';
    botonInicio.disabled = false;
    
    // Guardar puntuación
    almacenLocal.guardarPuntuacion(puntos, dificultad);
    
    // Mostrar mensaje con el puntaje final
    alert(`¡Juego terminado! Tu puntaje final es: ${puntos}`);
    
    // Actualizar tabla de mejores puntuaciones
    mostrarMejoresPuntuaciones();
}

// Función para mover la raqueta con el mouse
function moverRaqueta(e) {
    // Obtener la posición X del mouse relativa al canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Asignar posición a la raqueta, limitada por los bordes del canvas
    raqueta.x = Math.max(0, Math.min(canvas.width - raqueta.ancho, mouseX - raqueta.ancho / 2));
}

// Función para mover la raqueta con eventos táctiles
function moverRaquetaTouch(e) {
    // Prevenir el desplazamiento de la página
    e.preventDefault();
    
    // Obtener la posición X del toque relativa al canvas
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    
    // Asignar posición a la raqueta, limitada por los bordes del canvas
    raqueta.x = Math.max(0, Math.min(canvas.width - raqueta.ancho, touchX - raqueta.ancho / 2));
}

// Función principal del bucle de juego
function actualizarJuego() {
    if (!juegoIniciado) return;
    
    // Actualizar posición de la pelota
    pelota.x += pelota.dx;
    pelota.y += pelota.dy;
    
    // Colisión con paredes laterales
    if (pelota.x + pelota.radio > canvas.width || pelota.x - pelota.radio < 0) {
        pelota.dx = -pelota.dx;
    }
    
    // Colisión con pared superior
    if (pelota.y - pelota.radio < 0) {
        pelota.dy = -pelota.dy;
    }
    
    // Colisión con raqueta
    if (pelota.y + pelota.radio > raqueta.y && 
        pelota.x > raqueta.x && 
        pelota.x < raqueta.x + raqueta.ancho) {
        
        pelota.dy = -pelota.dy;
        
        // Aumentar puntos
        puntos++;
        elementoPuntos.textContent = puntos;
        
        // Aumentar velocidad ligeramente
        pelota.dx *= 1.05;
        pelota.dy *= 1.05;
    }
    
    // Pelota cayó al suelo (game over)
    if (pelota.y + pelota.radio > canvas.height) {
        finalizarJuego();
        return;
    }
    
    // Dibujar el estado actual
    dibujarJuego();
    
    // Continuar el bucle de animación
    idAnimacion = requestAnimationFrame(actualizarJuego);
}

// Función para dibujar el estado actual del juego
function dibujarJuego() {
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar fondo del campo
    ctx.fillStyle = '#000066';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar líneas del campo
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // Dibujar pelota
    ctx.fillStyle = pelota.color;
    ctx.beginPath();
    ctx.arc(pelota.x, pelota.y, pelota.radio, 0, Math.PI * 2);
    ctx.fill();
    
    // Dibujar raqueta
    ctx.fillStyle = raqueta.color;
    ctx.fillRect(raqueta.x, raqueta.y, raqueta.ancho, raqueta.alto);
}

// Función para reiniciar posiciones
function reiniciarPosiciones() {
    // Posición inicial de la pelota
    pelota.x = canvas.width / 2;
    pelota.y = canvas.height / 2;
    
    // Velocidad inicial según dificultad
    ajustarDificultad();
    
    // Posición inicial de la raqueta
    raqueta.x = (canvas.width - raqueta.ancho) / 2;
    raqueta.y = canvas.height - raqueta.alto - 10;
}

// Función para mostrar las mejores puntuaciones
function mostrarMejoresPuntuaciones() {
    const puntuaciones = almacenLocal.obtenerPuntuaciones();
    let html = '<h2>Mejores Puntuaciones</h2>';
    
    if (puntuaciones.length === 0) {
        html += '<p>Aún no hay puntuaciones registradas.</p>';
    } else {
        html += '<table><tr><th>Jugador</th><th>Puntos</th><th>Dificultad</th></tr>';
        
        // Mostrar las 10 mejores puntuaciones
        const top10 = puntuaciones.slice(0, 10);
        top10.forEach(p => {
            html += `<tr><td>${p.nombre}</td><td>${p.puntos}</td><td>${p.dificultad}</td></tr>`;
        });
        
        html += '</table>';
    }
    
    // Si existe el elemento para mostrar las puntuaciones, actualizarlo
    const tablaPuntuaciones = document.querySelector('.tabla-puntuaciones');
    if (tablaPuntuaciones) {
        tablaPuntuaciones.innerHTML = html;
    } else {
        // Si no existe, crear un elemento dinámicamente después de las instrucciones
        const instrucciones = document.querySelector('.instrucciones');
        if (instrucciones) {
            const tabla = document.createElement('div');
            tabla.className = 'tabla-puntuaciones';
            tabla.innerHTML = html;
            instrucciones.after(tabla);
        }
    }
}
// Función para anotar un punto
function anotarPunto(jugador) {
    // Verificamos qué jugador anotó
    if (jugador === 'jugador') {
        // El jugador humano ha anotado
        puntajeJugador.textContent = parseInt(puntajeJugador.textContent) + 1;
        puntajeJugador.parentElement.classList.add('punto-anotado');
        
        // Si el usuario está logueado, actualizamos su puntaje máximo
        if (usuarioActual) {
            actualizarPuntajeMaximo(parseInt(puntajeJugador.textContent));
        }
    } else {
        // La CPU ha anotado
        puntajeCPU.textContent = parseInt(puntajeCPU.textContent) + 1;
        puntajeCPU.parentElement.classList.add('punto-anotado');
    }
    
    // Quitamos la animación después de 0.5 segundos
    setTimeout(() => {
        puntajeJugador.parentElement.classList.remove('punto-anotado');
        puntajeCPU.parentElement.classList.remove('punto-anotado');
    }, 500);
    
    // Reiniciamos las posiciones
    reiniciarPosiciones();

    // Comprobamos si alguien ha ganado (al llegar a 5 puntos)
    if (parseInt(puntajeJugador.textContent) >= 5) {
        finalizarJuego('¡Has ganado! 🏆');
    } else if (parseInt(puntajeCPU.textContent) >= 5) {
        finalizarJuego('Has perdido. 😢 ¡Inténtalo de nuevo!');
    }
}

// Función para manejar cuando se presiona una tecla
function manejarTeclaPresionada(evento) {
    // Tecla flecha arriba - código 38
    if (evento.keyCode === 38) {
        teclaArribaPresionada = true;
    }
    
    // Tecla flecha abajo - código 40
    if (evento.keyCode === 40) {
        teclaAbajoPresionada = true;
    }
    
    // Prevenimos el comportamiento default (scroll de la página)
    if (evento.keyCode === 38 || evento.keyCode === 40) {
        evento.preventDefault();
    }
}

// Función para manejar cuando se suelta una tecla
function manejarTeclaSoltada(evento) {
    // Tecla flecha arriba - código 38
    if (evento.keyCode === 38) {
        teclaArribaPresionada = false;
    }
    
    // Tecla flecha abajo - código 40
    if (evento.keyCode === 40) {
        teclaAbajoPresionada = false;
    }
}

// Función para cambiar la dificultad del juego
function cambiarDificultad(evento) {
    // Obtenemos la dificultad seleccionada
    dificultad = evento.target.dataset.dificultad;
    
    // Actualizamos los botones (estilo visual)
    botonesNivel.forEach(boton => {
        if (boton.dataset.dificultad === dificultad) {
            boton.classList.add('activo');
        } else {
            boton.classList.remove('activo');
        }
    });
    
    // Ajustamos la velocidad de la CPU según la dificultad
    if (dificultad === 'facil') {
        velocidadRaquetaCPU = 3;
    } else if (dificultad === 'medio') {
        velocidadRaquetaCPU = 4;
    } else {
        velocidadRaquetaCPU = 6;
    }
}
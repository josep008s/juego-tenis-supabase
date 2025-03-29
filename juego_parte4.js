// Función para reiniciar las posiciones de la pelota y las raquetas
function reiniciarPosiciones() {
    // Posición inicial de la pelota (centro de la cancha)
    pelota.style.left = (cancha.offsetWidth / 2 - pelota.offsetWidth / 2) + 'px';
    pelota.style.top = (cancha.offsetHeight / 2 - pelota.offsetHeight / 2) + 'px';
    
    // Posición inicial de las raquetas (centro de cada lado)
    raquetaJugador.style.top = (cancha.offsetHeight / 2 - raquetaJugador.offsetHeight / 2) + 'px';
    raquetaCPU.style.top = (cancha.offsetHeight / 2 - raquetaCPU.offsetHeight / 2) + 'px';
    
    // Dirección inicial aleatoria
    velocidadPelotaX = 5 * (Math.random() > 0.5 ? 1 : -1);
    velocidadPelotaY = 5 * (Math.random() > 0.5 ? 1 : -1);
}

// Función principal que actualiza el estado del juego
function actualizarJuego() {
    if (!juegoIniciado) return;
    
    // Movemos la pelota
    moverPelota();
    
    // Movemos la raqueta del jugador según las teclas presionadas
    moverRaquetaJugador();
    
    // La CPU mueve su raqueta
    moverRaquetaCPU();
    
    // Verificamos colisiones
    verificarColisiones();
    
    // Continuamos la animación del juego
    idAnimacion = requestAnimationFrame(actualizarJuego);
}

// Función para mover la pelota
function moverPelota() {
    // Obtenemos la posición actual
    let posX = pelota.offsetLeft;
    let posY = pelota.offsetTop;
    
    // Calculamos la nueva posición
    posX += velocidadPelotaX;
    posY += velocidadPelotaY;
    
    // Actualizamos la posición
    pelota.style.left = posX + 'px';
    pelota.style.top = posY + 'px';
}

// Función para mover la raqueta del jugador
function moverRaquetaJugador() {
    if (teclaArribaPresionada) {
        // Movemos hacia arriba
        let nuevaPos = raquetaJugador.offsetTop - velocidadRaquetaJugador;
        
        // Limitamos el movimiento para no salir de la cancha
        if (nuevaPos >= 0) {
            raquetaJugador.style.top = nuevaPos + 'px';
        }
    }
    
    if (teclaAbajoPresionada) {
        // Movemos hacia abajo
        let nuevaPos = raquetaJugador.offsetTop + velocidadRaquetaJugador;
        
        // Limitamos el movimiento para no salir de la cancha
        if (nuevaPos <= cancha.offsetHeight - raquetaJugador.offsetHeight) {
            raquetaJugador.style.top = nuevaPos + 'px';
        }
    }
}
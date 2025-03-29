// Función para que la CPU mueva su raqueta
function moverRaquetaCPU() {
    // La CPU sigue la pelota según la dificultad
    const centroPelota = pelota.offsetTop + pelota.offsetHeight / 2;
    const centroRaqueta = raquetaCPU.offsetTop + raquetaCPU.offsetHeight / 2;
    let direccion = 0;
    
    // Ajustamos la "inteligencia" de la CPU según la dificultad
    let nivelReaccion = 0.8; // Probabilidad de reacción correcta
    
    if (dificultad === 'facil') {
        velocidadRaquetaCPU = 3;
        nivelReaccion = 0.6;
    } else if (dificultad === 'medio') {
        velocidadRaquetaCPU = 4;
        nivelReaccion = 0.8;
    } else {
        velocidadRaquetaCPU = 6;
        nivelReaccion = 0.95;
    }
    
    // La CPU decide si sigue la pelota correctamente o no
    if (Math.random() < nivelReaccion) {
        if (centroPelota < centroRaqueta - 10) {
            direccion = -1; // Mover hacia arriba
        } else if (centroPelota > centroRaqueta + 10) {
            direccion = 1; // Mover hacia abajo
        }
    } else {
        direccion = Math.random() > 0.5 ? 1 : -1; // Movimiento aleatorio
    }
    
    // Calculamos la nueva posición
    let nuevaPos = raquetaCPU.offsetTop + (direccion * velocidadRaquetaCPU);
    
    // Limitamos el movimiento para no salir de la cancha
    if (nuevaPos >= 0 && nuevaPos <= cancha.offsetHeight - raquetaCPU.offsetHeight) {
        raquetaCPU.style.top = nuevaPos + 'px';
    }
}

// Función para verificar colisiones
function verificarColisiones() {
    const posX = pelota.offsetLeft;
    const posY = pelota.offsetTop;
    const anchoPelota = pelota.offsetWidth;
    const altoPelota = pelota.offsetHeight;
    
    // Colisiones con las paredes superior e inferior
    if (posY <= 0 || posY + altoPelota >= cancha.offsetHeight) {
        velocidadPelotaY *= -1; // Invertimos la dirección vertical
    }
    
    // Colisión con la raqueta del jugador
    if (
        posX <= raquetaJugador.offsetLeft + raquetaJugador.offsetWidth &&
        posY + altoPelota >= raquetaJugador.offsetTop &&
        posY <= raquetaJugador.offsetTop + raquetaJugador.offsetHeight
    ) {
        // Cambiamos la dirección y añadimos algo de efecto según dónde golpee
        velocidadPelotaX = Math.abs(velocidadPelotaX); // Aseguramos que va hacia la derecha
        
        // Efecto: cambiamos ligeramente el ángulo según dónde golpee en la raqueta
        const puntoImpacto = (posY + altoPelota/2) - (raquetaJugador.offsetTop + raquetaJugador.offsetHeight/2);
        velocidadPelotaY = puntoImpacto * 0.2;
    }
    
    // Colisión con la raqueta de la CPU
    if (
        posX + anchoPelota >= raquetaCPU.offsetLeft &&
        posY + altoPelota >= raquetaCPU.offsetTop &&
        posY <= raquetaCPU.offsetTop + raquetaCPU.offsetHeight
    ) {
        // Cambiamos la dirección y añadimos algo de efecto
        velocidadPelotaX = -Math.abs(velocidadPelotaX); // Aseguramos que va hacia la izquierda
        
        // Efecto: cambiamos ligeramente el ángulo según dónde golpee en la raqueta
        const puntoImpacto = (posY + altoPelota/2) - (raquetaCPU.offsetTop + raquetaCPU.offsetHeight/2);
        velocidadPelotaY = puntoImpacto * 0.2;
    }
    
    // Si la pelota sale por la izquierda, punto para CPU
    if (posX < 0) {
        anotarPunto('cpu');
    }
    
    // Si la pelota sale por la derecha, punto para jugador
    if (posX + anchoPelota > cancha.offsetWidth) {
        anotarPunto('jugador');
    }
}
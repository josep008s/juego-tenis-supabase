// Mostrar mensaje en los formularios
function mostrarMensaje(elemento, mensaje, tipo) {
    elemento.textContent = mensaje;
    elemento.className = tipo === 'error' ? 'mensaje-error' : 'mensaje-exito';
}

// Función para cargar la tabla de clasificación desde Supabase
async function cargarTablaClasificacion() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla-clasificacion');
    cuerpoTabla.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';
    
    try {
        // Obtener perfiles ordenados por puntaje máximo
        const { data: perfiles, error } = await supabase
            .from('perfiles')
            .select('*')
            .order('puntaje_maximo', { ascending: false })
            .limit(20);
            
        if (error) throw error;
        
        // Limpiamos la tabla
        cuerpoTabla.innerHTML = '';
        
        // Si no hay usuarios, mostramos un mensaje
        if (!perfiles || perfiles.length === 0) {
            const fila = document.createElement('tr');
            fila.innerHTML = '<td colspan="3">No hay jugadores registrados aún</td>';
            cuerpoTabla.appendChild(fila);
            return;
        }
        
        // Agregamos cada usuario a la tabla
        perfiles.forEach((perfil, index) => {
            // Solo mostramos usuarios con puntaje
            if (!perfil.puntaje_maximo) return;
            
            const posicion = index + 1;
            const fila = document.createElement('tr');
            
            // Añadimos clase especial para los tres primeros lugares
            if (posicion <= 3) {
                fila.classList.add(`posicion-${posicion}`);
            }
            
            // Verificamos si el usuario actual está en la tabla
            const esUsuarioActual = usuarioActual && usuarioActual.id === perfil.id;
            if (esUsuarioActual) {
                fila.classList.add('usuario-actual');
            }
            
            fila.innerHTML = `
                <td>${posicion}</td>
                <td>${perfil.username}${esUsuarioActual ? ' (Tú)' : ''}</td>
                <td>${perfil.puntaje_maximo}</td>
            `;
            
            cuerpoTabla.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar la clasificación:', error.message);
        cuerpoTabla.innerHTML = `<tr><td colspan="3">Error al cargar la clasificación: ${error.message}</td></tr>`;
    }
}

// Función para actualizar el puntaje máximo del usuario logueado en Supabase
async function actualizarPuntajeMaximo(puntajeActual) {
    if (!usuarioActual) return;
    
    try {
        // Solo actualizamos si el puntaje actual es mayor que el máximo
        if (puntajeActual > (usuarioActual.puntajeMaximo || 0)) {
            // Actualizamos en Supabase
            const { error } = await supabase
                .from('perfiles')
                .update({ puntaje_maximo: puntajeActual })
                .eq('id', usuarioActual.id);
                
            if (error) throw error;
            
            // Actualizamos la información local
            usuarioActual.puntajeMaximo = puntajeActual;
            
            // Actualizamos la UI
            valorPuntajeMaximo.textContent = puntajeActual;
        }
    } catch (error) {
        console.error('Error al actualizar puntaje máximo:', error.message);
    }
}

// Función para finalizar el juego
function finalizarJuego(mensaje) {
    juegoIniciado = false;
    cancelAnimationFrame(idAnimacion);
    clearInterval(idTemporizador);
    
    // Si el usuario está logueado y el mensaje es de victoria, 
    // actualizamos la tabla de clasificación
    if (usuarioActual && mensaje.includes('¡Has ganado!')) {
        setTimeout(() => {
            cargarTablaClasificacion();
            mostrarModal('clasificacion');
        }, 1500);
    }
    
    alert(mensaje);
    
    // Reiniciamos los puntajes
    puntajeJugador.textContent = '0';
    puntajeCPU.textContent = '0';
    
    // Reiniciamos el temporizador
    tiempoRestante = 59;
    elementoTiempo.textContent = tiempoRestante;
    elementoTiempo.classList.remove('poca-tiempo');
    
    // Cambiamos el texto del botón
    botonInicio.textContent = '¡Comenzar!';
    
    // Ocultamos la pelota
    pelota.style.display = 'none';
}
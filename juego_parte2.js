// Función para mostrar un modal específico
function mostrarModal(tipo) {
    ocultarModales(); // Aseguramos que no haya otros modales abiertos
    if (modales[tipo]) {
        modales[tipo].classList.add('mostrar');
    }
}

// Ocultar todos los modales
function ocultarModales() {
    Object.values(modales).forEach(modal => {
        modal.classList.remove('mostrar');
    });
}

// Función para iniciar sesión con Supabase
async function iniciarSesion() {
    const email = document.getElementById('login-usuario').value;
    const password = document.getElementById('login-password').value;
    const mensajeElement = document.getElementById('login-mensaje');
    
    // Verificar si los campos están vacíos
    if (!email || !password) {
        mostrarMensaje(mensajeElement, 'Por favor, completa todos los campos', 'error');
        return;
    }
    
    try {
        // Iniciar sesión con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        // Autenticación exitosa
        const { data: perfil, error: perfilError } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
        if (perfilError) throw perfilError;
        
        usuarioActual = {
            id: data.user.id,
            username: perfil.username,
            email: data.user.email,
            puntajeMaximo: perfil.puntaje_maximo || 0
        };
        
        // Actualizar la interfaz
        actualizarUIUsuarioConectado();
        
        // Mostrar mensaje de éxito y cerrar modal
        mostrarMensaje(mensajeElement, '¡Inicio de sesión exitoso!', 'exito');
        setTimeout(() => {
            ocultarModales();
            // Limpiar formulario
            formLogin.reset();
            mensajeElement.textContent = '';
        }, 1000);
    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        mostrarMensaje(mensajeElement, 'Error al iniciar sesión: ' + error.message, 'error');
    }
}

// Función para registrar un nuevo usuario con Supabase
async function registrarUsuario() {
    const email = document.getElementById('registro-usuario').value;
    const password = document.getElementById('registro-password').value;
    const confirmarPassword = document.getElementById('registro-confirmar').value;
    const mensajeElement = document.getElementById('registro-mensaje');
    
    // Verificar formato de correo electrónico
    if (!email.includes('@')) {
        mostrarMensaje(mensajeElement, 'Por favor, utiliza un email válido', 'error');
        return;
    }
    
    // Verificar si los campos están vacíos
    if (!email || !password || !confirmarPassword) {
        mostrarMensaje(mensajeElement, 'Por favor, completa todos los campos', 'error');
        return;
    }
    
    // Verificar que las contraseñas coincidan
    if (password !== confirmarPassword) {
        mostrarMensaje(mensajeElement, 'Las contraseñas no coinciden', 'error');
        return;
    }
    
    try {
        // Registrar usuario en Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: email.split('@')[0] // Usamos la parte del email antes del @ como nombre de usuario
                }
            }
        });
        
        if (error) throw error;
        
        // Crear perfil de usuario
        const { error: perfilError } = await supabase
            .from('perfiles')
            .insert([
                {
                    id: data.user.id,
                    username: email.split('@')[0],
                    puntaje_maximo: 0
                }
            ]);
            
        if (perfilError) throw perfilError;
        
        // Mostrar mensaje de éxito
        mostrarMensaje(mensajeElement, 'Registro exitoso, verifica tu email para confirmar tu cuenta', 'exito');
        
        // Limpiar formulario después de 2 segundos y mostrar formulario de login
        setTimeout(() => {
            formRegistro.reset();
            mensajeElement.textContent = '';
            ocultarModales();
            mostrarModal('login');
        }, 3000);
    } catch (error) {
        console.error('Error al registrar usuario:', error.message);
        mostrarMensaje(mensajeElement, 'Error al registrar: ' + error.message, 'error');
    }
}

// Función para cerrar sesión con Supabase
async function cerrarSesion() {
    try {
        // Cerrar sesión en Supabase
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
        
        // Actualizar variables y UI
        usuarioActual = null;
        actualizarUIUsuarioDesconectado();
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
        alert('Error al cerrar sesión: ' + error.message);
    }
}

// Actualizar UI cuando el usuario está conectado
function actualizarUIUsuarioConectado() {
    if (usuarioActual) {
        nombreUsuario.textContent = usuarioActual.username;
        valorPuntajeMaximo.textContent = usuarioActual.puntajeMaximo || 0;
        usuarioNoConectado.style.display = 'none';
        usuarioConectado.style.display = 'flex';
    }
}

// Actualizar UI cuando el usuario está desconectado
function actualizarUIUsuarioDesconectado() {
    usuarioNoConectado.style.display = 'flex';
    usuarioConectado.style.display = 'none';
}
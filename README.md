# Juego de Tenis con Supabase

Un juego de tenis 2D clásico con sistema de autenticación y tabla de clasificación usando Supabase.

![Juego de Tenis](https://i.ibb.co/98Bb4kf/juego-tenis-preview.jpg)

## Características

- Juego clásico de tenis estilo Pong
- Temporizador de 59 segundos por partida
- Sistema de inicio de sesión y registro con Supabase
- Tabla de clasificación global
- Almacenamiento de puntajes máximos
- Tres niveles de dificultad
- Interfaz de usuario moderna y atractiva

## Requisitos

- Cuenta gratuita en [Supabase](https://supabase.com)
- Navegador web moderno

## Configuración

1. Crea una cuenta gratuita en [Supabase](https://supabase.com) si aún no tienes una
2. Crea un nuevo proyecto en Supabase
3. Crea una tabla llamada `perfiles` con la siguiente estructura:
   - `id` (UUID, clave primaria)
   - `username` (texto)
   - `puntaje_maximo` (entero)
   - `created_at` (timestamp con zona horaria)
4. Configura la autenticación en Supabase para permitir inicio de sesión con correo/contraseña
5. Actualiza el archivo `juego.js` con tus credenciales de Supabase:
   ```javascript
   const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
   const SUPABASE_KEY = 'tu-clave-anonima-publica';
   ```

## Instrucciones de juego

1. Registra una cuenta o inicia sesión
2. Selecciona el nivel de dificultad
3. Haz clic en "¡Comenzar!" para iniciar el juego
4. Usa las flechas ↑ y ↓ para mover tu raqueta
5. Marca 5 puntos antes que la CPU o antes de que se acabe el tiempo (59 segundos)
6. ¡Compite por el mejor puntaje en la tabla de clasificación!

## Créditos

Desarrollado como parte de un proyecto educativo.
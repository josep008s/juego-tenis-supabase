# Configuración de Supabase para el Juego de Tenis

Este documento proporciona instrucciones detalladas para configurar correctamente Supabase con el juego de tenis.

## 1. Crear una cuenta en Supabase

1. Ve a [Supabase](https://supabase.com) y crea una cuenta gratuita si aún no tienes una.
2. Una vez dentro del panel, crea un nuevo proyecto.
3. Elige un nombre para tu proyecto y establece una contraseña segura para la base de datos.
4. Selecciona la región más cercana a tu ubicación para mejor rendimiento.
5. Espera a que se complete la configuración del proyecto (puede tardar unos minutos).

## 2. Obtener las credenciales

Una vez que tu proyecto esté listo, necesitarás dos valores importantes:

1. URL del proyecto: En el panel de Supabase, ve a "Configuración del proyecto" → "API". Copia la URL que aparece en "URL del proyecto".

2. Clave anónima: En la misma página, copia la "clave anónima" (anon key). Esta es la que usarás en la configuración del juego.

## 3. Crear la tabla de perfiles

1. En el panel lateral izquierdo, haz clic en "Table Editor".
2. Haz clic en "Crear una nueva tabla".
3. Nombra la tabla como "perfiles".
4. Configura las siguientes columnas:
   - `id` (tipo UUID, clave primaria) - Dejala como está por defecto
   - `username` (tipo text)
   - `puntaje_maximo` (tipo integer, valor predeterminado: 0)
   - `created_at` (tipo timestamptz, valor predeterminado: now())

5. Haz clic en "Guardar" para crear la tabla.

## 4. Configurar autenticación

1. En el panel lateral, ve a "Authentication" → "Providers".
2. Asegúrate de que "Email" esté habilitado.
3. Puedes desactivar "Confirmar correo electrónico" para pruebas (opcional).
4. Guarda los cambios.

## 5. Configurar permisos RLS (Row Level Security)

1. Ve a "Table Editor" → "perfiles".
2. Haz clic en "Políticas RLS".
3. Activa RLS haciendo clic en el botón.
4. Crea las siguientes políticas:

### Política para SELECT (lectura)
- Nombre: "Cualquiera puede ver los puntajes"
- Acción: SELECT
- Usando la expresión: `true`

### Política para INSERT (inserción)
- Nombre: "Los usuarios pueden insertar sus propios perfiles"
- Acción: INSERT
- Usando la expresión: `auth.uid() = id`

### Política para UPDATE (actualización)
- Nombre: "Los usuarios pueden actualizar sus propios perfiles"
- Acción: UPDATE
- Usando la expresión: `auth.uid() = id`

5. Guarda cada política.

## 6. Actualizar el código del juego

Abre el archivo `juego_final.js` y actualiza las primeras líneas con tus credenciales:

```javascript
const SUPABASE_URL = 'https://tu-proyecto-url.supabase.co';
const SUPABASE_KEY = 'tu-clave-anonima';
```

Reemplaza:
- `tu-proyecto-url.supabase.co` con la URL de tu proyecto
- `tu-clave-anonima` con la clave anónima que copiaste anteriormente

## 7. Probar la configuración

1. Abre el juego en un navegador.
2. Intenta registrar una nueva cuenta.
3. Inicia sesión con esa cuenta.
4. Juega algunas partidas para generar puntajes.
5. Verifica que los puntajes máximos se guarden y aparezcan en la tabla de clasificación.

## Solución de problemas

Si encuentras problemas con la autenticación o la actualización de puntajes, verifica:

1. Que las credenciales en el código sean correctas.
2. Que la tabla "perfiles" esté correctamente configurada.
3. Que las políticas RLS permitan las operaciones necesarias.
4. Revisa la consola del navegador para ver mensajes de error.

Para problemas más avanzados, puedes revisar los logs de Supabase en la sección "Database" → "Logs" del panel de control.

## Recursos adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de autenticación de Supabase](https://supabase.com/docs/guides/auth)
- [Guía de políticas RLS](https://supabase.com/docs/guides/auth/row-level-security)
# Juego de Tenis

Un juego simple de tenis desarrollado con HTML, CSS y JavaScript vanilla. Controla la raqueta con el ratón para evitar que la pelota caiga al suelo.

## Características

- Interfaz simple e intuitiva
- Sistema de puntuación
- Temporizador de juego
- Tres niveles de dificultad
- Tabla de mejores puntuaciones almacenada localmente
- Compatible con dispositivos móviles (control táctil)

## Ejecutar localmente

1. Clona este repositorio
2. Abre el archivo `index.html` en tu navegador
   
O también puedes usar el servidor local:

```
node server.js
```

Y luego abre http://localhost:3000 en tu navegador.

## Despliegue en Vercel

Para desplegar en Vercel, simplemente vincula este repositorio en tu cuenta de Vercel y despliega. La configuración necesaria ya está incluida en el archivo `vercel.json`.

## Instrucciones del juego

- Mueve el ratón horizontalmente para controlar la raqueta
- En dispositivos móviles, utiliza el dedo para controlar la raqueta
- Evita que la pelota toque el suelo
- Ganas puntos cada vez que la pelota rebota en tu raqueta
- El juego termina cuando la pelota toca el suelo o cuando se acaba el tiempo

## Tecnologías utilizadas

- HTML5 Canvas
- CSS3
- JavaScript (ES6+)
- LocalStorage para almacenar puntuaciones

## Cambios recientes

Esta versión del juego ahora utiliza:
- HTML5 Canvas para mejorar el rendimiento y los gráficos
- LocalStorage para almacenar puntuaciones en lugar de Supabase
- Diseño responsive para dispositivos móviles
- Soporte para eventos táctiles
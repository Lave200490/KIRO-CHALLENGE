# CODE_QUEST — Semana de Retos

Aplicación web interactiva de puzzles de programación. El jugador recorre 7 niveles (uno por cada día de la semana), ordenando bloques conceptuales en la secuencia correcta y ganando créditos al completar cada nivel.

## Descripción

CODE_QUEST es un juego educativo de una sola página (`index.html`) ambientado en una estética de terminal retro. Cada día presenta un puzzle temático sobre conceptos de ingeniería de software. El jugador selecciona e intercambia bloques hasta ordenarlos correctamente, luego valida la solución para avanzar al siguiente día.

La aplicación funciona completamente en el navegador, sin servidor backend ni base de datos. El único servidor necesario es un servidor HTTP estático para servir el archivo.

## Funcionalidades

### 7 días de puzzles

| Día | Tema | Bloques |
|-----|------|---------|
| Lunes | Flujo de desarrollo basado en especificaciones | Definición de Requisitos → Diseño Técnico → Planificación → Despliegue |
| Martes | Automatización con Hooks de Kiro | Editor JSON de hooks con validación en tiempo real |
| Miércoles | Ciclo de vida del Software | Análisis → Desarrollo → Pruebas → Mantenimiento |
| Jueves | Pipeline de CI/CD | Commit → Build → Test → Deploy |
| Viernes | Modelo de capas de una API REST | Cliente → Controlador → Servicio → Repositorio |
| Sábado | Flujo de autenticación JWT | Login → Verificación → Emisión → Autorización |
| Domingo | Estrategia de resolución de bugs | Reproducción → Diagnóstico → Corrección → Verificación |

### Sistema de puzzles (Lunes, Miércoles–Domingo)

- Los 4 bloques se presentan en orden aleatorio al iniciar cada nivel.
- El jugador hace clic en un bloque para seleccionarlo (se resalta) y en otro para intercambiarlos.
- Al hacer clic sobre el bloque ya seleccionado, se deselecciona sin cambios.
- El botón **Validar Solución** comprueba el orden. Si es correcto aparece el modal de éxito; si no, se muestra el mensaje de error.
- El error desaparece automáticamente al realizar el siguiente intercambio.

### Sistema de puzzles (Martes)

- Se muestra un editor JSON con la estructura de un hook de Kiro.
- El editor valida el JSON en tiempo real (debounced 400 ms) y reporta errores específicos en la consola integrada.
- El botón **Probar e Instalar Hook** valida los campos requeridos (`version`, `hooks[].trigger`, `hooks[].action`). Si es válido, simula la instalación.

### Sistema de créditos

- Cada nivel completado suma **+250 créditos** al contador global.
- El contador se actualiza en el header en tiempo real.
- Máximo posible al completar los 7 días: **1 750 créditos**.

### Progreso y desbloqueo

- Los días se desbloquean en secuencia: completar un día habilita el siguiente.
- Las barras del header reflejan el estado de cada día: activo (violeta pulsante), completado (violeta sólido), bloqueado (gris).
- La franja del header muestra el nombre y la fecha del día activo.
- La fecha del día activo inicial se lee del reloj del dispositivo.

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 / CSS3 | Estructura y estilos de la aplicación |
| JavaScript (ES6+) | Lógica de la aplicación (`index.html`) |
| Tailwind CSS (CDN) | Utilidades CSS |
| JetBrains Mono (Google Fonts) | Tipografía |
| Node.js | Entorno de ejecución para tests |
| Jest 29 | Framework de tests |
| fast-check 3.19 | Property-based testing |
| Babel | Transpilación para Jest |
| http-server | Servidor HTTP estático para desarrollo |

No se utiliza React, Python, FastAPI, Docker ni AWS en la versión actual.

## Estructura del proyecto

```
challenge-kiro/
├── index.html              # Aplicación completa (HTML + CSS + JS)
├── package.json            # Dependencias y scripts
├── package-lock.json       # Lockfile de dependencias
├── jest.config.js          # Configuración de Jest
├── babel.config.js         # Configuración de Babel para Jest
├── agents.json             # Configuración del agente Kiro
├── .gitignore              # Archivos excluidos de Git
├── docs/
│   └── ARCHITECTURE.md     # Documentación de arquitectura
└── __tests__/
    └── puzzle.test.js      # Suite de tests (90 tests)
```

## Requisitos

- **Node.js 18+** (para ejecutar los tests)
- **npm** (incluido con Node.js)
- **npx** (incluido con npm 5.2+)
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

No se necesita Python, backend ni base de datos.

## Instalación

```bash
git clone https://github.com/[tu-usuario]/challenge-kiro.git
cd challenge-kiro
npm install
```

## Ejecución

### Aplicación en el navegador

```bash
npx http-server . -p 8080 -c-1
```

Luego abre en el navegador:

```
http://localhost:8080
```

La opción `-c-1` desactiva la caché del servidor para que los cambios se reflejen inmediatamente.

### Alternativa: abrir directamente

También puedes abrir `index.html` directamente en el navegador con `Ctrl+O` (o `Cmd+O` en macOS), aunque algunos navegadores restringen funcionalidades en el protocolo `file://`.

## Tests

```bash
npm test
```

Resultado esperado:

```
Tests:       90 passed, 90 total
Test Suites: 1 passed, 1 total
```

Los tests cubren la lógica de los 7 días:
- Disponibilidad de los módulos bajo `window.__TESTING__`
- Correctitud de las secuencias (`CORRECT_SEQUENCE`) de cada día
- `shuffleBlocks`: permutación válida, inmutabilidad del input
- `validateSolution`: correcto para todas las permutaciones posibles (property-based, 100 runs)
- `swapBlocks`: intercambio exacto de posiciones, guard de índice fuera de rango
- `handleBlockClick`: selección, deselección, intercambio
- `showError` / `hideError`: visibilidad y contenido del mensaje
- `showSuccess`: visibilidad del modal y actualización de créditos
- `getDayName` / `formatDate`: helpers de fecha
- Créditos: incremento exacto de 250 por éxito (property-based, 100 runs)

## Funcionalidades verificadas

Comprobadas manualmente en el navegador y mediante la suite de tests automáticos:

- ✅ **Lunes**: puzzle activo al cargar, selección/intercambio/validación/error/éxito/créditos
- ✅ **Martes**: se desbloquea al completar Lunes, editor JSON con validación en tiempo real
- ✅ **Miércoles**: se desbloquea al completar Martes, puzzle de 4 bloques funcional
- ✅ **Jueves**: se desbloquea al completar Miércoles, puzzle de 4 bloques funcional
- ✅ **Viernes**: se desbloquea al completar Jueves, puzzle de 4 bloques funcional
- ✅ **Sábado**: se desbloquea al completar Viernes, puzzle de 4 bloques funcional
- ✅ **Domingo**: se desbloquea al completar Sábado, puzzle de 4 bloques funcional

## Flujo de la aplicación

```
Lunes → Martes → Miércoles → Jueves → Viernes → Sábado → Domingo
```

1. Al cargar la página, solo el Lunes está activo; los demás aparecen bloqueados con overlay.
2. Al completar un día, aparece un modal de éxito con el botón "Ir al nivel del [siguiente día]".
3. Al hacer clic en ese botón, el modal se cierra, la página hace scroll al día siguiente y se desbloquea.
4. La barra del header actualiza el día activo y marca el día anterior como completado.
5. Al completar el Domingo aparece el mensaje "Semana completada".

## Créditos

El sistema de créditos es global y acumulativo durante la sesión:

```js
window.gameCredits.get()      // obtener valor actual
window.gameCredits.add(250)   // sumar 250 al completar un nivel
window.gameCredits.set(n)     // establecer un valor específico
```

El display en el header se actualiza en tiempo real y muestra el valor con padding de 3 dígitos mínimo (ej: `000`, `250`, `1750`).

Los créditos no se persisten entre sesiones (no hay localStorage ni backend).

## Solución del puzzle

**Selección e intercambio:**
1. Clic en un bloque → queda resaltado (borde y fondo violeta).
2. Clic en otro bloque → los dos se intercambian y la selección se limpia.
3. Clic en el mismo bloque seleccionado → se deselecciona sin cambios.

**Validación:**
- `validateSolution()` compara el orden actual de `PuzzleState.blocks` con `CORRECT_SEQUENCE` posición a posición.
- Devuelve `true` solo si todos los IDs coinciden en el mismo orden.

**Shuffle inicial:**
- `shuffleBlocks(arr)` aplica Fisher-Yates sobre una copia del array.
- Garantiza que el resultado inicial no sea idéntico al orden correcto (reintenta hasta 10 veces).
- La función original no muta el input.

## Desarrollo

Para trabajar sobre el proyecto:

```bash
# Instalar dependencias
npm install

# Ejecutar tests en modo único
npm test

# Levantar servidor de desarrollo
npx http-server . -p 8080 -c-1
```

La lógica completa de la aplicación está en el bloque `<script>` al final de `index.html`. No hay proceso de build ni bundler: los cambios en `index.html` se reflejan al recargar el navegador.

Los tests están en `__tests__/puzzle.test.js`. Para añadir tests de un nuevo día, expón su módulo bajo `window.__TESTING__` en `index.html` y añade los elementos DOM necesarios al `MINIMAL_DOM` del archivo de tests.

## Estado del proyecto

**✅ Funcional y listo para entrega.**

- 7 días implementados y verificados
- 90 tests pasando (0 fallos)
- Aplicación ejecutable sin configuración adicional
- Sin dependencias de producción (solo devDependencies para testing)

## Limitaciones

- Los créditos no se persisten entre sesiones de navegador.
- La aplicación no tiene sistema de login ni perfiles de usuario.
- El contenido de los puzzles está codificado directamente en `index.html` (no hay API ni CMS).
- El servidor `http-server` es solo para desarrollo; para producción se necesitaría un servidor web real (nginx, Apache, etc.) o un hosting estático (GitHub Pages, Netlify, etc.).
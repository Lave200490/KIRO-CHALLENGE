# Implementation Plan: monday-level-screen

## Overview

Implementación incremental del puzzle interactivo del nivel "Lunes" sobre el archivo `index.html` existente. El plan cubre tres fases: (1) preparar la estructura HTML con los IDs requeridos por el script, (2) implementar el bloque `<script>` con toda la lógica del puzzle organizada por capas (estado → lógica pura → renderizado → event handlers → arranque), y (3) conectar el modal de éxito y el botón de validación para completar el flujo end-to-end.

La suite de tests se ejecuta en Node.js con **Jest** + **fast-check** (instalados como devDependencies) apuntando a las funciones expuestas en `window.PuzzleModule` via JSDOM.

---

## Tasks

- [ ] 1. Preparar la estructura HTML en `index.html`
  - Añadir el atributo `id="assembly-area"` al contenedor del área de ensamblaje ya existente.
  - Añadir el elemento `<span id="credits-display">0</span>` dentro del Contador_Créditos existente.
  - Añadir el elemento `<div id="error-message" class="hidden"></div>` inmediatamente debajo del área de ensamblaje.
  - Añadir el botón `<button id="validate-btn">Validar Solución</button>` debajo del área de ensamblaje con estilos Tema_Terminal.
  - Añadir el overlay `<div id="modal-exito" class="hidden"></div>` con el botón `<button id="next-level-btn">Ir al nivel del Martes</button>` en su interior.
  - Verificar que `window.gameCredits = 0` está declarado en un `<script>` inline antes del script principal.
  - _Requirements: 4.1, 4.2, 4.3, 5.2, 9.1, 10.3_

- [ ] 2. Implementar estado y constantes del puzzle
  - [ ] 2.1 Definir `CORRECT_SEQUENCE` y `CREDITS_REWARD` como constantes globales en el bloque `<script>`
    - Usar `Object.freeze` sobre `CORRECT_SEQUENCE` para evitar mutaciones accidentales.
    - Los cuatro bloques son: `block-1` "Definición de Requisitos", `block-2` "Diseño Técnico", `block-3` "Planificación de Implementación", `block-4` "Despliegue".
    - `CREDITS_REWARD = 250`.
    - _Requirements: 7.1, 7.3, 10.2_

  - [ ] 2.2 Definir el objeto `PuzzleState` con campos `blocks` y `selectedIndex`
    - `blocks: []` — array mutable del orden actual de bloques.
    - `selectedIndex: null` — índice del bloque actualmente seleccionado.
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 2.3 Exponer `window.PuzzleModule` bajo la guarda `window.__TESTING__ === true`
    - Exportar: `shuffleBlocks`, `validateSolution`, `swapBlocks`, `handleBlockClick`, `PuzzleState`, `CORRECT_SEQUENCE`, `CREDITS_REWARD`.
    - _Requirements: (soporte a tests — sin req. directo)_

- [ ] 3. Implementar `shuffleBlocks` (función pura)
  - [ ] 3.1 Implementar el algoritmo Fisher-Yates sobre una copia del array de entrada
    - No mutar el array original; retornar un nuevo array.
    - _Requirements: 7.2_

  - [ ]* 3.2 Escribir property test para `shuffleBlocks`
    - **Property 4: El shuffle produce siempre una permutación válida**
    - Generador: ejecución repetida de `shuffleBlocks(CORRECT_SEQUENCE)`.
    - Aserciones: longitud === 4, mismos `id`s, sin duplicados.
    - **Validates: Requirements 7.2**

- [ ] 4. Implementar `renderBlocks`
  - [ ] 4.1 Implementar la función `renderBlocks()` que lee `PuzzleState.blocks` y reconstruye el HTML en `#assembly-area`
    - Limpiar el contenedor antes de insertar.
    - Cada bloque genera un elemento con `data-index` y la clase `.block-item`.
    - Aplicar la clase `.block-selected` al bloque cuyo índice sea `PuzzleState.selectedIndex`.
    - Estilos: fondo oscuro, texto blanco/gris claro, borde violeta neón (`#6b21a8`), fuente ≥ 14 px.
    - _Requirements: 7.4, 7.5, 8.1, 8.5_

- [ ] 5. Implementar `handleBlockClick` y `swapBlocks`
  - [ ] 5.1 Implementar `swapBlocks(i, j)` que intercambia posiciones en `PuzzleState.blocks`
    - Validar que `i` y `j` estén en rango (0–3); emitir `console.error` y abortar si no.
    - Mutar el array de estado y llamar a `renderBlocks()`.
    - _Requirements: 8.2_

  - [ ]* 5.2 Escribir property test para `swapBlocks`
    - **Property 6: El swap intercambia exactamente las posiciones indicadas y deselecciona**
    - Generador: `fc.tuple(fc.integer({min:0,max:3}), fc.integer({min:0,max:3})).filter(([i,j])=>i!==j)`.
    - Aserciones: posiciones intercambiadas, resto sin cambios, `selectedIndex === null`.
    - **Validates: Requirements 8.2**

  - [ ] 5.3 Implementar `handleBlockClick(index)` con la máquina de estados
    - Si `selectedIndex === null` → seleccionar.
    - Si `selectedIndex === index` → deseleccionar (toggle).
    - Si `selectedIndex !== index` → llamar a `swapBlocks(selectedIndex, index)`, deseleccionar, llamar a `hideError()`.
    - Operación de swap + render debe completarse en ≤ 200 ms.
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 11.3_

  - [ ]* 5.4 Escribir property test para `handleBlockClick` — selección y deselección
    - **Property 5: El click en un bloque implementa la selección y deselección correctamente**
    - Generador: `fc.integer({min:0, max:3})`.
    - Aserciones: `selectedIndex` correcto tras select; `selectedIndex === null` y `blocks` sin cambio tras deselect.
    - **Validates: Requirements 8.1, 8.3**

  - [ ]* 5.5 Escribir property test para invariante de permutación
    - **Property 7: Los bloques son siempre una permutación válida del conjunto original**
    - Generador: `fc.array(fc.integer({min:0,max:3}), {minLength:0, maxLength:20})` → secuencia de clics.
    - Aserción: `PuzzleState.blocks` contiene exactamente los 4 `id`s de `CORRECT_SEQUENCE`.
    - **Validates: Requirements 8.4, 11.2**

- [ ] 6. Checkpoint — prueba parcial del puzzle
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implementar `validateSolution`
  - [ ] 7.1 Implementar `validateSolution()` como función pura que compara `PuzzleState.blocks` con `CORRECT_SEQUENCE` por `id`
    - Retorna `true` solo si todos los `id`s coinciden posicionalmente.
    - _Requirements: 9.3_

  - [ ]* 7.2 Escribir property test para `validateSolution`
    - **Property 8: `validateSolution` es correcta para toda permutación posible**
    - Generador: `fc.shuffledSubarray(CORRECT_SEQUENCE, {minLength:4, maxLength:4})`.
    - Aserción: `true` ↔ deep equal con `CORRECT_SEQUENCE`; `false` para las 23 restantes.
    - **Validates: Requirements 9.3**

- [ ] 8. Implementar `showError`, `hideError` y `showSuccess`
  - [ ] 8.1 Implementar `showError()` que muestra `#error-message` con el texto de error
    - Texto: `ERROR:: Error de especificación: secuencia lógica alterada`.
    - Estilo: texto rojo, fondo oscuro, tipografía monoespaciada (Tema_Terminal).
    - Debe aparecer dentro de los 300 ms siguientes a la validación.
    - _Requirements: 11.1, 11.4_

  - [ ] 8.2 Implementar `hideError()` que oculta `#error-message`
    - _Requirements: 11.3_

  - [ ] 8.3 Implementar `showSuccess()` que incrementa créditos y muestra el modal
    - Leer `window.gameCredits`; si no está definido, inicializar a 0 y emitir `console.warn`.
    - Incrementar en `CREDITS_REWARD` (250) y actualizar `#credits-display` en ≤ 200 ms.
    - Mostrar `#modal-exito` dentro de los 300 ms siguientes a la validación.
    - _Requirements: 10.1, 10.2, 10.4_

  - [ ]* 8.4 Escribir property test para crédito en éxito
    - **Property 9: El éxito incrementa los créditos en exactamente 250**
    - Generador: `fc.integer({min:0, max:100000})` → valor inicial de `window.gameCredits`.
    - Aserción: `credits_after === credits_before + 250`.
    - **Validates: Requirements 10.2**

  - [ ]* 8.5 Escribir property test para `#credits-display`
    - **Property 3: El crédito mostrado refleja exactamente el valor asignado**
    - Generador: `fc.integer({min:0, max:100000})`.
    - Aserción: `#credits-display.textContent == c`.
    - **Validates: Requirements 4.6**

  - [ ]* 8.6 Escribir property test para error en permutaciones incorrectas
    - **Property 10: El error se muestra para toda permutación incorrecta**
    - Generador: todas las permutaciones != `CORRECT_SEQUENCE`.
    - Aserción: `#error-message` visible y contiene `"ERROR::"`.
    - **Validates: Requirements 11.1**

  - [ ]* 8.7 Escribir property test para ocultación del error al hacer swap
    - **Property 11: El mensaje de error se oculta al realizar cualquier swap**
    - Generador: permutación incorrecta + par de índices `(i, j)` con `i ≠ j`.
    - Aserción: `#error-message` oculto tras `handleBlockClick(i)` + `handleBlockClick(j)`.
    - **Validates: Requirements 11.3**

- [ ] 9. Implementar `handleValidate` y registrar todos los event listeners en `initPuzzle`
  - [ ] 9.1 Implementar `handleValidate()` como event handler del botón "Validar Solución"
    - Llama a `validateSolution()` y enruta a `showSuccess()` o `showError()`.
    - Respuesta en ≤ 300 ms desde el clic.
    - Si `#validate-btn` no existe en el DOM, emitir `console.warn` y no registrar el listener.
    - _Requirements: 9.3, 9.5_

  - [ ] 9.2 Implementar `initPuzzle()` que orquesta el arranque completo
    - Verificar que `#assembly-area` existe; abortar con `console.error` si no.
    - Llamar a `shuffleBlocks(CORRECT_SEQUENCE)` y guardar el resultado en `PuzzleState.blocks`.
    - Llamar a `renderBlocks()`.
    - Registrar click listeners en cada bloque (delegación de evento en `#assembly-area`).
    - Registrar click listener en `#validate-btn`.
    - Registrar click listener en `#next-level-btn` para la navegación al nivel del martes.
    - _Requirements: 7.2, 9.2, 10.3, 10.5_

  - [ ] 9.3 Invocar `initPuzzle()` desde el evento `DOMContentLoaded`
    - _Requirements: 7.1, 7.2_

- [ ] 10. Implementar la `Barra_Progreso` dinámica
  - [ ] 10.1 Extraer las funciones puras `getDayName(date)` y `formatDate(date)` que leen la fecha del dispositivo
    - `formatDate` retorna la cadena `DD/M` (ej.: `07/6`).
    - `getDayName` retorna el nombre del día en español (ej.: `Lunes`).
    - Leer la fecha una sola vez con `new Date()` al inicio y pasarla como argumento.
    - _Requirements: 2.2, 2.3_

  - [ ] 10.2 Aplicar los estilos de día activo, días pasados y días futuros en la `Barra_Progreso`
    - Día activo: clase de resaltado (mayor peso tipográfico o indicador de subrayado).
    - Días futuros: opacidad reducida (Req 2.5).
    - _Requirements: 2.4, 2.5_

  - [ ]* 10.3 Escribir property test para visualización de fecha
    - **Property 1: La visualización de fecha coincide con la fecha del dispositivo**
    - Generador: `fc.date()`.
    - Aserciones: `formatDate(d) === expectedDDM` y `getDayName(d) === expectedName`.
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 10.4 Escribir property test para estilos de días de la semana
    - **Property 2: Los estilos de los días de la semana reflejan el estado del día activo**
    - Generador: `fc.integer({min:0, max:6})` → índice del día activo.
    - Aserciones: clase activa solo en el día `d`; completados en `< d`; opacidad reducida en `> d`.
    - **Validates: Requirements 2.4, 2.5**

- [ ] 11. Checkpoint final — integración completa
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido.
- Cada tarea referencia los requisitos específicos para trazabilidad completa con `requirements.md`.
- Los property tests utilizan **fast-check** con mínimo 100 iteraciones por propiedad.
- Cada property test debe incluir el comentario: `// Feature: monday-level-screen, Property N: <texto>`.
- El script JS se implementa íntegramente en un bloque `<script>` al final de `index.html` (sin bundler, sin módulos ES).
- `window.PuzzleModule` solo se expone bajo `window.__TESTING__ === true` para no contaminar el entorno de producción.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2"] },
    { "id": 1, "tasks": ["2.3", "3.1"] },
    { "id": 2, "tasks": ["3.2", "4.1"] },
    { "id": 3, "tasks": ["5.1", "5.3"] },
    { "id": 4, "tasks": ["5.2", "5.4", "5.5", "7.1"] },
    { "id": 5, "tasks": ["7.2", "8.1", "8.2", "8.3"] },
    { "id": 6, "tasks": ["8.4", "8.5", "8.6", "8.7", "9.1"] },
    { "id": 7, "tasks": ["9.2", "9.3"] },
    { "id": 8, "tasks": ["10.1", "10.2"] },
    { "id": 9, "tasks": ["10.3", "10.4"] }
  ]
}
```

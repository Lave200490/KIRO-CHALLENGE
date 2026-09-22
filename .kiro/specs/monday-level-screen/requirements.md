# Requirements Document

## Introduction

La pantalla de inicio del nivel "Lunes" es la pantalla principal que se muestra al jugador cuando accede al nivel del día lunes en un juego de programación basado en retos. La pantalla presenta la especificación del reto del día, el progreso semanal, el contador de créditos disponibles, y un área de ensamblaje donde el jugador resolverá el puzzle. La implementación utiliza HTML puro con Tailwind CSS cargado desde CDN.

El área de ensamblaje alberga un puzzle interactivo implementado en JavaScript vainilla: el jugador debe ordenar bloques de código desordenados que representan las etapas del proceso de desarrollo de software. El puzzle incluye mecanismo de selección secuencial de bloques, validación de la solución contra una secuencia correcta predefinida, recompensa de créditos en caso de éxito y retroalimentación de error en caso de secuencia incorrecta.

## Glossary

- **Pantalla_Lunes**: La pantalla HTML completa que representa el nivel del día lunes.
- **Barra_Progreso**: El componente superior que muestra el día actual dentro de la semana y la fecha.
- **Tarjeta_Especificación**: El panel central que contiene el título y la descripción del reto del nivel.
- **Contador_Creditos**: El elemento visual en la esquina superior que muestra la cantidad acumulada de créditos del jugador.
- **Área_Ensamblaje**: El contenedor estilizado vacío donde el jugador interactuará con el puzzle de código.
- **Tema_Terminal**: El sistema visual oscuro con fondo negro puro (#000), bordes en violeta neón (#6b21a8) y texto en blanco o gris claro.
- **Puzzle**: El mecanismo interactivo de ordenamiento de bloques implementado en JavaScript vainilla dentro del Área_Ensamblaje.
- **Bloque_Codigo**: Cada uno de los elementos visuales e interactivos del Puzzle que representan una etapa del proceso de desarrollo de software y que el jugador puede seleccionar e intercambiar.
- **Botón_Validar**: El control interactivo que dispara la comparación del orden actual de los Bloque_Codigo contra la secuencia correcta predefinida.
- **Modal_Exito**: El componente superpuesto que se muestra cuando la validación del Puzzle produce un resultado correcto.
- **Mensaje_Error**: El elemento inline que se muestra cuando la validación del Puzzle produce un resultado incorrecto, con estética de consola de terminal.

---

## Requirements

### Requerimiento 1: Tema Visual de Terminal

**User Story:** Como jugador, quiero que la pantalla tenga una estética oscura de terminal de desarrollador, para que la experiencia visual sea inmersiva y coherente con el contexto del juego de programación.

#### Criterios de Aceptación

1. THE Pantalla_Lunes SHALL aplicar un fondo de color negro puro (`#000000`) a toda la superficie visible de la pantalla.
2. THE Pantalla_Lunes SHALL renderizar todos los textos principales en color blanco (`#ffffff`) o gris claro (`#d1d5db`) sobre el fondo oscuro.
3. THE Pantalla_Lunes SHALL aplicar bordes en color violeta neón (`#6b21a8`) a las tarjetas y contenedores destacados.
4. THE Pantalla_Lunes SHALL cargar Tailwind CSS exclusivamente desde su CDN sin depender de ningún proceso de build local.
5. THE Pantalla_Lunes SHALL renderizarse correctamente como un único archivo HTML autocontenido sin dependencias de archivos externos adicionales.
6. IF Tailwind CSS no carga desde el CDN, THEN THE Pantalla_Lunes SHALL aplicar estilos en línea o embebidos que preserven los colores de fondo (#000000), borde (#6b21a8) y texto (#ffffff o #d1d5db) definidos en el Tema_Terminal.

---

### Requerimiento 2: Barra Superior de Progreso Semanal

**User Story:** Como jugador, quiero ver una barra de progreso en la parte superior que indique el día actual de la semana y la fecha, para saber en qué punto del ciclo semanal me encuentro.

#### Criterios de Aceptación

1. THE Barra_Progreso SHALL mostrarse en la parte superior de la Pantalla_Lunes, ocupando el ancho completo del viewport.
2. WHEN la Pantalla_Lunes se renderiza, THE Barra_Progreso SHALL mostrar el nombre del día de la semana correspondiente a la fecha actual del dispositivo como etiqueta del día activo.
3. WHEN la Pantalla_Lunes se renderiza, THE Barra_Progreso SHALL mostrar la fecha actual del dispositivo junto al nombre del día activo en formato DD/M.
4. THE Barra_Progreso SHALL diferenciar visualmente el día activo de los días restantes de la semana mostrando el día activo con un estilo de resaltado distinto (por ejemplo, mayor peso tipográfico o indicador de subrayado) y los días inactivos con un estilo uniforme atenuado.
5. THE Barra_Progreso SHALL listar los siete días de la semana de Lunes a Domingo, diferenciando visualmente los días anteriores al día activo de los días posteriores al día activo mediante un estilo de opacidad reducida para los días no completados futuros.

---

### Requerimiento 3: Tarjeta Central de Especificación del Reto

**User Story:** Como jugador, quiero ver una tarjeta central con el título y la descripción del reto, para entender qué debo resolver antes de comenzar a ensamblar código.

#### Criterios de Aceptación

1. THE Tarjeta_Especificación SHALL mostrarse en el área central de la Pantalla_Lunes con bordes en el color violeta neón definido por el Tema_Terminal.
2. THE Tarjeta_Especificación SHALL mostrar el título "Desarrollo basado en especificaciones" como el encabezado de mayor jerarquía visual dentro de la tarjeta.
3. THE Tarjeta_Especificación SHALL mostrar una descripción textual estática del reto de no más de 500 caracteres que explique el objetivo que el jugador debe cumplir.
4. THE Tarjeta_Especificación SHALL aplicar el Tema_Terminal con fondo oscuro y texto con contraste suficiente para ser legible sobre el fondo oscuro.
5. WHEN la Pantalla_Lunes se carga en el navegador, THE Tarjeta_Especificación SHALL ser completamente visible dentro del viewport sin necesidad de hacer scroll.

---

### Requerimiento 4: Contador de Créditos

**User Story:** Como jugador, quiero ver un contador de créditos visible en la esquina superior de la pantalla, para tener conciencia de mis recursos disponibles durante el nivel.

#### Criterios de Aceptación

1. THE Contador_Creditos SHALL mostrarse en la esquina superior derecha de la Pantalla_Lunes, dentro de la Barra_Progreso o en posición fija adyacente sin superponerse a otros elementos.
2. THE Contador_Creditos SHALL mostrar el valor numérico inicial de `0` al cargarse la Pantalla_Lunes.
3. THE Contador_Creditos SHALL incluir la etiqueta textual "Créditos" o "CRÉDITOS" para identificar el elemento.
4. THE Contador_Creditos SHALL aplicar los colores de texto y fondo definidos en el Tema_Terminal.
5. THE Contador_Creditos SHALL permanecer visible en pantalla sin ser ocultado por otros elementos del layout.
6. WHEN el valor de créditos cambia, THE Contador_Creditos SHALL actualizarse dentro de los 200ms siguientes al cambio mostrando únicamente enteros no negativos.

---

### Requerimiento 5: Área de Ensamblaje de Código

**User Story:** Como jugador, quiero ver un área de ensamblaje claramente identificada y estilizada en la pantalla, para saber dónde interactuaré con el puzzle de código cuando el nivel esté activo.

#### Criterios de Aceptación

1. THE Área_Ensamblaje SHALL mostrarse en la Pantalla_Lunes como un contenedor con borde visible y color de fondo distinto al del fondo general de la pantalla.
2. THE Área_Ensamblaje SHALL mostrar de forma permanente la etiqueta "Área de Ensamblaje de Código" para identificar su propósito al jugador.
3. WHEN la Pantalla_Lunes termina de cargarse en el navegador, THE Área_Ensamblaje SHALL no contener ningún elemento interactivo accionable en su interior.
4. THE Área_Ensamblaje SHALL aplicar el Tema_Terminal con bordes en el color violeta neón y fondo oscuro definidos por el Tema_Terminal.
5. THE Área_Ensamblaje SHALL ocupar al menos el 40% del alto del área de contenido disponible debajo de la Barra_Progreso.
6. WHEN la Pantalla_Lunes se carga en el navegador, THE Área_Ensamblaje SHALL ser visible sin necesidad de hacer scroll horizontal ni vertical.

---

### Requerimiento 6: Estructura y Composición del Layout

**User Story:** Como jugador, quiero que todos los elementos de la pantalla estén distribuidos de forma clara y legible en el viewport, para poder orientarme rápidamente al iniciar el nivel.

#### Criterios de Aceptación

1. THE Pantalla_Lunes SHALL organizar sus elementos en una estructura vertical con la Barra_Progreso en la parte superior, la Tarjeta_Especificación en el centro y el Área_Ensamblaje en la parte inferior.
2. THE Pantalla_Lunes SHALL mantener todos sus elementos dentro de los límites del viewport sin desbordamiento horizontal.
3. THE Pantalla_Lunes SHALL aplicar el mismo valor de separación entre cada par de componentes principales adyacentes, sin solapamiento entre ellos y sin adyacencia de cero separación.
4. WHEN la Pantalla_Lunes se renderiza en un viewport de al menos 1024px de ancho, THE Pantalla_Lunes SHALL mostrar todos los componentes principales sin truncamiento de texto.
5. IF el contenido de la Tarjeta_Especificación supera la altura visible del viewport, THEN THE Pantalla_Lunes SHALL permitir scroll vertical para acceder al resto del contenido.
6. WHEN la Pantalla_Lunes se renderiza en un viewport con ancho inferior a 1024px, THE Pantalla_Lunes SHALL mantener la estructura vertical de los componentes sin desbordamiento horizontal y habilitando scroll vertical si el contenido lo requiere.

---

### Requerimiento 7: Bloques de Código del Puzzle

**User Story:** Como jugador, quiero ver un conjunto de bloques de código desordenados dentro del Área de Ensamblaje, para identificar las piezas que debo ordenar antes de validar mi solución.

#### Criterios de Aceptación

1. WHEN la Pantalla_Lunes termina de cargarse, THE Área_Ensamblaje SHALL mostrar entre 3 y 4 bloques de código que representan etapas del proceso de desarrollo de software (por ejemplo: "Definición de requisitos", "Diseño técnico", "Planificación de implementación", "Despliegue").
2. WHEN la Pantalla_Lunes se carga, THE Puzzle SHALL presentar los bloques de código en un orden aleatorio distinto al orden correcto predefinido con una probabilidad de al menos el 83% (5 de 6 permutaciones posibles para 3 bloques, o proporcional para 4).
3. THE Puzzle SHALL definir internamente una única secuencia correcta fija que represente el flujo lógico del proceso de desarrollo de software.
4. THE Bloque_Codigo SHALL aplicar el Tema_Terminal con fondo oscuro, texto en blanco o gris claro y borde en violeta neón, diferenciándose visualmente del fondo del Área_Ensamblaje.
5. THE Bloque_Codigo SHALL mostrar su etiqueta textual descriptiva de la etapa que representa, con un tamaño de fuente legible de al menos 14px.

---

### Requerimiento 8: Mecanismo de Ordenamiento

**User Story:** Como jugador, quiero poder seleccionar y reordenar los bloques de código dentro del Área de Ensamblaje, para construir la secuencia que considero correcta antes de validar.

#### Criterios de Aceptación

1. WHEN el jugador hace clic en un Bloque_Codigo sin ningún bloque previamente seleccionado, THE Puzzle SHALL marcar ese bloque como seleccionado y aplicar un estilo visual de selección activa (por ejemplo, borde o fondo en un color de acento distinto al violeta neón por defecto).
2. WHEN el jugador hace clic en un segundo Bloque_Codigo mientras otro bloque está seleccionado, THE Puzzle SHALL intercambiar las posiciones de ambos bloques dentro del Área_Ensamblaje y deseleccionar ambos en un máximo de 200ms tras el segundo clic.
3. WHEN el jugador hace clic en el mismo Bloque_Codigo que ya está seleccionado, THE Puzzle SHALL deseleccionar ese bloque sin modificar ninguna posición.
4. THE Puzzle SHALL permitir que el jugador realice cualquier cantidad de intercambios antes de validar la solución sin reiniciar el estado del puzzle.
5. WHILE un Bloque_Codigo está en estado seleccionado, THE Puzzle SHALL mantener el estilo visual de selección activa hasta que ocurra un intercambio o una deselección.

---

### Requerimiento 9: Validación de la Solución

**User Story:** Como jugador, quiero poder validar el orden actual de mis bloques con un botón dedicado, para recibir retroalimentación inmediata sobre si mi secuencia es correcta.

#### Criterios de Aceptación

1. THE Botón_Validar SHALL mostrarse dentro o inmediatamente debajo del Área_Ensamblaje con la etiqueta textual "Validar Solución".
2. WHILE el Puzzle está activo, THE Botón_Validar SHALL permanecer visible y accionable en todo momento sin ser ocultado por otros elementos.
3. WHEN el jugador hace clic en el Botón_Validar, THE Puzzle SHALL comparar el orden actual de los Bloque_Codigo con la secuencia correcta predefinida y producir un resultado de éxito o error en un máximo de 300ms.
4. THE Botón_Validar SHALL aplicar el Tema_Terminal con fondo oscuro y texto visible de alto contraste.
5. WHEN el Puzzle produce un resultado de validación, THE Botón_Validar SHALL permanecer visible para permitir reintentos salvo que el resultado sea de éxito y el jugador confirme avanzar al siguiente nivel.

---

### Requerimiento 10: Estado de Éxito

**User Story:** Como jugador, quiero recibir una confirmación visual clara cuando ordene correctamente los bloques y ver mis créditos incrementarse, para sentir que mi progresión en el juego avanza.

#### Criterios de Aceptación

1. WHEN el Puzzle produce un resultado de éxito, THE Modal_Exito SHALL mostrarse superpuesto a la pantalla con estética Tema_Terminal (fondo oscuro, bordes en violeta neón, texto en blanco) dentro de los 300ms siguientes a la validación.
2. WHEN el Modal_Exito se muestra, THE Contador_Creditos SHALL incrementarse en exactamente 250 créditos reflejando el nuevo valor en un máximo de 200ms.
3. WHEN el Modal_Exito se muestra, THE Modal_Exito SHALL incluir un botón con la etiqueta "Ir al nivel del Martes" que permita al jugador avanzar al siguiente nivel.
4. THE Modal_Exito SHALL mostrar un mensaje de confirmación que comunique al jugador que la secuencia es correcta.
5. WHEN el jugador hace clic en el botón "Ir al nivel del Martes" dentro del Modal_Exito, THE Pantalla_Lunes SHALL habilitar la navegación al nivel del Martes sin pérdida del estado de créditos acumulados.

---

### Requerimiento 11: Estado de Error

**User Story:** Como jugador, quiero recibir un mensaje de error claro con estilo consola cuando mi secuencia sea incorrecta, para entender que debo reintentar sin perder mi progreso.

#### Criterios de Aceptación

1. WHEN el Puzzle produce un resultado de error, THE Mensaje_Error SHALL mostrarse dentro o inmediatamente debajo del Área_Ensamblaje con texto en color rojo y el prefijo "ERROR::" seguido del mensaje "Error de especificación: secuencia lógica alterada", dentro de los 300ms siguientes a la validación.
2. WHEN el Mensaje_Error se muestra, THE Puzzle SHALL mantener los bloques en sus posiciones actuales sin reiniciar el orden ni la sesión del jugador.
3. WHEN el jugador realiza cualquier intercambio de bloques mientras el Mensaje_Error está visible, THE Puzzle SHALL ocultar el Mensaje_Error para indicar que el jugador está corrigiendo su solución.
4. THE Mensaje_Error SHALL aplicar fondo oscuro del Tema_Terminal y tipografía monoespaciada para preservar la estética de consola.
5. IF el jugador hace clic en el Botón_Validar mientras el Mensaje_Error está visible, THEN THE Puzzle SHALL ejecutar una nueva validación y reemplazar el Mensaje_Error con el resultado actualizado (éxito o error).

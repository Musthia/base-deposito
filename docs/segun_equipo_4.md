🎨 1. Temas y Colores: Profesionales y Limpios

Evita la fatiga visual limitando la paleta de colores. El contenido de los datos debe ser el protagonista. [[1](https://www.facebook.com/DataScienceResearch/posts/hola-datalover-te-dejamos-estos-5-errores-m%C3%A1s-comunes-en-la-creaci%C3%B3n-de-tus-dash/788432585192508/)]

* **Fondo:** Usa blanco puro (`#FFFFFF`) o gris muy claro (`#F8F9FA`) para el modo claro. Usa gris oscuro azulado (`#0F172A`) para el modo oscuro. Evita el negro puro. [[1](https://www.facebook.com/DataScienceResearch/posts/hola-datalover-te-dejamos-estos-5-errores-m%C3%A1s-comunes-en-la-creaci%C3%B3n-de-tus-dash/788432585192508/), [2](https://www.databricks.com/es/blog/design-beautiful-dashboards-aibi)]
* **Texto:** Aplica gris oscuro (`#1E293B`) para texto principal. Usa gris medio (`#64748B`) para etiquetas secundarias. Jamás uses negro puro sobre fondo blanco.
* **Color de Acento:** Elige un solo color de marca (azul o violeta digital son los más seguros) para elementos activos, enlaces y botones principales.
* **Colores de Estado:** Reserva el **Verde** estrictamente para éxito/positivo, **Amarillo** para advertencias y **Rojo** para errores o peligro.

---

🗂️ 2. Cards (Tarjetas): Estructura Dinámica

Las cards agrupan información relacionada. Actúan como contenedores visuales para escanear datos rápidamente. [[1](https://www.justinmind.com/es/ui-diseno/tarjetas)]

* **Bordes:** Usa esquinas redondeadas modernas de entre `8px` y `12px`.
* **Sombras:** Aplica sombras muy suaves y difusas (`box-shadow` sutil). Evita los bordes negros gruesos para separar elementos.
* **Margen Interno (Padding):** Mantén un espacio interno generoso y constante (mínimo `16px` o `24px`) en los cuatro lados.
* **Jerarquía Interna:** Coloca el título arriba a la izquierda en una tipografía pequeña pero en negrita. Abajo, muestra el dato principal en un tamaño grande. [[1](https://www.justinmind.com/es/ui-diseno/tarjetas)]

---

🔘 3. Botones: Claridad de Acción

Los botones deben guiar al usuario sin generar confusión sobre qué elemento es el más importante.

* **Jerarquía de Botones:** Usa un solo botón **Primario** (relleno con el color de acento) por sección para la acción principal. Usa botones **Secundarios** (con borde transparente o fondo gris claro) para acciones alternativas.
* **Tamaño del Texto:** Mantén las etiquetas cortas (máximo 2 palabras como "Exportar PDF" o "Guardar"). Usa verbos de acción directos. [[1](https://www.justinmind.com/es/blog/diseno-de-botones-sitios-web-aplicaciones-moviles/)]
* **Estados Visuales:** Diseña siempre el estado *Hover* (cambio leve de tono al pasar el cursor) y el estado *Disabled* (gris claro sin interacción para funciones no disponibles). [[1](https://revistas.usfx.bo/index.php/3r/article/download/1023/692/2687), [2](https://www.justinmind.com/es/blog/diseno-de-botones-sitios-web-aplicaciones-moviles/)]
* **Ubicación:** En formularios o modales, coloca los botones de confirmación abajo a la derecha.

---

📋 4. Listas y Tablas: Lectura Eficiente

Las listas albergan el volumen de datos del dashboard. Su prioridad absoluta es la claridad y el ordenamiento. [[1](https://blog.bismart.com/12-tips-para-crear-un-dashboard-cuadro-de-mando)]

* **Fila Alterna:** Usa fondos alternados sutiles (blanco y gris casi imperceptible) solo si la tabla tiene más de 10 columnas. Si no, usa líneas divisorias muy delgadas (`1px` gris claro).
* **Alineación:** Alinea el texto siempre a la izquierda. Alinea los números enteros, montos de dinero y fechas siempre a la derecha para facilitar la comparación visual.
* **Densidad:** Deja suficiente altura en cada fila (mínimo `48px`). El texto no debe tocar los bordes de la celda.
* **Datos Vacíos:** Si una celda no tiene información, no la dejes en blanco. Coloca un guion medio (`-`) centrado.

---

🔄 5. Flujo y Coherencia del Dashboard

El orden visual determina cómo el usuario consume la información de la pantalla.

* **Patrón de Lectura:** Diseña el flujo en forma de "Z" (de izquierda a derecha y de arriba a abajo). Coloca los filtros arriba, los resúmenes clave en el medio y el detalle de las listas abajo.
* **Espaciado Consistente:** Implementa un sistema de espaciado basado en múltiplos de 8 (`8px`, `16px`, `24px`, `32px`) para separar todos los componentes del diseño.
* **Filtros Visibles:** Coloca las herramientas de búsqueda y filtrado siempre en la parte superior derecha de las listas o dashboards. [[1](https://gempages.net/es/blogs/shopify/visual-hierarchy), [2](https://excelmatic.ai/es/blog/7-dashboard-design-best-practices/), [3](https://es.linkedin.com/posts/khernandezbrevis_aprendizajecontinuo-datalovers-dashboard-activity-7325338875369775104-X03M), [4](https://www.tiktok.com/@sebascoo/video/7296315185587965190)]

---


debes aplicar un diseño  **responsivo y adaptático (Responsive Design)** .

La regla de oro para el diseño multiplataforma es: **diseña primero pensando en el dedo (táctil) y el espacio se adaptará solo en la PC.**

---

📱 1. Cards Adaptables (Layout Flexible)

Las tarjetas deben dejar de tener anchos fijos y empezar a usar sistemas de rejilla elásticos (Grid o Flexbox).

* **De Columnas a Filas:** En PC, muestra las cards de KPI una al lado de la otra (ej. 4 columnas). En móviles, estas columnas deben colapsar automáticamente y mostrarse una debajo de la otra en una sola fila vertical. [[1](https://www.ionos.com/es-us/digitalguide/paginas-web/diseno-web/css-media-queries/)]
* **Scroll Horizontal:** Para gráficos o tarjetas secundarias en móviles, en lugar de apilarlas infinitamente hacia abajo, permite que el usuario se desplace de izquierda a derecha (carrusel táctil).

---

🔘 2. Botones y Áreas Táctiles (Touch Targets)

El mouse es ultra preciso (un píxel), pero el dedo humano no lo es. Un botón pequeño en móvil frustra al usuario.

* **Tamaño Mínimo:** Todo botón, enlace o elemento interactivo debe medir **mínimo 44x44 píxeles** (o 48x48px según Google). Aunque el icono sea chico, el área invisible para presionar debe ser grande. [[1](https://olgacarreras.blogspot.com/2017/04/wcag-21-medida-provisional-hasta-las.html)]
* **Separación Anti-Error:** Deja al menos `8px` de separación entre botones. Si pegas el botón "Eliminar" al de "Editar", el usuario de pantalla táctil cometerá errores costosos.
* **Adiós al Hover Exclusivo:** En pantallas táctiles el estado *Hover* (pasar el cursor por encima) no existe. Toda la información crucial debe ser visible sin necesidad de pasar el mouse. Los menús desplegables deben abrirse con un *Tap* (clic), no solo al posicionarse encima. [[1](https://lemonlearning.com/es/blog/glosario-tooltip)]

---

📋 3. Listas y Tablas Flexibles

Las tablas con muchas columnas son las mayores enemigas de las pantallas móviles. Aquí está la solución moderna:

* **Transformación de Tabla a Card:** En PC se ve como una tabla tradicional de datos. En móviles, cada fila de la tabla se transforma automáticamente en una "minicard" independiente que agrupa los datos de esa fila de forma vertical.
* **Columnas Prioritarias:** Si decides mantener la tabla en móvil, oculta las columnas secundarias (ej. "Fecha de creación", "ID interno") y muestra solo las 2 o 3 columnas más importantes (ej. "Nombre" y "Estado"). Agrega un botón de tres puntos `...` para expandir el resto de los detalles.

---

🗺️ 4. Navegación y Flujo Multiplataforma

La forma en que el usuario se mueve por la aplicación cambia drásticamente según el dispositivo.

* **Menú Lateral vs. Menú Inferior:** En PC, el menú de navegación debe ir a la izquierda (barra lateral). En móviles, oculta esa barra tras un botón de menú "hamburguesa" (`☰`) o coloca las 4 secciones principales en una barra fija en la parte inferior de la pantalla (al alcance del pulgar).
* **Filtros en Modales:** En PC los filtros de búsqueda pueden estar fijos arriba de los datos. En móviles, coloca un solo botón de "Filtrar" que, al presionarlo, abra una pantalla completa (modal) para elegir los parámetros y luego cerrarse.

---

⚡ Resumen Técnico para Diseñadores / Desarrolladores

* **Tipografía:** Usa unidades relativas (`rem` o `em`) en lugar de píxeles fijos (`px`) para que los textos escalen correctamente según el tamaño de la pantalla.
* **Interacciones:** Asegúrate de que los componentes de código soporten eventos `onTouch` y no solo `onClick`.


# Documento de Especificación de Diseño y Rediseño del Dashboard Institucional

> **Versión:** 1.0
> **Estado:** Propuesta Definitiva
> **Objetivo:** Consolidar estándares de diseño, optimización técnica y experiencia de usuario (UX) para el Dashboard Administrativo.
> **Enfoque:** Institucional, Legibilidad, Prioridad de Datos, Accesibilidad Universal.

---

## 1. Principios Rectores

El diseño del dashboard se basa en la **claridad absoluta** y la **jerarquía visual**. La información debe consumirse en menos de 5 segundos sin necesidad de interacción.

| Principio                         | Descripción                                     | Aplicación                                                             |
| --------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| **Visibilidad por Defecto** | La información crítica nunca está oculta.     | Los detalles de los KPIs y estados de datos se muestran siempre.        |
| **Jerarquía de Datos**     | Lo más importante se destaca primero.           | "Altas pendientes" y "Registros totales" tienen peso visual mayor.      |
| **Consistencia**            | Un solo sistema de reglas para toda la interfaz. | Uso estricto de tokens CSS para colores, espaciado y tipografía.       |
| **Accesibilidad Táctil**   | Diseñado primero para dedos, luego para mouse.  | Botones grandes, sin dependencias de`hover`, navegación por teclado. |
| **Institucional**           | Estilo limpio, sobrio y profesional.             | Paleta de colores sobria, tipografía legible, sin distracciones.       |

---

## 2. Sistema de Diseño (Tokens & UI Kit)

Se establece un sistema de tokens CSS centralizado para garantizar coherencia y escalabilidad. Se aplica la paleta institucional de fondo oscuro (`navy`/`slate`) para modo claro/oscuro.

### 2.1 Tokens de Diseño (CSS Variables)

```css
:root {
  /* --- Espaciado (Grid Base) --- */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* --- Bordes y Contenedores --- */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --border-color: #e2e8f0;
  --border-focus: #2563eb;

  /* --- Tipografía --- */
  --font-family: 'Inter', 'Open Sans', system-ui, sans-serif;
  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 14px;
  --text-lg: 18px;
  --text-xl: 22px;
  --font-weight-bold: 700;
  --font-weight-medium: 600;
  --font-weight-regular: 400;

  /* --- Colores Institucionales (Inspiración GovTech/Enterprise) --- */
  --bg-page: #f8fafc;           /* Fondo principal */
  --bg-card: #ffffff;           /* Fondo de tarjetas */
  --bg-card-hover: #f1f5f9;
  
  --text-primary: #0f172a;      /* Texto principal (negro suave) */
  --text-secondary: #64748b;    /* Texto secundario (gris medio) */
  --text-muted: #94a3b8;        /* Texto de estado/placeholder */
  
  --primary: #2563eb;           /* Azul Institucional (Acción Principal) */
  --primary-hover: #1d4ed8;
  --primary-light: #dbeafe;

  --success: #16a34a;           /* Verde (Éxito/Verificado) */
  --success-light: #dcfce7;
  
  --warning: #d97706;           /* Naranja (Advertencia/Pendientes) */
  --warning-light: #fef3c7;
  
  --danger: #dc2626;            /* Rojo (Error/Alerta Crítica) */
  --danger-light: #fee2e2;

  /* --- Estados de Interacción --- */
  --shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
```

### 2.2 Mapa de Prioridad por Color

| Prioridad            | Concepto                     | Color de Fondo      | Color de Texto       | Uso                             |
| -------------------- | ---------------------------- | ------------------- | -------------------- | ------------------------------- |
| **Alta**       | Acción Requerida / Crítico | `--warning-light` | `--danger`         | Alertas de "Altas Pendientes".  |
| **Media-Alta** | Pendiente / En Proceso       | `--info-light`    | `--warning`        | Estado de "DATCORR" en proceso. |
| **Media**      | Informativo Activo           | `--bg-card`       | `--text-primary`   | Datos de tabla estándar.       |
| **Baja**       | Informativo Positivo         | `--success-light` | `--success`        | Estado "VERIFICADO".            |
| **Neutra**     | Datos Generales              | `--bg-card`       | `--text-secondary` | Etiquetas, contextos.           |

---

## 3. Arquitectura de Información (Layout)

La estructura del dashboard sigue el patrón de lectura **F invertida** (encabezado a detalles) y utiliza un sistema de rejilla elástica para adaptabilidad.

### 3.1 Layout Global

1. **Header (Fijo 56px):** Navegación global y perfil de usuario.
2. **Welcome Card (Encabezado):** Título de sección + contexto.
3. **KPI Row (Resumen):** 5 Métricas principales en fila (Grid auto-fit).
4. **Bottom Section (Detalles):** 2 Paneles en columna (Tabla + Timeline).

### 3.2 Jerarquía Visual de Datos

| Nivel       | Elemento                           | Peso Visual                             | Acción Requerida            |
| ----------- | ---------------------------------- | --------------------------------------- | ---------------------------- |
| **1** | **Registros Totales**        | Valor más grande (24px), negrita.      | Monitoreo.                   |
| **2** | **Altas Pendientes**         | **Borde rojo, Badge "Crítico".** | **Acción inmediata.** |
| **3** | **Bases Activas / Usuarios** | Peso estándar.                         | Monitoreo.                   |
| **4** | **Actividad Reciente**       | Texto secundario en Timeline.           | Historia/Logs.               |

---

## 4. Guía de Componentes Clave

### 4.1 Welcome Card (Encabezado de Página)

**Problema Resuelto:** Evita competencia visual con datos.
**Solución:** Se convierte en un simple título de sección.

* **Estilos:**
  * Fondo: `--bg-card`.
  * Bordes: `1px solid --border-color` (sin sombras).
  * Padding: `--space-lg --space-xl`.
  * Título: `--text-xl`, `--font-weight-bold`, `--text-primary`.
  * Descripción: `--text-sm`, `--text-secondary`.
  * Badge de Versión: Fondo `--bg-muted`, texto `--text-muted`, `--radius-sm`.

### 4.2 Cards de KPI (Métricas)

**Problema Resuelto:** Información oculta por hover y falta de prioridad.
**Solución:** Detalles siempre visibles + Priorización visual.

* **Estructura:**
  * **KPI Crítico ("Altas Pendientes"):**
    * Borde inferior izquierdo: `4px solid --danger`.
    * Badge superior: "Requiere atención" (texto `--danger`).
    * Icono de alerta: `--danger`.
    * Cursor: `pointer`.
  * **KPIs Estándar:**
    * Fondo: `--bg-card`, sombra `--shadow-card`.
    * Cursor: `pointer`.
    * Detalles: Se muestran **siempre** debajo del valor (no ocultos).
    * Iconos: Círculos de `40px` con fondos derivados de tokens (`--primary-light`, etc.).
    * Texto: Valor `--text-2xl` (700), Label `--text-sm` (500).

### 4.3 Tabla de Registros (Detalle por Base)

**Problema Resuelto:** Tabla densa sin contexto visual.
**Solución:** Barras de progreso + Columnas críticas.

* **Estructura:**
  * Contenedor: Fondo `--bg-card`, border-radius `--radius-md`.
  * Encabezados: Fondo `--bg-muted`, texto `--text-xs`, negrita.
  * Celdas: Padding `--space-sm --space-md`.
  * **Columna "% Progreso":** Nueva columna visual con barra de progreso (Verificado / Total).
  * **Columna DATCORR:** Texto `--text-primary` con fondo `--info-light`.
  * **Columna VERIFICADO:** Texto `--text-primary` con fondo `--success-light`.
  * **Columna TOTAL:** Borde inferior `2px solid --border-color`.
  * **Responsive:** Sticky en la primera columna (Base) en móviles.

### 4.4 Timeline de Actividad

**Problema Resuelto:** Lista de eventos sin agrupación clara.
**Solución:** Grupos visuales + Resalto de errores.

* **Estructura:**
  * Icono: Círculo de `20px` (sin línea conectora vertical).
  * **Acciones Críticas (Login fallido, Eliminación):** Icono `--danger` (rojo).
  * **Acciones Exitosas:** Icono `--success` (verde).
  * **Acciones Informativas:** Icono `--text-muted` (gris).
  * **Botón "Ver Todo":** Enlace alineado a la derecha.

### 4.5 Estados Loading y Error

* **Loading:** Spinner circular (`--primary`) centrado en el contenedor de contenido (no pantalla completa).
* **Error:** Card centrada con borde `--danger-light`. Botón "Reintentar" de color `--primary`.

---

## 5. Accesibilidad y UX (Touch & Keyboard)

### 5.1 Interacciones Táctiles (Touch Targets)

* **Tamaño Mínimo:** Todo botón, enlace o área interactiva debe medir **mínimo 44x44 píxeles**.
* **Separación:** Mínimo `8px` entre botones para evitar errores de dedo.
* **Hover:** Eliminar dependencias de `:hover`. Toda información importante debe ser visible sin pasar el cursor.
* **Menús:** Usar *Tap* (clic) para abrir menús, no *Hover*.

### 5.2 Navegación por Teclado

* **Focus Visible:** Outline personalizado (`2px solid --primary`, offset `2px`) en todos los elementos interactivos.
* **Tab Order:** Orden lógico de navegación (Botones de top bar → KPIs clickeables → Tabla → Timeline).
* **Semántica HTML:** Uso de `<header>`, `<main>`, `<section>`, `<table>`, `<thead>`, `<tfoot>`.

### 5.3 Contraste

* **Mínimo:** 4.5:1 para texto normal.
* **Texto Grande (>18px):** 3:1.
* **Verificación:** Usar herramienta WCAG 2.1 AA.

---

## 6. Plan de Implementación y Validación

### 6.1 Fases de Implementación

1. **Fase 1: Infraestructura (Semana 1)**

   * Crear archivo `tokens.css` y actualizar `theme.js`.
   * Migrar todos los hex hardcodeados a tokens CSS.
   * Implementar componentes base (`Card`, `Button`, `Badge`).
2. **Fase 2: KPIs y Welcome (Semana 1-2)**

   * Rediseñar Welcome Card como título de sección.
   * Implementar KPI Row con prioridad visual (borde rojo para críticas).
   * Hacer visibles los detalles de los KPIs sin hover.
3. **Fase 3: Tabla y Timeline (Semana 2)**

   * Agregar columna "% Progreso".
   * Unificar colores de DATCORR/VERIFICADO con tokens.
   * Implementar Sticky column en móvil.
4. **Fase 4: Accesibilidad y Pulido (Semana 3)**

   * Agregar landmarks semánticos y ARIA labels.
   * Implementar foco visible.
   * Verificar contrastes.

### 6.2 Checklist de Validación

- [ ] **Cero colores hardcodeados:** Todos usan tokens CSS.
- [ ] **Cero hardcodeados de espaciado:** Todos usan tokens `--space-*`.
- [ ] **Accesibilidad:** Funcional completo en teclado y táctil.
- [ ] **Legibilidad:** Tiempo de lectura < 5 segundos para datos clave.
- [ ] **Responsive:** Funcional en 1280px, 1024px, 768px, 375px.
- [ ] **Estados:** Loading y error integrados en el flujo (no pantalla completa).

---

## 7. Referencias Técnicas

* **WCAG 2.1 AA:** [W3C Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
* **Material Design 3:** [Google M3](https://m3.material.io/)
* **Apple HIG:** [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
* **GOV.UK Design System:** [Design System Gov](https://design-system.service.gov.uk/)

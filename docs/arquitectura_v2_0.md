
GESTIÓN CORPORATIVA — Identidad Visual Unificada
Propósito: Refinar la identidad visual del ecosistema (App Gubernamental + Landing Page) hacia un estilo corporativo, institucional y confiable.
Objetivo: Unificar la experiencia de usuario en una paleta de colores coherente (Azul Marino Profundo), manteniendo todas las funcionalidades técnicas y la arquitectura actual (React + MUI + Zustand).

1. Sistema de Diseño (Design Tokens)
   1.1. Paleta de Color (Dark Mode por defecto)
   Categoría	Elemento	Valor Actual (DATCORR)	Valor Propuesto (Unificado)	Hexadecimal
   Fondo Base	Página Principal	#000000 / #1e1e2e	#0a0e1a (Navy Profundo)	#0a0e1a → #050810
   Fondo Secundario	Tarjetas / Paneles	#111111	#141a2e (Navy Elevado)	#141a2e
   Fondo Hover	Cards / Tablas	#1e293b	#1a2245	#1a2245
   Fondo Elevado	Modales / Dropdowns	#334155	#1e2440 (Slate oscuro)	#1e2440
   Bordes	Separadores sutiles	#333333	#2a3050	#2a3050
   Texto Principal	Títulos / Cuerpo	#e5e5e5	#f0f2f5 (Blanco hueso)	#f0f2f5
   Texto Secundario	Muted / Helpers	#9ca3af	#8896b8 (Gris azulado)	#8896b8
   Acento Primario	CTAs / Iconos Activos	#60a5fa (Sky Blue)	#2563eb (Cobalto Vibrante)	#2563eb
   Acento Hover	Hover de Botones	—	#3b82f6 (Azul más brillante)	#3b82f6
   Estado Éxito	Confirmaciones	#34d399	#34d399 (Verde Esmeralda)	#34d399
   Estado Alerta	Precauciones	#fbbf24	#f59e0b (Ámber)	#f59e0b
   Estado Peligro	Errores	#f87171	#f87171 (Rojo)	#f87171
   Principio de Uso: El fondo #0a0e1a reemplaza el negro puro, dando una sensación más "premium" y menos agresiva. El azul cobalto (#2563eb) se usa para jerarquía visual (CTAs, active states) en lugar del azul cielo, que se considera demasiado "técnico" para un entorno gubernamental.

1.2. Tipografía
Elemento	Familia	Peso	Tamaño (Desktop)	Tracking
H1 / Hero	Inter	800	32px	-0.02em
H2 / Secciones	Inter	700	24px	normal
H3 / Cards	Inter	600	18px	normal
Cuerpo / Texto	Inter	400	14px	normal
Label / Helper	Inter	400	12px-13px	0.02em
Mono (IDs)	JetBrains Mono	400	13px	normal
Acción: Instalar Inter como fuente principal (@fontsource/inter). Usar Inter con fallback a sans-serif nativo.

2. Componentes UI y Layouts
   2.1. TopBar (Header)
   Fondo: #0f1425 (Azul marino muy oscuro).
   Borde: 1px solid #1e2440 (sutil, apenas perceptible).
   Logo:
   Texto "GESTIONALEX" o "DATCORR" en Inter weight 700, color #f0f2f5.
   Micro-interacción: Al hacer hover sobre el logo, aplicar un box-shadow sutil del color primario (#2563eb con opacidad 0.3) para dar un efecto de "glow".
   Navegación:
   Links con texto #8896b8 (hover #2563eb).
   Estado Activo: No cambiar el fondo. Aplicar un indicador de línea inferior animado (underline con animación suave 150ms).
   Botones:
   Botón principal (ej. "Acceso"): Fondo #0f1425 con borde 1px solid #2a3050 o fondo sólido #2563eb (si es CTA principal).
   2.2. Sidebar (Menú Lateral)
   Fondo: #0a0e1a (Unificado con el body).
   Ancho: 240px.
   Borde Derecho: 1px solid #1e2440.
   Items de Menú:
   Altura 40px, border-radius: 8px, padding 0 16px.
   Activo: Fondo #1a2040 con borde izquierdo 3px solid #2563eb.
   Hover: Fondo #141a2e con icono de color primario.
   Iconos: Usar MUI Icons con color #8896b8 (hover #2563eb).
   User Card (Footer):
   Fondo #1e2440, border-radius: 12px.
   Avatar circular con borde 2px solid #2563eb.
   2.3. Tarjetas (Cards / Papers)
   Estilo Base:
   Fondo: #141a2e.
   Borde: 1px solid #1e2440.
   border-radius: 12px.
   Sombra: 0 4px 20px rgba(0,0,0,0.3).
   Hover:
   Elevación: transform: translateY(-2px).
   Sombra: Aumentar opacidad de la sombra.
   Borde: Cambiar a #2a3050.
   Iconos: Si la tarjeta tiene un icono en el encabezado, usar iconos de MUI con color #2563eb en lugar de texto plano.
   2.4. Botones
   Variante	Fondo	Texto	Borde	Uso
   Primary	#2563eb	#f0f2f5	Ninguno	CTAs principales (ej. "Crear", "Acceso")
   Primary Outline	Transparente	#2563eb	1px solid #2563eb	Botones secundarios de acción
   Secondary	Transparente	#8896b8	1px solid #2a3050	Botones de navegación o acciones menos críticas
   Ghost	Transparente	#8896b8	Ninguno	Links dentro de tarjetas o menús
   Danger	#f87171	#f0f2f5	Ninguno	Eliminar / Cancelar
   Estilo Común: border-radius: 8px, transition: all 0.2s, padding: 10px 24px.

2.5. Gráficos (Recharts)
Grid: Trazo #1e2440 con estilo dash: "3 3".
Ejes: Texto #8896b8.
Tooltip: Fondo #0f1425, borde #1e2440, texto #f0f2f5.
Paleta de Datos:
Líneas principales: #2563eb (Azul Corporativo).
Éxito: #34d399.
Alerta: #f59e0b.
Peligro: #f87171.
Secundario: #8b5cf6 (Púrpura).
2.6. Tablas y DataGrid
Cabeceras: Fondo #1a2040, texto #f0f2f5 weight 600, border-bottom: 1px solid #1e2440.
Filas: Fondo #141a2e.
Hover: #1a2245.
Selección: rgba(59,130,246, 0.14).
Badges: Chips con border-radius: 6px, padding 4px 12px, colores semánticos.
2.7. Login / Registro
Fondo: Gradiente oscuro linear-gradient(135deg, #0a0e1a 0%, #0f1425 100%).
Card de Login: Fondo #141a2e con sombra pronunciada 0 10px 40px rgba(0,0,0,0.5).
Inputs: Borde #2a3050, al hacer foco (focus), borde cambia a #2563eb o #1e2440 con box-shadow del color primario.
Botón Submit: Fondo #2563eb, hover #1d4ed8.
Google OAuth: Botón con borde #2a3050 e icono de Google (gris/blanco).
2.8. Dashboard (KPIs)
Grid: 2x2 o 4 columnas responsive.
Cards KPI:
Fondo #141a2e, border-radius: 12px.
Icono decorativo: Círculo semitransparente con el color del KPI.
Valor numérico: Fuente Inter weight 800, tamaño 32px, color #f0f2f5.
Label: Weight 500, tamaño 13px, color #8896b8.
Tablas de Movimientos:
Fondo fila #141a2e con alternado sutil.
Acciones (CREAR, etc.): Badges con color semántico.
3. Micro-interacciones y Accesibilidad
3.1. Transiciones y Animaciones
Transiciones Generales: 150ms para hovers, 300ms para modales/drawers.
Transición de Botones: all 0.2s ease.
Loading: Spinner con color #2563eb.
Skeleton: Fondo #1a2040 con animación de brillo (shimmer).
Scrollbar:
::-webkit-scrollbar-track: #0a0e1a.
::-webkit-scrollbar-thumb: #2a3050.
::-webkit-scrollbar-thumb:hover: #3b4a70.
3.2. Accesibilidad (WCAG AA)
Contraste: Mantiene ratio mínimo 4.5:1 para texto normal y 3:1 para texto grande.
Focus Visible: outline: 2px solid #2563eb con outline-offset: 2px.
Skip Link: Oculto por defecto, visible en focus (texto blanco sobre fondo oscuro).
ARIA: Todos los botones con aria-label descriptivo.
4. Plan de Implementación
Theme System:
Actualizar frontend/src/theme.js con los nuevos tokens de color y tipografía.
Asegurar que darkMode se mantenga activo como default.
Layouts:
Refactor TopBar.jsx y Sidebar.jsx para aplicar los nuevos colores y bordes.
Verificar MainLayout.jsx.
Components:
Crear/Actualizar FeatureCard.jsx (nuevo componente reutilizable).
Refactor Dashboard.jsx para aplicar estilos a KPIs y Tablas.
Refactor Login.jsx + Login.css.
Gráficos:
Actualizar configuración de Recharts en el tema para usar la nueva paleta.
Testing:
Verificar que la navegación de rutas no se rompa.
Validar que los colores de los estados (éxito, alerta, peligro) se mantengan legibles.
Probar en modo oscuro y claro (si se implementa en el futuro).
5. Resumen Visual Final
El diseño resultante será una interfaz oscura, elegante y profesional, inspirada en software gubernamental de alto nivel. El uso del azul marino (#0a0e1a) en lugar del negro puro reduce la fatiga visual y transmite seriedad. Los azules cobalto (#2563eb) guían la atención del usuario de forma clara y moderna. Las tarjetas con sombras suaves y micointeracciones fluidas dan una sensación de aplicación nativa y pulida.

Paleta Final: Fondo #0a0e1a, Acento #2563eb, Texto #f0f2f5, Cards #141a2e.

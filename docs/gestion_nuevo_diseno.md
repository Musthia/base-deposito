
GESTIÓN CORPORATIVA — Identidad Visual Unificada v2.0
Versión: v2.0.5 (Incluye GlobalBanner)
Propósito: Refinar la identidad visual del ecosistema (App Gubernamental + Landing Page) hacia un estilo corporativo, institucional y confiable.
Objetivo: Unificar la experiencia de usuario en una paleta de colores coherente (Azul Marino Profundo), manteniendo todas las funcionalidades técnicas y la arquitectura actual (React + MUI + Zustand), incluyendo sistemas de notificación global.

1. Sistema de Diseño (Design Tokens)
   1.1. Paleta de Color (Dark Mode por defecto)
   Basado en la versión v2.0 y refines para el Banner.

Categoría	Elemento	Valor Propuesto	Hexadecimal
Fondo Base	Página Principal	#0a0e1a (Navy Profundo)	#0a0e1a → #050810
Fondo Secundario	Tarjetas / Paneles	#141a2e (Navy Elevado)	#141a2e
Fondo Hover	Cards / Tablas	#1a2245	#1a2245
Fondo Elevado	Modales / Dropdowns	#1e2440 (Slate oscuro)	#1e2440
Bordes	Separadores sutiles	#2a3050	#2a3050
Texto Principal	Títulos / Cuerpo	#f0f2f5 (Blanco hueso)	#f0f2f5
Texto Secundario	Muted / Helpers	#8896b8 (Gris azulado)	#8896b8
Acento Primario	CTAs / Iconos Activos	#2563eb (Cobalto Vibrante)	#2563eb
Acento Hover	Hover de Botones	#3b82f6 (Azul más brillante)	#3b82f6
Estado Éxito	Confirmaciones	#34d399 (Verde Esmeralda)	#34d399
Estado Alerta	Precauciones	#f59e0b (Ámber)	#f59e0b
Estado Peligro	Errores	#f87171 (Rojo)	#f87171
1.2. Tipografía
Familia: Inter (800 para H1, 700 para H2, 600 para H3).
Fallback: sans-serif.
Mono: JetBrains Mono para IDs y datos técnicos.
2. Componentes UI y Layouts
2.1. TopBar (Header)
Fondo: #0f1425.
Logo: Efecto "glow" al hover con sombra azul cobalto.
Navegación: Indicador de línea inferior activo animado (150ms).
Botones: Fondo #2563eb (CTA principal) o transparente con borde (Navegación).
2.2. Sidebar (Menú Lateral)
Fondo: #0a0e1a.
Ancho: 240px.
Items: Activo con borde izquierdo 3px solid #2563eb.
User Card: Fondo #1e2440, avatar con borde azul cobalto.
2.3. Tarjetas (Cards / Papers)
Elevación: Sombra 0 4px 20px rgba(0,0,0,0.3).
Hover: Elevación translateY(-2px) y cambio de borde a #2a3050.
2.4. Botones
Primary: #2563eb / #f0f2f5.
Outline: Transparente / #2563eb.
Ghost: Transparente / #8896b8.
Danger: #f87171 / #f0f2f5.
2.5. Gráficos (Recharts)
Paleta: Azul corporativo #2563eb, Éxito #34d399, Alerta #f59e0b.
Grid: Trazo #1e2440 (dash: 3 3).
2.6. Tablas y DataGrid
Header: Fondo #1a2040, texto #f0f2f5.
Fila: Fondo #141a2e, hover #1a2245.
3. GlobalBanner (Notificaciones Globales)
Inspirado en Hostinger Horizons.
Un componente React que maneja avisos críticos sin romper el layout.

3.1. Arquitectura
El banner se integra como una capa superpuesta sobre el MainLayout, antes que el TopBar.

Componente: frontend/src/components/GlobalBanner/GlobalBanner.jsx
Estado: frontend/src/stores/bannerStore.js (Zustand).
Hook: frontend/src/hooks/useBannerMargin.js (Ajusta padding-top del main).
3.2. Temas del Banner (Coherentes con el Diseño)
js

const BANNER_THEMES = {
  // Información General (Estilo Azul Corporativo)
  info: {
    surface: "linear-gradient(135deg, #0f1425 0%, #141a2e 100%)",
    text: "#f0f2f5",
    border: "#2563eb",
    buttonBg: "#2563eb",
    buttonBgHover: "#1d4ed8",
    buttonText: "#ffffff",
    icon: "ℹ️",
  },

  // Advertencia de Sistema (Estilo Ámber)
  warning: {
    surface: "linear-gradient(135deg, #1a2045 0%, #252e45 100%)",
    text: "#fbbf24",
    border: "#f59e0b",
    buttonBg: "#f59e0b",
    buttonBgHover: "#d97706",
    buttonText: "#000000",
    icon: "⚠️",
  },

  // Mantenimiento / Urgente (Estilo Rojo/Ámber)
  maintenance: {
    surface: "linear-gradient(135deg, #0a0e1a 0%, #1a1505 100%)",
    text: "#f0f2f5",
    border: "#ef4444",
    buttonBg: "#ef4444",
    buttonBgHover: "#dc2626",
    buttonText: "#ffffff",
    icon: "🔧",
  },

  // Éxito / Confirmación (Estilo Verde)
  success: {
    surface: "linear-gradient(135deg, #0a1a12 0%, #142a18 100%)",
    text: "#34d399",
    border: "#34d399",
    buttonBg: "#34d399",
    buttonBgHover: "#25a267",
    buttonText: "#000000",
    icon: "✅",
  },
};
3.3. API del Componente
jsx

<GlobalBanner
  type="maintenance"            // info | warning | error | maintenance | success
  message="Mantenimiento programado: 15 jul 18:00-20:00"
  cta="Ver detalles"
  onCta={() => navigate("/mantenimiento")}
  position="top"                // top | bottom
  dismissible={true}            // Si es desechable
  onDismiss={() => markAsRead()}
  autoHideMs={0}                // 0 = no auto-hide
/>
3.4. Integración en MainLayout
jsx

// frontend/src/layouts/MainLayout.jsx
<Box component="main" sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative" }}>
  {/* 1. Banner Global (Superpuesto) */}
  

  {/* 2. TopBar (Ajustado al banner) */}
  

  {/* 3. Contenido Principal */}
  <Box component="main" sx={{ flex: 1, p: "24px", pt: "80px", background: "var(--bg-gradient)" }}>
    
  

3.5. Hook de Margen (useBannerMargin)
jsx

// frontend/src/hooks/useBannerMargin.js
import { useEffect } from "react";
import { useBannerStore } from "../../stores/bannerStore";

export function useBannerMargin() {
  const banner = useBannerStore((state) => state.banner);

  useEffect(() => {
    // Ajusta el padding-top del main para no taparse con el banner
    // Esto se hace al renderizar el componente principal
    window.dispatchEvent(new Event('resize')); // Trigger inicial
  }, [banner]);
}
4. Prioridad de Uso (Casos de Uso)
Caso de Uso	Tipo	Posición	Acción
Mantenimiento	maintenance	Top	"Ver detalles" (Link)
Sesión Próxima a Expirar	warning	Top	"Extender sesión" (CTA)
Nueva Versión	info	Bottom	"Ver cambios" (Link)
Cookies / Legal	info	Bottom	"Aceptar" (CTA)
Error Crítico (DB)	error	Top	"Atención" (CTA)
5. Plan de Implementación Final
Theme System:
Asegurar que theme.js expone las variables CSS para el banner (--banner-bg, --banner-text, etc.).
Componente GlobalBanner:
Crear GlobalBanner.jsx y GlobalBanner.css.
Implementar useBannerMargin para evitar superposiciones visuales.
Estado Global (Zustand):
Crear bannerStore.js para gestionar qué banner está activo y su estado (dismissible).
MainLayout:
Insertar el componente GlobalBanner antes de TopBar.
Aplicar el hook useBannerMargin en el contenedor principal.
Testing:
Verificar que el banner no tape el contenido.
Validar que los colores del banner sean legibles y consistentes con el tema oscuro.
Probar en móvil (banner debe ajustarse a altura).
6. Resumen Visual Final
El diseño resultante es una interfaz oscura, elegante y profesional, inspirada en software gubernamental de alto nivel.

Paleta: Fondo #0a0e1a, Acento #2563eb, Texto #f0f2f5, Cards #141a2e.
Banner: Capa superpuesta con gradientes oscuros que respetan la jerarquía visual.
Info: Azul cobalto.
Warning: Ámber.
Maintenance: Rojo/Ámber oscuro.
UX: Transiciones fluidas, micro-interacciones en botones, y un sistema de notificaciones que no rompe el flujo de trabajo del usuario.

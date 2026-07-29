# Análisis: Banner de Notificación Global — Inspirado en Hostinger Horizons

> Código fuente: Script de banner template de Hostinger Horizons con temas, posiciones, responsive y gradientes.
> Posible aplicación en DatCorr para avisos de mantenimiento, versiones, cookies, o notificaciones globales.

---

## 1. ¿Qué hace el script original?

- Inyecta un banner fijo (top/bottom) con texto, logo SVG y CTA button
- Soporta múltiples temas (`default`, `carnival`) con colores, gradientes, animaciones
- Se configura vía atributos `data-*` en el `<script>`: `template-theme`, `template-main-text`, `template-cta-text`, `template-redirect-url`
- Es responsive (mobile cambia altura y layout a column)
- Ajusta el `margin-top`/`margin-bottom` del body dinámicamente según la altura del banner
- Usa `ResizeObserver` para mantener el margin sincronizado
- Maneja postMessage para iframes

---

## 2. Posibles usos en DatCorr

| Uso | Descripción | Prioridad |
|---|---|---|
| **Aviso de mantenimiento** | Banner top informando que el sistema estará en mantenimiento en X fecha | Alta |
| **Nueva versión** | Banner bottom con "Nueva versión disponible — Ver cambios" | Media |
| **Cookie consent** | Banner bottom con "Este sitio usa cookies — Aceptar / Configurar" | Media |
| **Aviso de sesión próxima a expirar** | Banner top con countdown y botón "Extender sesión" | Alta |
| **Notificación de sistema** | Banner global para alertas del servidor o DB | Alta |
| **Onboarding / Tutorial** | Banner con "¿Primera vez? Vea el tutorial" | Baja |

---

## 3. Arquitectura propuesta para DatCorr

```
frontend/src/
  components/
    GlobalBanner/
      GlobalBanner.jsx       ← Componente React (no script inyectado)
      GlobalBanner.css        ← Estilos del banner
      themes.js               ← Configuración de temas oscuros
      useBannerMargin.js      ← Hook para ajustar margin del layout
```

### Diferencia clave con el original

El script original es un snippet vanilla auto-contenido. Para DatCorr se convertiría en un **componente React** que:

- Se renderiza en `MainLayout.jsx` (o un nuevo `BannerProvider`)
- Recibe props: `type`, `message`, `cta`, `onAction`, `position`, `dismissible`
- Usa `theme.js` existente para colores (`colors.primary`, `colors.bgCard`, etc.)
- Se integra con el sistema de estados global (Zustand) si es necesario

---

## 4. Temas para DatCorr (Dark)

```js
const BANNER_THEMES = {
  info: {
    surface: "linear-gradient(135deg, #0f1425 0%, #1a2040 100%)",
    text: "#f0f2f5",
    border: "#2563eb",
    buttonBg: "#2563eb",
    buttonText: "#ffffff",
    buttonBgHover: "#1d4ed8",
    icon: "ℹ️",
  },
  warning: {
    surface: "linear-gradient(135deg, #1a1505 0%, #2a2005 100%)",
    text: "#fbbf24",
    border: "#f59e0b",
    buttonBg: "#f59e0b",
    buttonText: "#000000",
    buttonBgHover: "#d97706",
    icon: "⚠️",
  },
  error: {
    surface: "linear-gradient(135deg, #1a0505 0%, #2a0505 100%)",
    text: "#f87171",
    border: "#ef4444",
    buttonBg: "#ef4444",
    buttonText: "#ffffff",
    buttonBgHover: "#dc2626",
    icon: "🚨",
  },
  maintenance: {
    surface: "linear-gradient(135deg, #0a0e1a 0%, #141a2e 100%)",
    text: "#94a3b8",
    border: "#2a3050",
    buttonBg: "#2a3050",
    buttonText: "#f0f2f5",
    buttonBgHover: "#3b4a70",
    icon: "🔧",
  },
};
```

---

## 5. API del componente propuesto

```jsx
<GlobalBanner
  type="info"                    // info | warning | error | maintenance
  message="Mantenimiento programado: 15 jul 18:00-20:00"
  cta="Ver detalles"
  onCta={() => navigate("/mantenimiento")}
  position="top"                 // top | bottom
  dismissible={true}
  onDismiss={() => markAsRead()}
  autoHideMs={0}                 // 0 = no auto-hide
/>
```

---

## 6. Integración con el layout actual

En `MainLayout.jsx`:

```jsx
<Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
  <GlobalBanner type="info" message="..." />  {/* top banner */}
  <TopBar />
  <Box component="main" sx={{ flex: 1, p: "24px", pt: "80px", background: "var(--bg-gradient)" }}>
    <Outlet />
  </Box>
  {/* bottom banner opcional */}
</Box>
```

El `useBannerMargin` hook ajustaría el padding-top del `<main>` cuando el banner está presente para evitar superposición con TopBar.

---

## 7. Diferencias con el script original

| Aspecto | Script original | Propuesta DatCorr |
|---|---|---|
| Framework | Vanilla JS | React + MUI |
| Config | Atributos en `<script>` | Props de React + Zustand |
| Temas | `default`, `carnival` | `info`, `warning`, `error`, `maintenance` |
| Logo SVG | Hostinger Horizons | Logo de DatCorr (opcional) |
| Responsive | CSS media query | MUI sx + breakpoints |
| Margin sync | ResizeObserver | Hook + efecto React |
| Persistencia | No | Opcional (localStorage para dismiss) |

---

## 8. Archivos a crear

| Archivo | Descripción |
|---|---|
| `frontend/src/components/GlobalBanner/GlobalBanner.jsx` | Componente principal |
| `frontend/src/components/GlobalBanner/themes.js` | Temas del banner |
| `frontend/src/hooks/useBannerMargin.js` | Hook para ajuste de layout |
| `frontend/src/stores/bannerStore.js` | Estado global (Zustand) para el banner activo |

---

## 9. Ejemplo de estado global (Zustand)

```js
import { create } from "zustand";

export const useBannerStore = create((set) => ({
  banner: null, // { type, message, cta, onCta, position, dismissible }
  setBanner: (b) => set({ banner: b }),
  clearBanner: () => set({ banner: null }),
}));
```

Uso desde cualquier página:

```js
useBannerStore.getState().setBanner({
  type: "maintenance",
  message: "Mantenimiento esta noche 22:00-23:00",
  position: "top",
  dismissible: true,
});
```

---

## 10. Conclusión

El patrón del script de Hostinger Horizons (banner fijo con temas, responsive, margin sync) es **totalmente viable y recomendable** para DatCorr. La adaptación a React + MUI es directa y permite:

- Notificaciones globales sin romper el layout existente
- Consistencia visual con el theme oscuro del proyecto
- Fácil integración con el sistema de estados existente (Zustand)
- Componente reutilizable y configurable por props

**No hay breaking changes** — el banner se renderiza fuera del `<Outlet>` y solo agrega margin dinámico al layout principal.

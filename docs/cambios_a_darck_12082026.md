
Los cambios aplicados para mejorar la legibilidad de fuentes y la integración en botones/labels son:

**`ui/styles.py`**

* Fuente unificada: `"Segoe UI Variable, Segoe UI, Helvetica Neue, Arial, sans-serif"` con fallbacks.
* Tamaños en `pt` (14pt base, 14pt inputs/botones, 16pt títulos) para consistencia con Qt.
* Contraste elevado: texto principal `#ffffff` sobre fondos `#1e1e1e`/`#2b2b2b`.
* Botones: `padding: 12px 24px`, `min-height: 30px`, `border-radius: 6px`, peso `600`.
* Inputs: `padding: 8px 10px`, `min-height: 22px`, `border-radius: 6px`.
* Labels: `padding: 4px 0` para respirar.
* Scrollbars, spinboxes, tooltips y messageboxes actualizados con la misma fuente y contraste.

**Archivos `.ui` y `_ui.py`**

* Eliminados estilos inline, fuentes hardcodeadas y paletas claras que sobrescribían el tema global en:
  * `inicio_sesion.ui` / `inicio_sesion_ui.py`
  * `AplicacionPrincipal.ui` / `AplicacionPrincipal_ui.py`
  * `permisos_usuario.ui` / `permisos_usuario_ui.py`
  * `usuarios.ui` / `usuarios_ui.py`
  * `selector_bases.ui`
* En `inicio_sesion.ui`: altura de `boton_recuperar_contrasena` corregida de `25` a `35`.
* En todas las plantillas (`plantilla_*.ui`): eliminadas fuentes/paletas/styles inline y cambiado `sizePolicy` de botones de `Fixed/Maximum` a `Preferred/Preferred` para que el texto no se recorte.

**Archivos Python**

* `reportes_viewer.py`: KPI labels ahora usan `FUENTE_FAMILIA` desde `ui/styles.py`.
* `ventana_principal.py`: sin cambios funcionales; sus estilos locales (`style_treeview_dark`, `style_dialog_dark`, etc.) ya usan los tokens actualizados.

Todos los archivos pasan `py_compile` y los `.ui` son XML válido.

# Plan de ejecucion aprobado - Rediseno escritorio DatCorr

> Alcance: aplicacion de escritorio PySide6 / Qt Designer
> Objetivo: redisenar completamente la capa visual de escritorio sin alterar reglas de negocio, permisos, acceso a datos, autenticacion, carga de plantillas ni flujos operativos existentes.

---

## 1. Resumen ejecutivo

Los tres documentos analizados son viables en el proyecto, pero no deben ejecutarse como un cambio visual directo sobre cada ventana sin una capa de tema central. El codigo actual confirma los problemas senalados: estilos inline en archivos `.ui`, estilos dispersos en `ui/styles.py`, colores hardcodeados en `ventana_principal.py` y pantallas generadas desde Qt Designer que pueden pisar cualquier QSS global.

La opcion recomendada es un redisenio por fases basado en:

- Tokens centralizados en Python para colores, tipografia, espaciado, radios y estados.
- QSS global aplicado desde `QApplication`.
- Limpieza gradual de estilos inline en `.ui` y Python.
- Regeneracion controlada de archivos `_ui.py` con `pyside6-uic`.
- Pruebas funcionales por flujo despues de cada ventana, no solo revision visual.

El resultado esperado es una interfaz de escritorio moderna, coherente y profesional, con identidad institucional navy, mayor legibilidad, foco visible, estados consistentes y menor riesgo de regresiones.

---

## 2. Documentos analizados

### 2.1 `docs/plan_rediseño_escritorio_datcorr.md`

Mejores aportes:

- Traduce correctamente conceptos web a Qt mediante `QPalette`, `QStyle` y QSS.
- Propone componentes concretos: KPI cards, tablas, timeline y estados semanticos.
- Incluye criterios de accesibilidad utiles: no depender de hover, touch targets y contraste.

Limitaciones:

- Usa una regla demasiado absoluta de "0 hex hardcodeados" desde el inicio. Es deseable como meta, pero riesgoso si se impone antes de estabilizar el tema.
- Mezcla recomendaciones de PyQt5/PySide2 con el stack real del proyecto, que usa PySide6.
- Propone algunos estilos globales `QWidget` demasiado amplios que podrian afectar widgets internos, dialogos y contenedores inesperadamente.

Decision:

- Se toma la idea de componentes y accesibilidad.
- Se descarta aplicar `QWidget { border... padding... }` globalmente, porque puede romper layouts y widgets hijos.

### 2.2 `docs/plan_rediseno_app_desktop.md`

Mejores aportes:

- Identifica con buena precision los archivos afectados: `AplicacionPrincipal.ui`, `inicio_sesion.ui`, `ventana_usuario.ui`, `selector_bases.ui`, `plantilla_*.ui`, `ui/styles.py` y `ventana_principal.py`.
- Recomienda `ui/theme.py` y `ui/theme_qss.py`, una separacion tecnicamente solida para PySide6.
- Define fases ejecutables y mantiene compatibilidad temporal con `ui/styles.py`.

Limitaciones:

- Plantea redisenar muchas ventanas en poco tiempo sin separar suficientemente infraestructura, prueba piloto y expansion.
- Algunas muestras QSS usan pseudoestados o propiedades que deben validarse en Qt antes de adoptarse tal cual.
- El tema navy oscuro es coherente con los planes, pero debe documentarse como decision especifica del escritorio, porque `DESIGN.md` del producto describe una interfaz web interior clara.

Decision:

- Se adopta la arquitectura `theme.py` + `theme_qss.py`.
- Se adopta la migracion gradual de `styles.py`.
- Se ajusta el calendario para incluir una prueba piloto antes de tocar todas las ventanas.

### 2.3 `docs/Plan_Rediseno_Estilo_Escritorio.md`

Mejores aportes:

- Explica la precedencia real de QSS en Qt: widget > parent chain > QApplication.
- Acierta al recomendar editar `.ui` como fuente de verdad y regenerar `_ui.py`.
- Incluye una lista clara de riesgos, validaciones y flujos funcionales.
- Propone reemplazar colores del delegate de resaltado en `ventana_principal.py` por tokens.

Limitaciones:

- Igual que el segundo plan, asume modo oscuro navy como decision definitiva sin resolver la convivencia con la guia web actual.
- La meta de eliminar todos los estilos inline debe tratarse como criterio de cierre por modulo, no como precondicion para empezar.

Decision:

- Se adopta como base tecnica principal.
- Se combina con los componentes del primer plan y con la arquitectura de archivos del segundo.

---

## 3. Viabilidad en el proyecto actual

### 3.1 Viable con bajo riesgo

- Crear `ui/theme.py` con tokens y helpers.
- Crear `ui/theme_qss.py` con `GLOBAL_QSS`, `get_theme_qss()` y `apply_theme()`.
- Mantener las firmas existentes de `ui/styles.py` para compatibilidad.
- Aplicar tema global en `base_datcorr.py` al crear `QApplication`.
- Aplicar variantes visuales por propiedad dinamica: `variant="primary"`, `variant="secondary"`, `variant="danger"`, `variant="ghost"`, `card="true"`.
- Reemplazar estilos de `QMessageBox`, botones, inputs, combos, tablas, tabs, menus, statusbar y toolbars.

### 3.2 Viable con riesgo medio

- Limpiar estilos inline de `ui/AplicacionPrincipal.ui` y `ui/inicio_sesion.ui`.
- Regenerar `AplicacionPrincipal_ui.py` e `inicio_sesion_ui.py`.
- Quitar estilos directos de `ventana_principal.py`, especialmente:
  - `combo_bases.setStyleSheet(style_combobox_dark())`.
  - fondo `#80ccff` del contenedor de resultados.
  - encabezados `#cfcfcf`, `#debef1`, `#aedfff` del `QTreeView`.
  - estilos inline para campos readonly en edicion.
- Migrar `ResaltadoCoincidenciaDelegate` para usar colores semanticos del tema.

Riesgo:

- Los `.ui` generados pueden cambiar mucho en diff si se editan con Designer.
- Un QSS global demasiado agresivo puede alterar dimensiones o widgets especificos.

Mitigacion:

- Hacer una prueba piloto con login y ventana principal antes de migrar dialogos y plantillas.
- Evitar selectores globales que agreguen padding/border a todos los `QWidget`.
- Mantener rollback por fase mediante commits pequenos.

### 3.3 Viable con riesgo alto si se hace sin piloto

- Redisenar todas las plantillas `plantilla_*.ui` en una sola fase.
- Cambiar layouts profundos de la ventana principal sin pruebas funcionales.
- Modificar archivos `_ui.py` manualmente como fuente definitiva.
- Eliminar de golpe `ui/styles.py` sin revisar todos los imports actuales.

Decision:

- No ejecutar como Big Bang.
- Mantener `ui/styles.py` como fachada temporal que consume tokens.
- Migrar plantillas al final, despues de validar el tema en flujos principales.

---

## 4. Direccion de diseno seleccionada

### 4.1 Identidad visual

Se recomienda adoptar para escritorio una identidad institucional navy, sobria y operativa:

- Fondo global: navy profundo.
- Superficies: paneles oscuros con borde sutil.
- Accion primaria: azul institucional.
- Estados: verde exito, amarillo advertencia, rojo peligro, celeste informacion.
- Tipografia: `Open Sans`, `Segoe UI`, `system-ui`, priorizando legibilidad nativa en Windows.

### 4.2 Ajuste de coherencia con el producto web

Existe una tension documental: `DESIGN.md` describe interior web claro, mientras los tres planes de escritorio y `frontend/src/theme.js` ya contienen tokens navy oscuros. Para no bloquear el trabajo, este plan propone:

- Aprobar el navy oscuro como direccion especifica para escritorio.
- No cambiar la funcionalidad ni estructura del frontend en esta etapa.
- Registrar despues una decision de producto sobre si el sistema completo quedara light-only, dark navy o con temas separados web/escritorio.

### 4.3 Principios no negociables

- La funcionalidad existente manda sobre la estetica.
- No se cambian endpoints, servicios, permisos ni modelos de datos.
- No se cambian textos funcionales criticos sin aprobacion.
- No se oculta informacion importante detras de hover.
- Cada cambio visual debe tener prueba de arranque y flujo.
- Los archivos `.ui` son fuente de verdad; los `_ui.py` se regeneran.

---

## 5. Arquitectura propuesta

### 5.1 Nuevos archivos

```text
ui/
  theme.py
  theme_qss.py
```

### 5.2 Responsabilidad de `ui/theme.py`

- Definir tokens de color.
- Definir escala tipografica.
- Definir espaciado y radios.
- Definir tokens semanticos para estados.
- Exponer colores Qt compatibles, por ejemplo `QColor`.

### 5.3 Responsabilidad de `ui/theme_qss.py`

- Construir `GLOBAL_QSS`.
- Exponer `get_theme_qss()`.
- Exponer `apply_theme(widget)`.
- Exponer helpers de variantes:
  - `set_button_variant(button, "primary")`
  - `set_button_variant(button, "danger")`
  - `set_card(widget)`
  - `refresh_style(widget)`

### 5.4 Responsabilidad temporal de `ui/styles.py`

`ui/styles.py` no debe eliminarse al inicio. Debe reescribirse para conservar compatibilidad con imports existentes:

- `style_dialog_dark()`
- `style_pushbutton_dark()`
- `style_combobox_dark()`
- `style_messagebox_dark()`
- `style_lineedit_error()`
- `style_lineedit_validation()`

Cada funcion debe devolver QSS derivado de `theme.py`, no strings visuales independientes.

---

## 6. Alcance por modulo

### 6.1 Login - `base_datcorr.py` + `ui/inicio_sesion.ui`

Objetivo:

- Convertir el login en una pantalla de entrada institucional, clara y confiable.

Cambios:

- Aplicar tema global al `QApplication`.
- Fondo navy.
- Card central con logo, usuario, contrasena, iniciar sesion y recuperar contrasena.
- Boton primario para iniciar sesion.
- Link ghost para recuperar contrasena.
- Mensajes de error con `QMessageBox` tematizado.

No se toca:

- `ApiClient`.
- `SessionManager`.
- Login `/auth/login`.
- Recuperacion `/auth/forgot-password`.
- Inicializacion `initialize_postgres()`.

### 6.2 Ventana principal - `ventana_principal.py` + `ui/AplicacionPrincipal.ui`

Objetivo:

- Convertir la ventana principal en una consola operativa consistente para consulta, carga, usuarios y reportes.

Cambios:

- Eliminar fondo verde menta y frame naranja.
- Rehacer topbar con layout estable.
- Estilizar combo de bases, entrada de busqueda y boton consultar.
- Estilizar `QTabWidget`, `QTreeView`, toolbar y statusbar.
- Parametrizar colores del delegate de resaltado.

No se toca:

- Validacion de sesion.
- Niveles de seguridad.
- Carga de bases.
- Busqueda.
- Edicion de registros.
- Apertura de administracion de usuarios.
- Apertura de reportes.

### 6.3 Usuarios y permisos

Archivos:

- `ui/usuarios.ui`
- `ui/alta_usuario.ui`
- `ui/editar_usuario.ui`
- `ui/permisos_usuario.ui`
- `ui/ventana_usuario.ui`
- `ventanas/ventana_usuarios.py`
- `ventanas/ventana_alta_usuario.py`
- `ventanas/ventana_editar_usuario.py`
- `ventanas/ventana_permisos_usuario.py`

Cambios:

- Aplicar QSS global.
- Botones por variante: guardar primario, cancelar secundario, eliminar/desactivar danger o warning.
- Tablas y listas con estilos del sistema.
- Foco visible y orden de tabulacion.

No se toca:

- Servicios de usuario.
- Validaciones funcionales.
- Asignacion de permisos.
- Activar/desactivar usuarios.

### 6.4 Plantillas de carga

Archivos:

- `ui/plantilla_pediatrico.ui`
- `ui/plantilla_maternidad.ui`
- `ui/plantilla_ips.ui`
- `ui/plantilla_igpj.ui`
- `ui/plantilla_igpj_listado_nuevo.ui`
- `ui/plantilla_escribania.ui`
- `ui/plantilla_*.py`

Cambios:

- Heredar tema global.
- Agrupar campos relacionados con `QFrame[card="true"]` cuando no altere la estructura funcional.
- Labels secundarios, inputs consistentes, botones primarios/secundarios.
- Mantener mensajes de validacion y estado error.

No se toca:

- Mapeo de campos.
- Validaciones de carga.
- Guardado de registros.
- Conexion a bases.

---

## 7. Plan de ejecucion por fases

### Fase 0 - Preparacion y linea base

Duracion estimada: 0.5 jornada.

Tareas:

1. Crear rama de trabajo.
2. Ejecutar la app actual y capturar pantallas de referencia: login, principal, busqueda con resultados, edicion, usuarios, selector de bases y una plantilla.
3. Registrar comandos de arranque usados por el equipo.
4. Confirmar version de PySide6 instalada.

Criterios de salida:

- Capturas antes/despues disponibles.
- Lista de flujos criticos acordada.
- Sin cambios funcionales todavia.

### Fase 1 - Infraestructura de tema

Duracion estimada: 1 jornada.

Tareas:

1. Crear `ui/theme.py`.
2. Crear `ui/theme_qss.py`.
3. Reescribir `ui/styles.py` como capa de compatibilidad.
4. Aplicar `app.setStyleSheet(get_theme_qss())` en `base_datcorr.py`.
5. Verificar que `ventana_principal.py` herede el tema desde el `QApplication`.

Criterios de salida:

- La app arranca.
- Login abre.
- Ventana principal abre luego de login.
- No hay excepciones por imports.
- `ui/styles.py` sigue exportando las funciones actuales.

### Fase 2 - Piloto visual: login y ventana principal

Duracion estimada: 1 a 2 jornadas.

Tareas:

1. Limpiar estilos inline de `ui/inicio_sesion.ui`.
2. Regenerar `ui/inicio_sesion_ui.py`.
3. Limpiar estilos inline de `ui/AplicacionPrincipal.ui`.
4. Regenerar `ui/AplicacionPrincipal_ui.py`.
5. Reemplazar estilos hardcodeados en `ventana_principal.py` por tokens.
6. Ajustar variantes de botones y propiedades dinamicas.
7. Ajustar `ResaltadoCoincidenciaDelegate` para usar colores semanticos.

Criterios de salida:

- Login mantiene autenticacion.
- Recuperar contrasena mantiene su flujo.
- Combo de bases carga datos.
- Busqueda retorna resultados.
- Pestañas se crean y cierran.
- Edicion por doble click sigue funcionando.
- Reportes abre desde toolbar.

### Fase 3 - Usuarios, permisos y dialogos

Duracion estimada: 1 a 2 jornadas.

Tareas:

1. Migrar ventanas de usuario y permisos.
2. Regenerar `_ui.py` correspondientes.
3. Revisar botones, tablas, combos, mensajes y errores.
4. Validar foco visible y tab order.

Criterios de salida:

- Administracion de usuarios abre.
- Alta, edicion, permisos, activar/desactivar funcionan.
- Mensajes de exito/error se leen correctamente.
- No hay contrastes invalidos evidentes.

### Fase 4 - Plantillas de carga y formularios dinamicos

Duracion estimada: 1 a 2 jornadas.

Tareas:

1. Migrar plantillas `.ui`.
2. Revisar `ui/dynamic_form.py`.
3. Revisar `controller/cargador_plantillas.py` solo si algun estilo depende de la carga.
4. Mantener validaciones visuales con propiedad `error="true"`.

Criterios de salida:

- Todas las plantillas cargan desde la ventana principal.
- Los campos mantienen nombres y comportamiento.
- Validaciones siguen visibles.
- Guardado de datos no cambia.

### Fase 5 - QA final y cierre

Duracion estimada: 1 jornada.

Tareas:

1. Ejecutar pruebas Python existentes que apliquen al area.
2. Ejecutar prueba manual completa de escritorio.
3. Revisar busqueda de hex hardcodeados restantes con `rg`.
4. Revisar contraste minimo de tokens.
5. Documentar decisiones finales y excepciones aceptadas.

Criterios de salida:

- Flujos criticos aprobados por equipo.
- Sin regresiones funcionales conocidas.
- Estilos restantes hardcodeados justificados o migrados.
- Plan visual listo para implementacion productiva.

---

## 8. Estrategia para no romper funcionalidades

### 8.1 Reglas de implementacion

- No modificar servicios, repositorios, modelos, migraciones ni endpoints.
- No cambiar nombres de widgets usados desde Python sin actualizar referencias y probarlas.
- No editar `_ui.py` a mano como solucion permanente.
- No eliminar funciones de `ui/styles.py` durante las primeras fases.
- No aplicar QSS global con selectores demasiado amplios que agreguen border/padding a todo `QWidget`.
- No cambiar logica de permisos ni niveles de seguridad.

### 8.2 Validacion obligatoria por flujo

Flujos minimos:

1. Login correcto.
2. Login incorrecto.
3. Recuperar contrasena.
4. Carga de ventana principal.
5. Selector de base.
6. Busqueda con resultados.
7. Busqueda sin resultados.
8. Apertura/cierre de pestañas.
9. Edicion de registro.
10. Administracion de usuarios.
11. Alta/edicion/permisos de usuarios.
12. Carga de cada plantilla.
13. Mensajes de error y confirmacion.

### 8.3 Pruebas tecnicas sugeridas

```powershell
python base_datcorr.py
python ventana_principal.py
pytest
rg -n "#[0-9a-fA-F]{3,8}|rgb\\(|rgba\\(" ui ventanas ventana_principal.py base_datcorr.py
```

Nota: `python ventana_principal.py` puede requerir una sesion valida. Si falla por sesion invalida, se considera esperado y se valida desde login.

---

## 9. Riesgos y mitigaciones

| Riesgo                                                 | Probabilidad | Impacto | Mitigacion                                                                           |
| ------------------------------------------------------ | -----------: | ------: | ------------------------------------------------------------------------------------ |
| QSS global afecta widgets inesperados                  |        Media |    Alto | Piloto en login/principal, selectores especificos, pruebas por flujo                 |
| Cambios en`.ui` generan diffs grandes                |         Alta |   Medio | Editar por ventana, regenerar y revisar diff por fase                                |
| `_ui.py` queda desincronizado                        |        Media |    Alto | Regenerar con`pyside6-uic` despues de cada `.ui`                                 |
| `styles.py` es usado por codigo legado               |         Alta |   Medio | Mantener firmas y migrar implementacion interna                                      |
| Contraste insuficiente en estados semanticos           |         Baja |   Medio | Validar tokens y chips con texto/icono                                               |
| Tema oscuro entra en conflicto con guia web light-only |        Media |   Medio | Aprobar navy como decision de escritorio o actualizar`DESIGN.md` en fase posterior |
| Regresion en plantillas                                |        Media |    Alto | Migrar plantillas al final, una por una                                              |
| Dependencia de rutas de iconos                         |        Media |    Bajo | Mantener`img/Datcorr.ico` / `img/datcorr.ico` y verificar carga                  |

---

## 10. Criterios de aprobacion del equipo

El equipo deberia aprobar explicitamente:

1. Direccion visual navy institucional para escritorio.
2. Implementacion por fases, empezando por infraestructura y piloto.
3. Uso de `ui/theme.py` y `ui/theme_qss.py` como fuente central.
4. Conservacion temporal de `ui/styles.py`.
5. Regeneracion de `_ui.py` desde `.ui`.
6. No tocar logica de negocio, permisos, servicios ni backend.
7. Checklist funcional obligatorio antes de cerrar cada fase.

---

## 11. Definicion de terminado

El redisenio se considera terminado cuando:

- Todas las ventanas principales heredan el tema.
- Login, ventana principal, usuarios, permisos, selector y plantillas tienen estilo consistente.
- No quedan estilos inline conflictivos en las superficies migradas.
- Los colores hardcodeados restantes estan documentados como excepciones o eliminados.
- La app ejecuta los flujos criticos sin regresiones.
- El equipo aprueba capturas antes/despues.
- Se documenta la decision final de coherencia entre escritorio y web.

---

## 12. Recomendacion final

La propuesta es viable y conveniente si se ejecuta como migracion visual controlada, no como reescritura funcional. La mejor combinacion de los tres documentos es:

- Base tecnica: `Plan_Rediseno_Estilo_Escritorio.md`.
- Arquitectura de archivos y compatibilidad: `plan_rediseno_app_desktop.md`.
- Componentes, KPI, tablas y accesibilidad: `plan_rediseño_escritorio_datcorr.md`.

Recomendacion para aprobacion: avanzar con Fase 0, Fase 1 y Fase 2 como primer paquete. Solo despues de validar login y ventana principal conviene aprobar la migracion completa de usuarios, dialogos y plantillas.

Revisé el proyecto sin modificar archivos. La estructura general está encaminada, pero hay varios conflictos típicos de una migración híbrida desktop + API + web.

**Hallazgos Críticos**

1. **Login API puede romper si el usuario no existe**
   En **backend/services/auth_service.py (line 63)** se hace **usuario_db.id** antes de validar **if not usuario_db**. Si el usuario no existe, cae con excepción en vez de devolver “Usuario incorrecto”.
2. **Frontend edita con **PUT**, backend espera **PATCH****
   Frontend: **frontend/src/services/usuariosService.js (line 26)**
   Backend: **backend/routers/usuarios_router.py (line 278)**
   Resultado: editar usuario desde la web probablemente falla con **405 Method Not Allowed**.
3. **Modal web dice “Editar Usuario”, pero siempre crea**
   En **frontend/src/components/modals/UsuarioModal.jsx (line 60)** siempre llama **crearUsuario**, incluso si **usuario** existe. Falta llamar **actualizarUsuario**.
4. **Desktop mezcla dos caminos de datos**
   Login desktop usa API: **base_datcorr.py (line 54)**
   Pero administración de usuarios desktop usa directo BD/repositorios: **ventanas/ventana_usuarios.py (line 11)**
   Esto puede duplicar reglas de negocio: permisos, auditoría, validaciones, protección de superusuario, etc.
5. **Bug en reset de password desktop**
   En **ventanas/ventana_editar_usuario.py (line 98)** usa **nueva_password**, pero esa variable no existe. También en **ventanas/ventana_editar_usuario.py (line 170)** valida **usuario.strip()** en vez de **usuario_texto.strip()**.

**Duplicidad Clara**

* **frontend/src** y **frontend/src_old**: hay dos frontends conviviendo. El activo parece ser **frontend/src**; **src_old** debería aislarse o archivarse.
* **frontend/src/api/axiosClient.js** y **frontend/src/api/api.js**: hacen prácticamente lo mismo.
* **backend/services/usuarios_service.py** y **backend/services/usuario_service_web.py**: ambos tienen **crear_usuario_web**; el router usa **usuarios_service.py**, así que **usuario_service_web.py** parece legado.
* **services/usuario_service.py** y **backend/services/usuarios_service.py**: mismo dominio, pero uno directo a BD para desktop y otro para API web.
* **backend/database/conexion.py** y **backend/dependencies.py**: ambos exponen **get_db**, pero delegan en **database/conexion.py**. No rompe, pero confunde.

**Problemas De Configuración**

* **core/api_client.py** usa **requests**, pero **requirements.txt** no lo declara.
* Hay **package.json** en raíz y en **frontend**. El de raíz solo trae **react-router-dom**; el real parece ser **frontend/package.json**.
* **npm.cmd run build** en **frontend** falla porque no existe **frontend/node_modules/vite**. No es error de código todavía; falta instalar dependencias en esa carpeta.
* Hay un archivo/carpeta raro: **origin)** en la raíz. Conviene verificar si fue accidental.

**Plan Paso A Paso Para No Romper Lo Que Funciona**

1. **Correcciones pequeñas y seguras**
   * Mover la validación **if not usuario_db** antes de **logger.debug(usuario_db.id)**.
   * Cambiar **PUT** por **PATCH** en **frontend/src/services/usuariosService.js**.
   * Arreglar **nueva_password** y **usuario_texto.strip()** en **ventana_editar_usuario.py**.
   * Agregar **requests** a **requirements.txt**.
2. **Ordenar frontend activo**
   * Dejar **frontend/src** como fuente oficial.
   * Mover **frontend/src_old** a algo como **frontend/_archive/src_old** o excluirlo de lint/build.
   * Eliminar uno de los clientes API: conservar **axiosClient.js** y retirar **api.js**, o viceversa.
3. **Unificar flujo de usuarios**
   * Primero hacer que web funcione completo: listar, crear, editar, desactivar.
   * Luego adaptar desktop usuario/admin para consumir API gradualmente, empezando por listar usuarios.
   * Mantener los servicios directos a BD solo mientras el desktop migra, marcándolos como “legacy”.
4. **Centralizar reglas**
   * La API debería ser la autoridad para usuarios, permisos, auditoría y tokens.
   * Desktop y web deberían llamar la misma API para evitar comportamientos distintos.
5. **Verificación por etapas**
   * **python -m compileall -q .** ya pasó correctamente.
   * Luego instalar dependencias frontend en **frontend**.
   * Ejecutar build.
   * Probar manualmente: login, listar usuarios, crear usuario, editar usuario, desactivar usuario, reset password.


## La idea importante es esta:

El modelo no debería “aprenderse” toda la base de datos ni guardar permanentemente todos los registros dentro de sus parámetros. Lo recomendable es conectarlo a la aplicación y darle acceso controlado al contexto y a los datos que necesite en cada consulta.

Por ejemplo, el usuario podría escribir:

“¿Cuántas cajas pertenecen al organismo IPS?”

o:

“Buscá el expediente 1245 y decime en qué caja está.”

o:

“¿Qué documentación contiene la caja 38?”

o incluso:

“Explicame cómo registrar un movimiento de una caja.”

El modelo tendría que combinar dos fuentes de conocimiento:

Conocimiento de la aplicación: qué hace DATCORR, qué significan las pantallas, qué son las cajas, expedientes, movimientos, usuarios, permisos, organismos, etc.
Datos reales de PostgreSQL: información actualizada sobre cajas, documentos, expedientes, movimientos y demás registros.

Para tu proyecto, yo plantearía esta arquitectura:

┌────────────────────────────┐
│ Aplicación de escritorio   │
│ PySide6 / DATCORR          │
│                            │
│ Usuario escribe una        │
│ pregunta en un chat        │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│ Servicio IA local          │
│ ai_service.py              │
│                            │
│ Analiza la pregunta        │
│ Obtiene contexto           │
│ Consulta datos permitidos  │
└─────────────┬──────────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
┌────────────┐ ┌──────────────┐
│ Qwen local │ │ PostgreSQL   │
│ Comprende  │ │ Datos reales │
│ lenguaje   │ │ de DATCORR   │
└────────────┘ └──────────────┘

En el  caso del proyecto, como ya migramos DATCORR a PostgreSQL y tenemos una arquitectura con servicios, esto se puede integrar bastante bien.

## Lo primero: identificar cómo se esta ejecutando Qwen

Por ejemplo, podría estar ejecutándose mediante:

Ollama
LM Studio
llama.cpp
GPT4All
Jan
alguna instalación directa de Python/Transformers

# Sistema DATCORR

DATCORR es un sistema de gestión y control de documentación
almacenada en depósitos.

## Conceptos principales

- Caja: unidad física utilizada para almacenar documentación.
- Expediente: documento o conjunto documental identificado mediante
  un número u otros campos.
- Organismo: institución o dependencia propietaria de la documentación.
- Movimiento: registro del traslado, préstamo, devolución o cambio
  de ubicación de una caja.
- Usuario: persona autorizada para utilizar el sistema.

## Roles

- ADMIN: acceso completo.
- OFICINA: gestión administrativa.
- DEPÓSITO: operaciones relacionadas con cajas y movimientos.
- CONSULTA: acceso de solo lectura.

## Bases y esquemas

El sistema utiliza PostgreSQL.

Los esquemas disponibles incluyen:

- ips
- pediatrico
- igpj
- igpj_listado_nuevo
- igpj_txt_listado
- maternidad
- escribania

## Reglas

La IA no debe modificar ni eliminar información.
La IA solamente puede consultar datos.
La IA debe indicar cuando no encuentra información suficiente.

Ese documento sería parte del contexto que recibe Qwen.

Pero hay una diferencia importante:

El contexto de la aplicación puede estar siempre disponible

Por ejemplo:

“¿Qué hace el módulo de movimientos?”

La IA puede responder utilizando el documento de conocimiento.

Los datos de PostgreSQL se consultan en tiempo real

Por ejemplo:

“¿Cuántos registros hay en la base IPS?”

No conviene copiar los 22.048 registros de IPS dentro del prompt. La aplicación debería consultar PostgreSQL y entregar al modelo solamente el resultado:

Resultado de la consulta:

La tabla IPS contiene 22.048 registros.

Entonces Qwen responde:

“Actualmente, la base IPS contiene 22.048 registros.”

Eso es mucho más eficiente, seguro y preciso.

El componente central sería un servicio de IA

Podríamos crear:

services/
├── auth_service.py
├── permisos_service.py
├── database_service.py
└── ai_service.py

El archivo ai_service.py podría tener una estructura inicial como esta:

class AIService:

    def consultar(self, pregunta, usuario_actual):
        # 1. Identificar qué quiere el usuario
        # 2. Obtener contexto de DATCORR
        # 3. Consultar PostgreSQL si es necesario
        # 4. Enviar contexto y pregunta a Qwen
        # 5. Devolver la respuesta
        pass

Después, la ventana de PySide6 tendría un botón o panel:

┌─────────────────────────────────────────┐
│ Asistente DATCORR                       │
├─────────────────────────────────────────┤
│ ¿En qué caja está el expediente 1254?   │
│                                         │
│ [ Preguntar ]                           │
├─────────────────────────────────────────┤
│ El expediente 1254 se encuentra en la   │
│ caja 38, correspondiente al organismo   │
│ IPS.                                    │
└─────────────────────────────────────────┘
Hay tres niveles posibles de implementación

Para DATCORR, yo los separaría así:

Nivel 1: asistente informativo

La IA conoce:

cómo funciona DATCORR;
qué hace cada módulo;
qué significa cada campo;
cómo utilizar las pantallas;
cuáles son las funciones de cada rol.

Ejemplos:

“¿Cómo registro una caja?”

“¿Qué diferencia hay entre búsqueda simple y exhaustiva?”

“¿Qué permisos tiene un usuario de consulta?”

Este nivel es el más fácil de implementar porque todavía no consulta la base.

Nivel 2: asistente conectado a los datos

La IA puede responder preguntas como:

“¿Cuántas cajas hay en IPS?”

“¿Dónde está el expediente 1548?”

“Mostrame los documentos de la caja 32.”

“¿Cuántos registros tiene la base Pediátrico?”

Acá Qwen interpreta la pregunta, pero PostgreSQL sigue siendo quien entrega los datos reales.

Este sería el nivel más útil para DATCORR.

Nivel 3: asistente inteligente con herramientas

La IA puede decidir qué función utilizar:

buscar_expediente(numero)

buscar_caja(numero)

contar_registros(esquema)

obtener_movimientos(caja)

buscar_documentacion(texto)

Por ejemplo, el usuario pregunta:

“¿Dónde está el expediente 1254 y tuvo movimientos recientemente?”

La IA podría ejecutar internamente:

1. buscar_expediente(1254)
2. obtener_movimientos(caja_encontrada)
3. redactar una respuesta

El modelo no necesita escribir SQL libremente. En cambio, llama funciones controladas de tu aplicación.

Esta es la arquitectura que más te recomendaría.

No recomendaría que Qwen ejecute SQL directamente

Una primera idea podría ser:

Usuario
   ↓
Qwen genera SQL
   ↓
PostgreSQL ejecuta SQL

Pero eso puede producir errores o consultas peligrosas.

Por ejemplo, el modelo podría generar accidentalmente:

DELETE FROM ips.documentos;

Aunque se le indique que no lo haga, no conviene confiar la seguridad solamente al prompt.

Sería mejor:

Usuario
   ↓
Qwen identifica la intención
   ↓
Servicio Python autorizado
   ↓
Funciones de consulta predefinidas
   ↓
PostgreSQL

Por ejemplo:

def buscar_expediente(numero):
    return database_service.buscar_expediente(numero)

Y el servicio solo permite consultas de lectura.

Además, podríamos usar una conexión PostgreSQL exclusiva para la IA con permisos limitados:

Usuario PostgreSQL: datcorr_ia

Permisos:
✓ SELECT

Sin permisos:
✗ INSERT
✗ UPDATE
✗ DELETE
✗ DROP
✗ ALTER

Eso sería una protección real a nivel de base de datos.

También debería respetar los permisos del usuario

Esto es muy importante para el sistema.

Si un usuario con rol CONSULTA no puede acceder a cierta información, la IA tampoco debería poder verla.

El flujo debería ser:

Usuario autenticado
       │
       ▼
Rol y permisos actuales
       │
       ▼
AIService
       │
       ▼
Solo consulta datos permitidos
       │
       ▼
Qwen genera la respuesta

La IA no debería tener acceso independiente a toda la base. Tendría que actuar con las mismas restricciones del usuario que inició sesión.

Respecto al tamaño de Qwen

Un modelo de aproximadamente 9B parámetros puede ser suficiente para:

responder preguntas sobre la aplicación;
interpretar solicitudes en lenguaje natural;
resumir resultados;
explicar procedimientos;
combinar información de varias consultas;
funcionar como asistente interno.

No necesita ser enorme si el contexto y las herramientas están bien diseñados.

Para preguntas muy complejas, el resultado dependerá bastante de:

la RAM disponible;
si usás CPU o GPU;
el formato de cuantización;
la cantidad de contexto enviada;
cómo esté implementada la recuperación de información.

Para DATCORR, un modelo local de ese tamaño puede ser una opción razonable.

Propuesta concreta para el proyecto

Avanzar en este orden:

Confirmar cómo se ejecuta Qwen localmente.
Crear services/ai_service.py.
Conectar Python con la API local del modelo.
Crear un archivo conocimiento_datcorr.md.
Agregar un panel de chat en PySide6.
Probar preguntas sobre el funcionamiento de DATCORR.
Agregar funciones seguras:
buscar expediente;
buscar caja;
consultar organismo;
contar registros;
obtener movimientos.
Integrar permisos del usuario.
Crear un usuario PostgreSQL de solo lectura para la IA.
Más adelante agregar búsqueda semántica/RAG para documentación extensa.

La clave es que Qwen sería el cerebro conversacional, mientras que DATCORR y PostgreSQL seguirían siendo la fuente real y controlada de los datos.

from sqlalchemy import text
from database.conexion import engine
from database.modelos import Base

# -----------------------------------
# IMPORTAR MODELOS SIMCO
# -----------------------------------

import database.modelos_simco  # noqa
import database.modelos_notificaciones  # noqa
import database.modelos_registro  # noqa
import database.modelos_blacklist  # noqa
import database.modelos_mensajes  # noqa


def crear_tablas():
    # -----------------------------------
    # SCHEMA & TABLAS
    # -----------------------------------

    print("\nCreando schemas...")

    with engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS simco"))
        conn.commit()

    print("Schemas creados.")

    print("Creando tablas PostgreSQL...\n")

    Base.metadata.create_all(bind=engine)

    print("Tablas creadas correctamente.")

    # -----------------------------------
    # MIGRACIONES
    # -----------------------------------

    print("Ejecutando migraciones...")

    with engine.connect() as conn:
        conn.execute(text("""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='registros_pendientes'
                    AND column_name='updated_at'
                    AND is_nullable='YES'
                    AND column_default IS NULL
                ) THEN
                    ALTER TABLE registros_pendientes
                    ALTER COLUMN updated_at SET DEFAULT NOW();
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='usuarios'
                    AND column_name='google_id'
                ) THEN
                    ALTER TABLE usuarios ADD COLUMN google_id VARCHAR(255) UNIQUE;
                    ALTER TABLE usuarios ADD COLUMN google_email VARCHAR(255);
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='usuarios'
                    AND column_name='auth_provider'
                ) THEN
                    ALTER TABLE usuarios ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'local';
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='registros_pendientes' AND column_name='password_hash'
                ) THEN
                    ALTER TABLE registros_pendientes ADD COLUMN password_hash VARCHAR(255);
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='simco' AND table_name='solicitudes' AND column_name='archivo_nombre'
                ) THEN
                    ALTER TABLE simco.solicitudes ADD COLUMN archivo_nombre VARCHAR(500);
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='simco' AND table_name='respuestas' AND column_name='archivo_nombre'
                ) THEN
                    ALTER TABLE simco.respuestas ADD COLUMN archivo_nombre VARCHAR(500);
                END IF;
            END $$;
        """))
        conn.commit()

    print("Migraciones ejecutadas.")

if __name__ == "__main__":
    crear_tablas()
"""
sync_sequences.py
=================
Re-sincroniza las secuencias de ID con el MAX actual de cada tabla.

Ejecutar cada vez que se reemplacen datos de prueba con datos de produccion,
o cuando se carguen datos masivos desde fuera de la aplicacion.

    python sync_sequences.py
"""
import psycopg2

SCHEMAS = ["ips", "pediatrico", "igpj", "igpj_listado_nuevo", "escribania", "maternidad"]

conn = psycopg2.connect(
    dbname="datcorr",
    user="postgres",
    password="postgres123",
    host="localhost",
    port=5432
)
conn.autocommit = True
cur = conn.cursor()

print("=" * 60)
print("  SINCRONIZACION DE SECUENCIAS")
print("=" * 60)

for schema in SCHEMAS:
    # Verificar tabla
    cur.execute("""
        SELECT COUNT(*) FROM information_schema.tables
        WHERE table_schema = %s AND table_name = 'Datcorr_database'
    """, (schema,))
    if not cur.fetchone()[0]:
        print(f"  SKIP '{schema}': tabla no existe")
        continue

    # Verificar que la secuencia existe
    seq_name = f'"{schema}"."datcorr_id_seq"'
    cur.execute("""
        SELECT COUNT(*) FROM information_schema.sequences
        WHERE sequence_schema = %s AND sequence_name = 'datcorr_id_seq'
    """, (schema,))
    seq_exists = cur.fetchone()[0]

    if not seq_exists:
        # Si no existe la secuencia, crearla (puede ocurrir con schemas nuevos)
        cur.execute(f'CREATE SEQUENCE IF NOT EXISTS {seq_name}')
        cur.execute(f"""
            ALTER TABLE "{schema}"."Datcorr_database"
            ALTER COLUMN "id_Datcorr_database"
            SET DEFAULT nextval({seq_name!r})
        """)
        print(f"  CREADA secuencia nueva en '{schema}'")

    # Obtener MAX actual
    cur.execute(f'SELECT COALESCE(MAX("id_Datcorr_database"), 0) FROM "{schema}"."Datcorr_database"')
    max_id = cur.fetchone()[0]
    next_val = max_id + 1

    # Obtener valor actual de la secuencia
    cur.execute(f"SELECT last_value, is_called FROM {seq_name}")
    last_value, is_called = cur.fetchone()

    if is_called and last_value >= max_id:
        print(f"  OK '{schema}': secuencia en {last_value}, max_id={max_id} (no necesita ajuste)")
    else:
        # Ajustar la secuencia al valor correcto
        cur.execute(f"SELECT setval({seq_name!r}, {next_val}, false)")
        print(f"  AJUSTADA '{schema}': max_id={max_id} -> proxima PK={next_val}")

cur.close()
conn.close()
print("\nSincronizacion completada.")

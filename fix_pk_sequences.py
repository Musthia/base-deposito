"""
fix_pk_sequences.py  –  Crea secuencias y asigna DEFAULT a la columna PK
en todos los schemas de la base datcorr.

Ejecutar UNA SOLA VEZ desde la raiz del proyecto:
    python fix_pk_sequences.py
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

for schema in SCHEMAS:
    print(f"\n--- Schema: {schema} ---")

    # Verificar que la tabla existe
    cur.execute("""
        SELECT COUNT(*) FROM information_schema.tables
        WHERE table_schema = %s AND table_name = 'Datcorr_database'
    """, (schema,))
    if not cur.fetchone()[0]:
        print(f"  SKIP: tabla no existe en schema '{schema}'")
        continue

    # Verificar si ya tiene DEFAULT (no reprocesar)
    cur.execute("""
        SELECT column_default, is_identity
        FROM information_schema.columns
        WHERE table_schema = %s AND table_name = 'Datcorr_database'
        AND LOWER(column_name) = 'id_datcorr_database'
    """, (schema,))
    row = cur.fetchone()
    if not row:
        print(f"  SKIP: columna PK no encontrada")
        continue

    col_default, is_identity = row

    if col_default and "nextval" in str(col_default):
        print(f"  OK: ya tiene SEQUENCE, no se modifica")
        continue
    if is_identity == "YES":
        print(f"  OK: ya tiene IDENTITY, no se modifica")
        continue

    # Obtener el valor actual maximo para inicializar la secuencia
    cur.execute(f'SELECT COALESCE(MAX("id_Datcorr_database"), 0) FROM "{schema}"."Datcorr_database"')
    max_id = cur.fetchone()[0]
    start_val = max_id + 1

    seq_name = f'"{schema}"."datcorr_id_seq"'

    print(f"  Creando secuencia {seq_name} starting at {start_val}...")
    cur.execute(f'CREATE SEQUENCE IF NOT EXISTS {seq_name} START {start_val}')

    print(f"  Asignando DEFAULT nextval a columna PK...")
    cur.execute(f"""
        ALTER TABLE "{schema}"."Datcorr_database"
        ALTER COLUMN "id_Datcorr_database"
        SET DEFAULT nextval({seq_name!r})
    """)

    print(f"  LISTO para schema '{schema}' (max actual: {max_id}, proxima PK: {start_val})")

cur.close()
conn.close()
print("\nTODO: secuencias aplicadas correctamente.")

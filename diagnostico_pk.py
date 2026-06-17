"""
diagnostico_pk.py
Ejecutar desde la raíz del proyecto:
    python diagnostico_pk.py
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
cur = conn.cursor()

for schema in SCHEMAS:
    print(f"\n{'='*60}")
    print(f"  SCHEMA: {schema}")
    print(f"{'='*60}")

    # 1. Verificar si la tabla existe
    cur.execute("""
        SELECT COUNT(*) FROM information_schema.tables
        WHERE table_schema = %s AND table_name = 'Datcorr_database'
    """, (schema,))
    existe = cur.fetchone()[0]

    if not existe:
        print("  ⚠️  Tabla 'Datcorr_database' NO EXISTE en este schema")
        continue

    # 2. Buscar columna PK
    cur.execute("""
        SELECT column_name, data_type, column_default, is_nullable, is_identity
        FROM information_schema.columns
        WHERE table_schema = %s AND table_name = 'Datcorr_database'
        AND LOWER(column_name) = 'id_datcorr_database'
    """, (schema,))
    row = cur.fetchone()

    if not row:
        print("  ❌ Columna 'id_Datcorr_database' NO encontrada")
        continue

    col_name, data_type, col_default, is_nullable, is_identity = row
    print(f"  Columna      : {col_name}")
    print(f"  Tipo         : {data_type}")
    print(f"  Default      : {col_default}")
    print(f"  Nullable     : {is_nullable}")
    print(f"  Is Identity  : {is_identity}")

    # 3. Diagnóstico
    if col_default and "nextval" in str(col_default):
        print("  ✅ Tiene SERIAL/SEQUENCE → autoincremento OK")
    elif is_identity == "YES":
        print("  ✅ Tiene IDENTITY → autoincremento OK")
    else:
        print("  ❌ SIN autoincremento → esto causa el error al guardar")

cur.close()
conn.close()

print("\n")
print("=" * 60)
print("SQL DE CORRECCIÓN (copiar y ejecutar en pgAdmin):")
print("=" * 60)
for schema in SCHEMAS:
    print(f"""
-- {schema}
CREATE SEQUENCE IF NOT EXISTS "{schema}"."datcorr_id_seq";
ALTER TABLE "{schema}"."Datcorr_database"
    ALTER COLUMN "id_Datcorr_database"
    SET DEFAULT nextval('"{schema}"."datcorr_id_seq"');
SELECT setval('"{schema}"."datcorr_id_seq"',
    COALESCE((SELECT MAX("id_Datcorr_database") FROM "{schema}"."Datcorr_database"), 0) + 1, false);
""")

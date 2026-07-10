# test_dao_postgres.py

import sys
import os
from dotenv import load_dotenv

load_dotenv()

# Asegura que el proyecto está en el path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db.registry import initialize_postgres, db_registry
from model.datcorr_dao_postgres import DatcorrDAOPostgres
from sqlalchemy import text


def test_conexion():
    print("=== 1. Inicializar engine PostgreSQL ===")
    engine = initialize_postgres()
    assert engine is not None, "Engine no debería ser None"
    with engine.connect() as conn:
        result = conn.execute(text("SELECT current_database()"))
        db_name = result.scalar()
        print(f"   Conectado a: {db_name}")
        assert db_name == "datcorr", f"Esperaba 'datcorr', obtuve '{db_name}'"
    print("   OK")


def test_listar_schemas():
    print("\n=== 2. Listar schemas disponibles ===")
    engine = db_registry.get_engine()
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT schema_name FROM information_schema.schemata "
                 "WHERE schema_name NOT IN ('public','information_schema','pg_catalog','pg_toast')")
        )
        schemas = [row[0] for row in result]
        print(f"   Schemas encontrados: {schemas}")
        assert len(schemas) > 0, "Debe haber al menos un schema"
    print("   OK")


def test_dao_insert_escribania():
    print("\n=== 3. DAO Postgres - INSERT en schema escribania ===")
    dao = DatcorrDAOPostgres(schema="escribania")

    id_insertado = dao.insertar(
        estado="TEST",
        ingreso="TEST-INGRESO",
        egreso="TEST-EGRESO",
        observaciones="Test de inserción DAO Postgres",
        caja="TEST-CAJA",
        localidad="TEST-LOCALIDAD",
        legajo="TEST-LEGAJO",
        nombre_apellido="TEST-NOMBRE",
        timbrado_fiscal="TEST-TIMBRADO",
    )
    print(f"   ID insertado: {id_insertado}")
    assert id_insertado is not None, "El ID no debería ser None"
    assert isinstance(id_insertado, int), f"El ID debería ser int, es {type(id_insertado)}"
    print("   OK")

    # Guardar ID para limpieza
    return id_insertado


def test_dao_update_escribania(id_registro):
    print(f"\n=== 4. DAO Postgres - UPDATE en escribania (ID={id_registro}) ===")
    dao = DatcorrDAOPostgres(schema="escribania")

    dao.actualizar(id_registro, columna="observaciones", valor="TEST-UPDATE OK")
    print("   UPDATE ejecutado sin error")

    # Verificar
    engine = db_registry.get_engine()
    with engine.connect() as conn:
        result = conn.execute(
            text('SELECT observaciones FROM "escribania"."Datcorr_database" '
                 'WHERE "id_Datcorr_database" = :id'),
            {"id": id_registro}
        )
        valor = result.scalar()
        assert valor == "TEST-UPDATE OK", f"Esperaba 'TEST-UPDATE OK', obtuve '{valor}'"
    print("   Verificado en DB: TEST-UPDATE OK")
    print("   OK")


def test_dao_delete_escribania(id_registro):
    print(f"\n=== 5. DAO Postgres - DELETE en escribania (ID={id_registro}) ===")
    dao = DatcorrDAOPostgres(schema="escribania")

    dao.eliminar(id_registro)
    print("   DELETE ejecutado sin error")

    # Verificar que ya no existe
    engine = db_registry.get_engine()
    with engine.connect() as conn:
        result = conn.execute(
            text('SELECT COUNT(*) FROM "escribania"."Datcorr_database" '
                 'WHERE "id_Datcorr_database" = :id'),
            {"id": id_registro}
        )
        count = result.scalar()
        assert count == 0, f"El registro debería haber sido eliminado, count={count}"
    print("   Verificado: registro ya no existe en DB")
    print("   OK")


def test_dao_insert_maternidad():
    print("\n=== 6. DAO Postgres - INSERT en schema maternidad ===")
    dao = DatcorrDAOPostgres(schema="maternidad")

    id_insertado = dao.insertar(
        caja="TEST-CAJA",
        estado="TEST-ESTADO",
        caratula="TEST-CARATULA",
        expediente="TEST-EXPEDIENTE",
        ingreso="TEST-INGRESO",
        egreso="TEST-EGRESO",
        observaciones="Test inserción maternidad",
        denominacion="TEST-DENOMINACION",
        documento="TEST-DOCUMENTO",
        fecha="2024-01-01",
    )
    print(f"   ID insertado en maternidad: {id_insertado}")
    assert id_insertado is not None
    assert isinstance(id_insertado, int)
    print("   OK")

    # Limpiar
    dao.eliminar(id_insertado)
    print("   Limpieza OK")


if __name__ == "__main__":
    try:
        test_conexion()
        test_listar_schemas()
        id_temp = test_dao_insert_escribania()
        test_dao_update_escribania(id_temp)
        test_dao_delete_escribania(id_temp)
        test_dao_insert_maternidad()
        print("\n=== TODAS LAS PRUEBAS PASARON ===")
    except AssertionError as e:
        print(f"\nFALLO: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\nERROR INESPERADO: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

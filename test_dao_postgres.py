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

    dao.eliminar(id_insertado)
    print("   Limpieza OK")


def test_buscar_autocomplete():
    print("\n=== 7. DAO Postgres - buscar_autocomplete en escribania ===")
    dao = DatcorrDAOPostgres(schema="escribania")

    # Insertar registro de prueba con datos distintivos
    id_temp = dao.insertar(
        estado="AUTOCOMPLETE-TEST",
        ingreso="TEST-INGRESO",
        egreso="TEST-EGRESO",
        observaciones="Registro para test autocomplete",
        caja="TEST-CAJA",
        localidad="TEST-LOCALIDAD",
        legajo="TEST-LEGAJO",
        nombre_apellido="JUAN PEREZ AUTOCOMPLETE",
        timbrado_fiscal="TEST-TIMBRADO",
    )
    assert id_temp is not None

    # Buscar por nombre_apellido
    resultados = dao.buscar_autocomplete("nombre_apellido", "JUAN PEREZ")
    print(f"   Resultados autocomplete por nombre_apellido: {len(resultados)}")
    assert len(resultados) > 0, "Debe encontrar al menos 1 resultado"
    encontrado = any(r[0] == id_temp for r in resultados)
    assert encontrado, "El registro insertado debe aparecer en resultados"
    print("   OK")

    # Buscar por caja
    resultados = dao.buscar_autocomplete("caja", "TEST-CAJA")
    print(f"   Resultados autocomplete por caja: {len(resultados)}")
    assert len(resultados) > 0
    print("   OK")

    # Buscar sin resultados
    resultados = dao.buscar_autocomplete("nombre_apellido", "ZZZZNOEXISTE")
    assert len(resultados) == 0, "No debe encontrar resultados"
    print("   Búsqueda sin resultados OK")

    # Limpiar
    dao.eliminar(id_temp)
    print("   Limpieza OK")


def test_cargar_por_id():
    print("\n=== 8. DAO Postgres - cargar_por_id en escribania ===")
    dao = DatcorrDAOPostgres(schema="escribania")

    columnas = ["estado", "ingreso", "egreso", "observaciones", "caja",
                "localidad", "legajo", "nombre_apellido", "timbrado_fiscal"]

    id_temp = dao.insertar(
        estado="CARGA-TEST",
        ingreso="CI-INGRESO",
        egreso="CI-EGRESO",
        observaciones="Test cargar_por_id",
        caja="CI-CAJA",
        localidad="CI-LOCALIDAD",
        legajo="CI-LEGAJO",
        nombre_apellido="CI-NOMBRE",
        timbrado_fiscal="CI-TIMBRADO",
    )
    assert id_temp is not None

    datos = dao.cargar_por_id(id_temp, columnas)
    assert datos is not None, "cargar_por_id debe retornar un dict"
    assert datos["estado"] == "CARGA-TEST"
    assert datos["observaciones"] == "Test cargar_por_id"
    assert datos["nombre_apellido"] == "CI-NOMBRE"
    print(f"   Datos cargados: {datos}")
    print("   Todos los campos coinciden OK")

    dao.eliminar(id_temp)
    print("   Limpieza OK")


def test_utils_organismos():
    print("\n=== 9. Verificar utils.organismos ===")
    from utils.organismos import MAPA_SCHEMA, MAPEO_COLUMNAS_POR_ORGANISMO

    assert "IPS" in MAPA_SCHEMA
    assert MAPA_SCHEMA["IPS"] == "ips"
    assert MAPA_SCHEMA["ESCRIBANIA"] == "escribania"
    assert MAPA_SCHEMA["PEDIATRICO"] == "pediatrico"
    assert len(MAPA_SCHEMA) == 7

    assert "PEDIATRICO" in MAPEO_COLUMNAS_POR_ORGANISMO
    cols = MAPEO_COLUMNAS_POR_ORGANISMO["PEDIATRICO"]
    assert "caja" in cols
    assert "denominacion" in cols
    print(f"   PEDIATRICO columnas ({len(cols)}): {cols}")
    print("   OK")

    from utils.organismos import schema_para_base, columnas_para_base
    assert schema_para_base("IPS") == "ips"
    assert len(columnas_para_base("ESCRIBANIA")) == 9
    print("   Funciones schema_para_base y columnas_para_base OK")


if __name__ == "__main__":
    try:
        test_conexion()
        test_listar_schemas()
        id_temp = test_dao_insert_escribania()
        test_dao_update_escribania(id_temp)
        test_dao_delete_escribania(id_temp)
        test_dao_insert_maternidad()
        test_buscar_autocomplete()
        test_cargar_por_id()
        test_utils_organismos()
        print("\n=== TODAS LAS PRUEBAS PASARON ===")
    except AssertionError as e:
        print(f"\nFALLO: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\nERROR INESPERADO: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

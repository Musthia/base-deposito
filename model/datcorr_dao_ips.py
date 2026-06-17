# model/datcorr_dao_ips.py

class DatcorrDAO:

    def __init__(self, schema_name):
        self.schema = schema_name
        self._pk_col = None

    def _get_pk_col(self, conn):
        if self._pk_col is None:
            from sqlalchemy import text
            res = conn.execute(text(f"""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = '{self.schema}' AND table_name = 'Datcorr_database'
                AND LOWER(column_name) = 'id_datcorr_database'
            """))
            row = res.fetchone()
            self._pk_col = row[0] if row else "id_Datcorr_database"
        return self._pk_col

    def insertar(
        self,
        denominacion,
        expediente,
        documento,
        caratula,
        estado,  
        caja,  
        n_lote,       
        ingreso,
        egreso,
        ultimo_movimiento
    ):
        from sqlalchemy import text
        from db.registry import db_registry

        engine = db_registry.get_engine()
        with engine.begin() as conn:
            pk = self._get_pk_col(conn)
            query = text(f"""
                INSERT INTO "{self.schema}"."Datcorr_database" (
                    denominacion,
                    expediente,
                    documento,
                    caratula,
                    estado,  
                    caja,  
                    n_lote,       
                    ingreso,
                    egreso,
                    ultimo_movimiento,
                    registro
                )
                VALUES (
                    :denominacion,
                    :expediente,
                    :documento,
                    :caratula,
                    :estado,  
                    :caja,  
                    :n_lote,       
                    :ingreso,
                    :egreso,
                    :ultimo_movimiento,
                    NOW()
                )
                RETURNING "{pk}"
            """)
            id_insertado = conn.execute(query, {
                "denominacion": denominacion,
                "expediente": expediente,
                "documento": documento,
                "caratula": caratula,
                "estado": estado,  
                "caja": caja,  
                "n_lote": n_lote,       
                "ingreso": ingreso,
                "egreso": egreso,
                "ultimo_movimiento": ultimo_movimiento
            }).scalar()

        return id_insertado
    
    def actualizar(self, id_registro, columna, valor):
        from sqlalchemy import text
        from db.registry import db_registry

        engine = db_registry.get_engine()
        with engine.begin() as conn:
            pk = self._get_pk_col(conn)
            query = text(f"""
                UPDATE "{self.schema}"."Datcorr_database"
                SET "{columna}" = :valor
                WHERE "{pk}" = :id_registro
            """)
            conn.execute(query, {"valor": valor, "id_registro": id_registro})
    
    def eliminar(self, id_registro):
        from sqlalchemy import text
        from db.registry import db_registry

        engine = db_registry.get_engine()
        with engine.begin() as conn:
            pk = self._get_pk_col(conn)
            query = text(f"""
                DELETE FROM "{self.schema}"."Datcorr_database"
                WHERE "{pk}" = :id_registro
            """)
            conn.execute(query, {"id_registro": id_registro})

import sqlite3
import os

# model/datcorr_dao_ips.py

class DatcorrDAO:
    

    def __init__(self, ruta_db):
        self.ruta_db = ruta_db

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
        conn = sqlite3.connect(self.ruta_db)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO Datcorr_database (
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now','localtime'))
        """, (
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
        ))

        conn.commit()
        id_insertado = cursor.lastrowid  # ✅ CLAVE

        conn.close()

        return id_insertado
    
    def actualizar(self, id_registro, columna, valor):
        conn = sqlite3.connect(self.ruta_db)
        cursor = conn.cursor()
    
        query = f"""
            UPDATE Datcorr_database
            SET {columna} = ?
            WHERE id_Datcorr_database = ?
        """
    
        cursor.execute(query, (valor, id_registro))
        conn.commit()
        conn.close()
    
    def eliminar(self, id_registro):
        conn = sqlite3.connect(self.ruta_db)
        cursor = conn.cursor()
    
        cursor.execute(
            "DELETE FROM Datcorr_database WHERE id_datcorr_database = ?",
            (id_registro,)
        )
    
        conn.commit()
        conn.close()

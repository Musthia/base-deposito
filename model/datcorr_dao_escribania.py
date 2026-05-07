import sqlite3
import os

# model/datcorr_dao_escribania.py

class DatcorrDAO:
    

    def __init__(self, ruta_db):
        self.ruta_db = ruta_db

    def insertar(
        self,
        estado, 
        ingreso,
        egreso,
        observaciones, 
        caja,
        localidad, 
        legajo, 
        nombre_apellido, 
        timbrado_fiscal 
        
        
    ):
        conn = sqlite3.connect(self.ruta_db)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO Datcorr_database (
                        estado, 
                        ingreso,
                        egreso,
                        observaciones, 
                        caja,
                        localidad, 
                        legajo, 
                        nombre_apellido, 
                        timbrado_fiscal ,
                registro
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now','localtime'))
        """, (
            estado, 
            ingreso,
            egreso,
            observaciones, 
            caja,
            localidad, 
            legajo, 
            nombre_apellido, 
            timbrado_fiscal 
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

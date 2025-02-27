from core.ctrl_firebird import fb_sql

class sql_bascula(fb_sql):
    def obtener_bascula(self, id: int = None) -> dict:
            if id is None:
                query = """
                    SELECT ID, PESO, FECHA_HORA, COD_PROVEEDOR, PROVEEDOR, LOTE, PRODUCTO, FECHA_VEN
                    FROM REGISTRO_BASCULA
                """
                return self.buscar_todos(query, ())
            
            query = """
                SELECT ID, PESO, FECHA_HORA, COD_PROVEEDOR, PROVEEDOR, LOTE, PRODUCTO, FECHA_VEN
                FROM REGISTRO_BASCULA
                WHERE ID = ?
            """
            return self.buscar_todos(query, (id,))

    def registrar_bascula(self, datos: dict) -> dict:
        query = """
            INSERT INTO REGISTRO_BASCULA (PESO, FECHA_HORA, COD_PROVEEDOR, PROVEEDOR, LOTE, PRODUCTO, FECHA_VEN)
            VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)
        """
        params = (
            datos.get("peso"), datos.get("cod_proveedor"), datos.get("proveedor"),
            datos.get("lote"), datos.get("producto"), datos.get("fecha_ven")
        )
        return self.ejecutar_query(query, params)
    
    def actualizar_bascula(self, id: int, datos: dict) -> dict:
        query = """
            UPDATE REGISTRO_BASCULA
            SET PESO = ?, COD_PROVEEDOR = ?, PROVEEDOR = ?, LOTE = ?, PRODUCTO = ?, FECHA_VEN = ?
            WHERE ID = ?
        """
        params = (
            datos.get("peso"), datos.get("cod_proveedor"), datos.get("lote"),
            datos.get("proveedor"), datos.get("producto"), datos.get("fecha_ven"), id
        )
        return self.ejecutar_query(query, params)
  
    def eliminar_registro_bas(self, id):
        try:
            query = f"DELETE FROM REGISTRO_BASCULA WHERE ID = {id}"
            print(f"🛠 Ejecutando SQL: {query}")
            resultado = self.ejecutar_query(query)
            print(f"✅ Eliminado ID {id} de REGISTRO_BASCULA, resultado:", resultado)
            return {"estado": True}
        except Exception as e:
            print(f"❌ Error eliminando ID {id} de REGISTRO_BASCULA:", str(e))
            return {"estado": False, "error": str(e)}

    #################################// DISPOSTIVOS \\###################################################

    def obtener_dispositivo(self, id: int = None) -> dict:
            if id is None:
                query = """
                    SELECT ID, DATOS, FECHA_HORA, COD_PROVEEDOR, PROVEEDOR, LOTE, PRODUCTO, FECHA_VEN
                    FROM REGISTRO_DISPOSITIVO
                """
                return self.buscar_todos(query, ())
            
            query = """
                SELECT ID, DATOS, FECHA_HORA, COD_PROVEEDOR, PROVEEDOR, LOTE, PRODUCTO, FECHA_VEN
                FROM REGISTRO_DISPOSITIVO
                WHERE ID = ?
            """
            return self.buscar_todos(query, (id,))

    def registrar_dispositivo(self, datos: dict) -> dict:
        query = """
            INSERT INTO REGISTRO_DISPOSITIVO (DATOS, FECHA_HORA, COD_PROVEEDOR, PROVEEDOR, LOTE, PRODUCTO, FECHA_VEN)
            VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)
        """
        params = (
            datos.get("datos"), datos.get("cod_proveedor"), datos.get("proveedor"),
            datos.get("lote"), datos.get("producto"), datos.get("fecha_ven")
        )
        return self.ejecutar_query(query, params)

    def actualizar_dispositivo(self, id: int, datos: dict) -> dict:
        query = """
            UPDATE REGISTRO_DISPOSITIVO
            SET DATOS = ?, COD_PROVEEDOR = ?, PROVEEDOR = ?, LOTE = ?, PRODUCTO = ?, FECHA_VEN = ?
            WHERE ID = ?
        """
        params = (
            datos.get("datos"), datos.get("cod_proveedor"), datos.get("lote"), 
            datos.get("proveedor"), datos.get("producto"), datos.get("fecha_ven"), id
        )
        return self.ejecutar_query(query, params)

    def eliminar_registro_dis(self, id):
        try:
            query = f"DELETE FROM REGISTRO_DISPOSITIVO WHERE ID = {id}"
            resultado = self.ejecutar_query(query)
            print(f"✅ Eliminado ID {id} de REGISTRO_DISPOSITIVO, resultado:", resultado)
            return {"estado": True}
        except Exception as e:
            print(f"❌ Error eliminando ID {id} de REGISTRO_DISPOSITIVO:", str(e))
            return {"estado": False, "error": str(e)}

#######################

    def buscar(self, query="", fecha="") -> dict:
        sql_bascula = """
            SELECT ID, PESO AS DATO, FECHA_HORA FROM REGISTRO_BASCULA WHERE 1=1
        """
        sql_dispositivo = """
            SELECT ID, DATOS AS DATO, FECHA_HORA FROM REGISTRO_DISPOSITIVO WHERE 1=1
        """
        params = []

        if query:
            sql_bascula += " AND CAST(PESO AS VARCHAR(10)) LIKE ?"
            sql_dispositivo += " AND CAST(DATOS AS VARCHAR(100)) LIKE ?"
            params.append(f"%{query}%") 

        if fecha:
            sql_bascula += " AND FECHA_HORA LIKE ?"
            sql_dispositivo += " AND FECHA LIKE ?"
            params.append(f"%{fecha}%")
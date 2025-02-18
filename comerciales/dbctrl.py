from core.ctrl_firebird import fb_sql

class sql_comerciales(fb_sql):

    # Insersion de nuevos pedidos
    def registrar(self,datos:dict,iniciales:str)->dict:
        insert=[(int(data['cliente_id']),
                int(data['id_pro']),
                int(data['cantidad']),
                0,
                data['fecha'],
                data['observacion'],
                data['orden_compra'],
                iniciales,
                iniciales) for data in datos]
        query='''
        INSERT INTO pedidos (PED_CODTER, PED_CODPRO, PED_CANTID,\
        PED_DESPACHO, PED_FECHA, PED_OBSERVA, PED_ORCOMPRA, PED_INI_CL, PED_VENDE)\
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)
        '''
        return self.ejecutar_querys(query=query,params=insert)

    # edita un pedido existente
    def actualizar_pedido(self,datos)->dict:
        query=f'''
        UPDATE pedidos
        SET PED_CODPRO=?, PED_CANTID=?, PED_FECHA=?, PED_OBSERVA=?, PED_ORCOMPRA=?
        WHERE PED_CONSEC=?;
        '''
        update=(int(datos[0]),
                int(datos[1]),
                datos[2],
                datos[3],
                datos[4],
                datos[5])
        return self.ejecutar_query(query=query,params=update)

    #Atributos:  iniciales=inicuales comercial
    def consulta_pedidos(self,iniciales:str)->dict:
        query='''
        SELECT
            p.PED_CONSEC,p.PED_CODTER,t.NOMCTER,t.NOM_COMER,p.PED_CODPRO,i.NOMPRO,p.PED_CANTID,
            p.PED_DESPACHO,p.PED_FECHA,P.PED_ORCOMPRA,p.PED_OBSERVA
        FROM PEDIDOS p
            LEFT JOIN TERCEROS t ON p.PED_CODTER = t.CODTER
            LEFT JOIN INVENTARIO i ON p.PED_CODPRO = i.CODPRO
        WHERE p.PED_VENDE = ?
        ORDER BY p.PED_CONSEC DESC;
        '''
        select=(iniciales,)
        resp=self.buscar_todos(query=query,params=select)
        if resp['estado']:
            pedidos=[{
                    "id":row[0],
                    "tercero":row[2] if row[3]=="" or row[3].startswith(" ") else row[3],
                    "producto":f'{row[4]}-{row[5]}',
                    "cantidad":row[6],
                    "despacho":row[7],
                    "fecha":row[8],
                    "ord_compra":row[9],
                    "obs":row[10]
                    } for row in resp['data']
                ]
            resp["data"]=pedidos
        return resp

    #Atributos: consecutivo=id pedido
    def consulta_pedido(self,consecuivo:int)->dict:
        query='''
        SELECT
            p.PED_CONSEC,p.PED_CODTER,t.NOMCTER,t.NOM_COMER,p.PED_CODPRO,i.NOMPRO,p.PED_CANTID,
            p.PED_DESPACHO,p.PED_FECHA,P.PED_ORCOMPRA,p.PED_OBSERVA
        FROM PEDIDOS p
            LEFT JOIN TERCEROS t ON p.PED_CODTER = t.CODTER
            LEFT JOIN INVENTARIO i ON p.PED_CODPRO = i.CODPRO
        WHERE p.PED_CONSEC = ?;
        '''
        select=(consecuivo,)
        resp=self.buscar_uno(query=query,params=select)
        if ['estado']:
            pedido={
                "id":resp['data'][0],
                "tercero":f'{resp["data"][1]}: {resp["data"][2]}' if resp['data'][3]=='' or resp['data'][3].startswith(" ") else f'{resp["data"][1]}: {resp["data"][3]}',
                "producto":f'{resp["data"][4]}-{resp["data"][5]}',
                "cantidad":resp['data'][6],
                "despacho":resp['data'][7],
                "fecha":resp['data'][8],
                "ord_compra":resp['data'][9],
                "obs":resp['data'][10]
            }
            resp['data']=pedido
        return resp

    #Elimina un pedido segun su consecutivo
    def eliminar_pedido(self,consec:str)->dict:
        query="DELETE FROM PEDIDOS WHERE PED_CONSEC=?"
        delete=(consec,)
        return self.ejecutar_query(query=query,params=delete)

    #Devuelve codigo, nit, nombre comercial y nombre de la sucursal de los terceros registrados
    def lista_terceros(self)->dict:
        query="SELECT CODTER, NITTER, NOMCTER, NOM_COMER FROM TERCEROS WHERE TIPTER<>5 ORDER BY NOMCTER;"
        result=self.buscar_todos(query)
        if result['estado']:
            terceros={}
            for x in result['data']:
                if x[3]=='' or x[3].startswith(" "):
                    terceros[f'{x[0]}']=f'{x[0]}: {x[2]}'
                else:
                    terceros[f'{x[0]}']=f'{x[0]}: {x[3]}'
            result['data']=terceros
        else:
            result['data']=[("error",result['error'])]
        return result

    #Devuelve codigo y nombre de los productos en inventario
    def lista_productos(self)->dict:
        query="SELECT CODPRO, NOMPRO FROM INVENTARIO WHERE CATEGORIA!='Z' AND GRUPO=2"
        result=self.buscar_todos(query)
        if result['estado']:
            productos={}
            for x in result['data']:
                productos[f'{x[0]}']=f'{x[0]}-{x[1]}'
            result['data']=productos
        else: result['data']=[("error",result['error'])]
        return result

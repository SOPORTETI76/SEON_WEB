from core.ctrl_firebird import fb_sql


class sql_usuarios(fb_sql):

    # Buscar usuario
    def buscar_usuario(self,usuario='')->dict:
        query="SELECT USUARIO,CLAVE,INI_CL,NOM_CL FROM CLAVES WHERE USUARIO=?;"
        consulta=self.buscar_uno(query=query,params=(usuario,))
        if consulta['estado'] and consulta['data'] is not None:
            consulta['data']={"usuario":consulta['data'][0],
                              "clave":consulta['data'][1].replace(" ",""),
                              "inic":consulta['data'][2],
                              "nombre":consulta['data'][3]}
        return consulta




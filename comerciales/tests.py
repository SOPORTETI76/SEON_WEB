from django.test import TestCase
from dbctrl import sql_comerciales

consulta=sql_comerciales()

resp=consulta.lista_terceros()
for x in resp['data']:
    print(resp['data'][x])
from django.test import TestCase
from dbctrl import sql_comerciales

resp=sql_comerciales().precio_producto(48,190)
if resp['estado']:
    print(resp['data'])
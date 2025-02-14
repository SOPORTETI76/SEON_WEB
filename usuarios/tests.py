from django.test import TestCase
from dbctrl import sql_usuarios
# Create your tests here.

print(sql_usuarios().buscar_usuario("AUX4"))

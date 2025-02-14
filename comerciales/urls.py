from . import views
from django.urls import path

urlpatterns = [
    path('mis_pedidos/', views.mis_pedidos,name='mis_pedidos'),
    path('todos_pedidos/',views.todos_pedidos,name='todos_pedidos'),
    path('eliminar_pedido/',views.eliminar_pedido,name="eliminar_pedido"),
    path('buscar_pedido/<int:pedido_id>/',views.buscar_pedido,name='buscar_pedido'),
    path('registrar_pedidos/',views.registrar_pedidos,name='registrar_pedidos'),
    path('actualizar_pedido/',views.actualizar_pedidos,name="actualizar_pedidos")
]
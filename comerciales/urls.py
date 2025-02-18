from . import views
from django.urls import path

urlpatterns = [
    path('vista_pedidos/', views.vista_pedidos,name='vista_pedidos'),
    path('pedidos_comercial/',views.pedidos_comercial,name='pedidos_comercial'),
    path('eliminar_pedido/',views.eliminar_pedido,name="eliminar_pedido"),
    path('buscar_pedido/<int:pedido_id>/',views.buscar_pedido,name='buscar_pedido'),
    path('registrar_pedidos/',views.registrar_pedidos,name='registrar_pedidos'),
    path('actualizar_pedido/',views.actualizar_pedidos,name="actualizar_pedidos")
]
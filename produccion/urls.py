from django.urls import path
from . import views

urlpatterns = [
    path('bascula/', views.bascula_view, name='bascula_view'),
    path('registro_bascula/', views.registro_view, name='registro_view'),
    
    # Rutas para edición
    path("editar/<str:tipo>/<int:id>/", views.editar_registro, name="editar_registro"),
    

    # Eliminación de registros
    path('eliminar_bascula/<int:id>/', views.eliminar_bascula, name='eliminar_bascula'),
    path('eliminar_dispositivo/<int:id>/', views.eliminar_dispositivo, name='eliminar_dispositivo'),
    path('eliminar_registros/', views.eliminar_registros, name="eliminar_registros"),

    # Impresión de registros
     path('imprimir/<str:tipo>/<int:id>/', views.imprimir_registro, name='imprimir_registro')
]

from . import views
from django.urls import path

urlpatterns = [
    path("",views.login,name="index"),
    path("logout/",views.logout,name="logout"),
    path("menu/",views.menu,name="menu")
]
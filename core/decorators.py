from django.shortcuts import redirect

#Decorador para validar que los usuarios esten logeados para acceder a una vista en concreto
def validar_login(vista_func):
    def wrapper(request,*args,**kwargs):
        if "usuario" not in request.session:
            return redirect("index")
        return vista_func(request,*args,**kwargs)
    return wrapper

#Decorador para validar que los usuarios que esten logeados no pueda acceder al login
def restringir_login(vista_func):
    def wrapper(request,*args,**kwargs):
        if "usuario" in request.session:
            return redirect("mis_pedidos")
        return vista_func(request,*args,**kwargs)
    return wrapper
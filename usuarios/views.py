from django.shortcuts import render,redirect
from .forms import form_login
from .dbctrl import sql_usuarios
from core.decorators import restringir_login,validar_login

@restringir_login
def login(request):
    front={"form":form_login}
    if request.method=="POST":
        form=form_login(request.POST)
        if form.is_valid():
            usuario=form.cleaned_data['usuario']
            clave=form.cleaned_data['clave']
            r_db=sql_usuarios().buscar_usuario(usuario)
            if r_db['estado']:
                if r_db['data']['clave']==clave:
                    request.session['usuario']=usuario
                    request.session['inic']=r_db['data']['inic']
                    request.session['nombre']=r_db['data']['nombre']
                    return redirect("mis_pedidos")
            front['errordb']="Usuario o contraseña incorrectos"
        else: front['form']=form
    return render(request,"index.html",front)

def logout(request):
    request.session.flush()
    return redirect('index')

def menu(request):
    opciones=["clientes","Pedidos","usuarios"]
    return render(request,"herramientas.html",{"opciones":opciones})
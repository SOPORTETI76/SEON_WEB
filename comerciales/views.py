import json
from django.http import JsonResponse    
from django.shortcuts import render,redirect
from .forms import pedidos_form
from .dbctrl import sql_comerciales
from core.decorators import validar_login
from datetime import date

@validar_login
def vista_pedidos(request):
    with sql_comerciales() as db:
        li_terceros=json.dumps(db.lista_terceros()['data'])
        li_productos=json.dumps(db.lista_productos()['data'])
    front={'form':pedidos_form,
           'error':'',
           'estado':False,
           "usuario":f"{request.session["nombre"]}  :  {request.session["inic"]}",
           "li_terceros":li_terceros,
           "li_productos":li_productos
            }
    return render(request,'pedido.html',front)

@validar_login
def actualizar_pedidos(request):
    if request.method=="POST":
        data=json.loads(request.body)
        pedido=data.get("pedido",[])
        if not pedido:
            return JsonResponse({"estado":False,"mensaje":"No llegaron datos al servidor"})
        
        with sql_comerciales() as db:
            resp=db.actualizar_pedido(pedido)
        return JsonResponse({"estado":resp["estado"],"mensaje":resp['error']})
    return redirect("mis_pedidos")

@validar_login
def registrar_pedidos(request):
    if request.method=="POST":
        data=json.loads(request.body)
        pedidos=data.get("pedidos",[])
        if not pedidos:
            return JsonResponse({"estado":False,"mensaje":"No llegaron pedidos al servidor"})
        with sql_comerciales() as db:
            resp=db.registrar(pedidos,request.session["inic"])
        return JsonResponse({"estado":resp["estado"],"mensaje":resp['error']})
    return redirect("mis_pedidos")

@validar_login
def pedidos_comercial(request):
    iniciales=request.session.get("inic")
    if not iniciales:
        return JsonResponse({"error":"usuario no encontrado"})
    with sql_comerciales() as db:
        resp=db.consulta_pedidos(iniciales)
    if resp['estado']:
        return JsonResponse(resp['data'],safe=False)
    return JsonResponse({"error":resp['error']})

@validar_login
def buscar_pedido(request,pedido_id):
    if pedido_id:
        with sql_comerciales() as db:
            resp=db.consulta_pedido(pedido_id)
            if resp['estado']:
                return JsonResponse(resp['data'],status=200)
            return JsonResponse({'error':resp['error']},status=500)
    return JsonResponse({'error':'No se proporciono un id'},status=400)

@validar_login
def eliminar_pedido(request):
    if request.method=="POST":
        try:
            data=json.loads(request.body)
            pedido_id=data.get("id")
            if not pedido_id:
                return JsonResponse({"mensaje":"No se encontro un id de pedido","estado":False},status=400)
            with sql_comerciales() as db:
                resp=db.eliminar_pedido(pedido_id)
            if resp['estado']:
                return JsonResponse({"mensaje":"Pedido eliminado correctamente","estado":resp['estado']},status=200)
            else:
                return JsonResponse({"mensaje":resp['error'],"estado":resp['estado']},status=500)
        except Exception as e:
            return JsonResponse({"mensaje":str(e),"estado":False},status=500)
    return render(request,"")

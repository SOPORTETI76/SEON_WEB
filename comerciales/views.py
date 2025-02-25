import json
from django.http import JsonResponse    
from django.shortcuts import render,redirect
from .forms import pedidos_form
from .dbctrl import sql_comerciales
from core.decorators import validar_login

#Renderiza la vista principal de los pedidos
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

#Actualiza la informacion de un pedido y recibe la informacion por javascript
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

#Recibe la lista de pedidos del front y los registra en la base de datos
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

#Busca los pedidos asociados a un solo comercial y los devuelve en formato JSON
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

#Busca un pedido en especifico segun el ID y devuelve la informacion en formato JSON
@validar_login
def buscar_pedido(request,pedido_id):
    if pedido_id:
        with sql_comerciales() as db:
            resp=db.consulta_pedido(pedido_id)
            if resp['estado']:
                return JsonResponse(resp['data'],status=200)
            return JsonResponse({'error':resp['error']},status=500)
    return JsonResponse({'error':'No se proporciono un id'},status=400)

#Elimina un pedido segun su ID y responde en formato JSON
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

@validar_login
def precio_producto(request):
    front={"estado":False,"error":"GET"}
    if request.method=="POST":
        data=json.loads(request.body)
        lista_base=data.get("lista_base")
        id_producto=data.get("producto")
        with sql_comerciales() as db:
            resp=db.precio_producto(lista_base,id_producto)
        if resp["estado"]:
            front["estado"]=resp["estado"]
            front["precio"]=resp["data"][0]
            front["error"]=""
            return JsonResponse(front,status=200)
        front["error"]=resp["error"]
    return JsonResponse(front,status=400)
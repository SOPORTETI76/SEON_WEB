import json
import re

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from .dbctrl import sql_bascula
from .utils import verificar_conexion, leer_dispositivo, enviar_impresora

def bascula_view(request):
    db = sql_bascula()
    
    estado_conexion = None
    clase_estado = None
    mensaje = None
    clase_mensaje = None
    datos_recibidos = None

    # Verificar si la báscula está conectada
    if verificar_conexion():
        estado_conexion = "Dispositivo detectado y listo para usarse."
        clase_estado = "mensaje-exito"
    else:
        estado_conexion = "No se detectó ningún dispositivo conectado."
        clase_estado = "mensaje-error"

    # Manejo del botón "Leer datos"
    if request.method == "POST" and "leer" in request.POST:
        if verificar_conexion():
            resultado = leer_dispositivo()
            if not isinstance(resultado, dict):
                resultado = {"tipo": "error", "datos": "Error desconocido"}
            
            datos_recibidos = resultado.get("datos", "No disponible")
            tipo_dispositivo = resultado.get("tipo", "")

            if tipo_dispositivo == "bascula":
                mensaje = f"Báscula detectada. Datos: {datos_recibidos} kg."
                clase_mensaje = "mensaje-exito"
            elif tipo_dispositivo == "otro":
                mensaje = "Dispositivo NO BÁSCULA detectado."
                clase_mensaje = "mensaje-advertencia"
            elif tipo_dispositivo == "error":
                mensaje = f"Error al leer datos: {datos_recibidos}"
                clase_mensaje = "mensaje-error"
            else:
                mensaje = "Error desconocido al leer dispositivo."
                clase_mensaje = "mensaje-error"
        else:
            mensaje = "No se puede leer la báscula porque no hay conexión."
            clase_mensaje = "mensaje-error"

    # Manejo del botón "Guardar"
    elif request.method == "POST" and "guardar" in request.POST:
        tipo_dispositivo = request.POST.get("tipo_dispositivo")
        datos_guardar = request.POST.get("datos_guardar")

        if tipo_dispositivo == "bascula":
            match = re.search(r'[\d.]+', datos_guardar)
            if match:
                peso = float(match.group())
                resultado = db.registrar_bascula({"peso": peso})
                if resultado["estado"]:
                    mensaje = f"Datos guardados correctamente: {peso} kg. ✅"
                    clase_mensaje = "mensaje-exito"
                else:
                    mensaje = f"Error al guardar: {resultado['error']} ❌"
                    clase_mensaje = "mensaje-error"
            else:
                mensaje = "No se pudieron extraer datos válidos para la báscula. ❌"
                clase_mensaje = "mensaje-error"

        elif tipo_dispositivo == "otro":
            resultado = db.registrar_dispositivo({"datos": datos_guardar})
            if resultado["estado"]:
                mensaje = f"Datos guardados correctamente: {datos_guardar}. ✅"
                clase_mensaje = "mensaje-exito"
            else:
                mensaje = f"Error al guardar: {resultado['error']} ❌"
                clase_mensaje = "mensaje-error"

    registrar_bascula = db.obtener_bascula()
    registrar_dispositivo = db.obtener_dispositivo()

    registros_bascula = [
        {"id": reg[0], "peso": reg[1], "fecha": reg[2]}
        for reg in registrar_bascula["data"]
    ] if registrar_bascula["estado"] else []

    registros_dispositivo = [
        {"id": reg[0], "datos": reg[1], "fecha": reg[2]}
        for reg in registrar_dispositivo["data"]
    ] if registrar_dispositivo["estado"] else []

    return render(request, 'bascula.html', {
        "mensaje": mensaje,
        "estado_conexion": estado_conexion,
        "clase_estado": clase_estado,
        "clase_mensaje": clase_mensaje,
        "datos": datos_recibidos,
        "registros_bascula": registros_bascula,
        "registros_dispositivo": registros_dispositivo,
    })



# FUNCIÓN PARA EDITAR ####################################################################################

@csrf_exempt
def editar_registro(request, tipo, id):
    db = sql_bascula()

    if tipo == "bascula":
        registro_actual = db.obtener_bascula(id)
    elif tipo == "dispositivo":
        registro_actual = db.obtener_dispositivo(id)
    else:
        return JsonResponse({"success": False, "mensaje": "Tipo de registro no válido"}, status=400)

    if not registro_actual or not registro_actual.get("estado"):
        return JsonResponse({"success": False, "mensaje": "Registro no encontrado."}, status=404)

    if request.method == "POST":
        try:
            # Verificar si los datos llegan como JSON
            try:
                datos = json.loads(request.body.decode("utf-8"))
            except json.JSONDecodeError:
                return JsonResponse({"success": False, "mensaje": "Error: No se recibió un JSON válido."}, status=400)

            datos_actualizados = {
                "peso" if tipo == "bascula" else "datos": datos.get("peso" if tipo == "bascula" else "datos", "").strip(),
                "fecha_ven": datos.get("fecha_vencimiento", "").strip(),
                "cod_proveedor": datos.get("codigo_proveedor", "").strip(),
                "proveedor": datos.get("proveedor", "").strip(),
                "lote": datos.get("lote", "").strip(),
                "producto": datos.get("producto", "").strip(),
            }

            resultado = db.actualizar_bascula(id, datos_actualizados) if tipo == "bascula" else db.actualizar_dispositivo(id, datos_actualizados)
            return JsonResponse({"success": resultado.get("estado", False), "mensaje": resultado.get("mensaje", "Actualizado")})

        except Exception as e:
            return JsonResponse({"success": False, "mensaje": f"Error interno: {str(e)}"}, status=500)

    return JsonResponse(registro_actual)




# FUNCIONES PARA ELIMINAR #########################################################


def eliminar_bascula(request, id):
    if request.method != "POST":
        messages.error(request, "Método no permitido para eliminar registro ❌")
        return redirect("bascula_view")

    db = sql_bascula()
    
    try:
        resultado = db.eliminar_registro_bas(int(id))
        if resultado and resultado["estado"]:
            messages.success(request, "Registro de báscula eliminado correctamente ✅")
        else:
            messages.error(request, f"Error al eliminar: {resultado.get('error', 'Error desconocido')} ❌")
    except Exception as e:
        messages.error(request, f"Excepción al eliminar registro: {str(e)} ❌")

    return redirect("bascula_view")

#####

def eliminar_dispositivo(request, id):
    if request.method != "POST":
        messages.error(request, "Método no permitido para eliminar registro ❌")
        return redirect("bascula_view")

    db = sql_bascula()
    
    try:
        resultado = db.eliminar_registro_dis(int(id))
        if resultado and resultado["estado"]:
            messages.success(request, "Registro de dispositivo eliminado correctamente ✅")
        else:
            messages.error(request, f"Error al eliminar: {resultado.get('error', 'Error desconocido')} ❌")
    except Exception as e:
        messages.error(request, f"Excepción al eliminar registro: {str(e)} ❌")

    return redirect("bascula_view")

# ELIMINAR VARIOS REGISTROS #########
@csrf_exempt
def eliminar_registros(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "mensaje": "Método No Permitido."})

    try:
        data = json.loads(request.body)
        print("Datos recibidos en Django:", data)  

        registros_bascula = data.get("registros_bascula", [])
        registros_dispositivo = data.get("registros_dispositivo", [])

        if not registros_bascula and not registros_dispositivo:
            return JsonResponse({"success": False, "mensaje": "No se enviaron registros para eliminar."})

        db = sql_bascula()
        errores = []

        for id_bascula in registros_bascula:
            print(f"🛠 Eliminando Báscula ID: {id_bascula}")
            resultado = db.eliminar_registro_bas(int(id_bascula))
            if not resultado["estado"]:
                errores.append(f"Error al eliminar Báscula: {id_bascula}")

        for id_dispositivo in registros_dispositivo:
            print(f"🛠 Eliminando Dispositivo ID: {id_dispositivo}")
            resultado = db.eliminar_registro_dis(int(id_dispositivo))
            if not resultado["estado"]:
                errores.append(f"Error al eliminar Dispositivo: {id_dispositivo}")

        if errores:
            print("⚠️ Errores en eliminación:", errores)
            return JsonResponse({"success": False, "mensaje": "Algunos registros no pudieron eliminarse. 😖"})

        print("✅ Eliminación completada con éxito.")
        return JsonResponse({"success": True, "mensaje": "Registros eliminados correctamente. 🤟"})

    except Exception as e:
        print("❌ Error en la eliminación:", str(e))
        return JsonResponse({"success": False, "mensaje": f"Error: {str(e)}"})





# VISTA DE REGISTROS ####################################################################################

def registro_view(request):
    query = request.GET.get('q', '').strip()
    filtro_fecha = request.GET.get('fecha', '').strip()
    db = sql_bascula()

    registrar_bascula = db.obtener_bascula()
    registrar_dispositivo = db.obtener_dispositivo()

    print("Registros de Báscula:", registrar_bascula)
    print("Registros de Dispositivo:", registrar_dispositivo)

    registros_bascula = [
        {"id": reg[0], "peso": reg[1], "fecha": reg[2]}
        for reg in registrar_bascula["data"]
    ] if registrar_bascula["estado"] else []

    registros_dispositivo = [
        {"id": reg[0], "datos": reg[1], "fecha": reg[2]}
        for reg in registrar_dispositivo["data"]
    ] if registrar_dispositivo["estado"] else []

    if query:
        registros_bascula = [r for r in registros_bascula if query in str(r["peso"])]
        registros_dispositivo = [r for r in registros_dispositivo if query in str(r["datos"])]

    if filtro_fecha:
        registros_bascula = [r for r in registros_bascula if filtro_fecha in str(r["fecha"])]
        registros_dispositivo = [r for r in registros_dispositivo if filtro_fecha in str(r["fecha"])]

    return render(request, 'registros_bascula.html', {
        'registros_bascula': registros_bascula,
        'registros_dispositivo': registros_dispositivo,
        'query': query,
        'filtro_fecha': filtro_fecha,
    })


# FUNCIÓN PARA IMPRIMIR #####################################################################################

def imprimir_registro(request, tipo, id):
    if request.method != "POST":
        return JsonResponse({"success": False, "mensaje": "Método no permitido."})

    try:
        print(f"🔍 ID recibido: {id}")
        print(f"📥 Body recibido: {request.body}")

        datos = json.loads(request.body)

        # Enviar a la impresora
        respuesta = enviar_impresora(
            peso=datos.get("peso", "N/A"),
            fecha_hora=datos.get("fecha_hora", "Sin Fecha"),
            cod_proveedor=datos.get("cod_proveedor", "N/A"),
            proveedor=datos.get("proveedor", "Desconocido"),
            producto=datos.get("producto", "No especificado"),
            lote=datos.get("lote", "Sin lote"),
            fecha_ven=datos.get("fecha_ven", "No definida")
        )

        print(f"🖨️ Respuesta de la impresora: {respuesta}")

        return JsonResponse(respuesta)  
    
    except Exception as e:
        print(f"⚠️ Error inesperado en la vista: {e}")
        return JsonResponse({"success": False, "mensaje": f"Error inesperado: {str(e)}"})


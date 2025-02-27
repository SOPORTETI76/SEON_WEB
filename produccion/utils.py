import serial
import re
import time

def verificar_conexion(puerto='/dev/ttyUSB0', baudrate=9600, timeout=1):
    try:
        ser = serial.Serial(port='/dev/ttyUSB0', baudrate=9600, timeout=1)
        print("✅ Conexión establecida con la báscula.")
        ser.close()
        with serial.Serial(
            port=puerto,
            baudrate=baudrate, 
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            bytesize=serial.EIGHTBITS,
            timeout=timeout
        ) as ser:
            return True
    except serial.SerialException as e:
        print(f"ERROR: No se detecto conexión con la báscula: {e}")
        print(f"❌ No se pudo conectar: {e}")
        return False
    except Exception as e:
        print("DEBUG: Error al verificar conexión: {e}")
        return False
    
def leer_dispositivo(puerto='/dev/ttyUSB0', baudrate=9600, timeout=1):
    try:
        with serial.Serial(
            port=puerto,
            baudrate=baudrate,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            bytesize=serial.EIGHTBITS,
            timeout=timeout
        ) as ser:
            datos = ser.readline().decode('utf-8').strip()
            print(f"DEBUG: Datos Recibidos: {datos}")

            match = re.match(r'^\d+(\.\d+)?$', datos)
            if match:
                return {"tipo": "bascula", "datos": float(datos)}
            else:
                return {"tipo": "otro", "datos": datos}
            
    except serial.SerialException as e:
        print(f"ERROR: No se puede abrir el puerto: {e}")
        return {"tipo": "error", "datos": f"Error de conexión: {e}"}

def enviar_impresora(peso, fecha_hora, lote, producto, cod_proveedor, proveedor, fecha_ven, puerto='/dev/ttyUSB0'):
    try:
        peso = f"{peso:.2f} KG" if isinstance(peso, (int, float)) else 'N/A'
        datos = (
            f"PESO: {peso}\r\n"
            f"FECHA: {fecha_hora}\r\n"
            f"CÓDIGO PROVEEDOR: {cod_proveedor}\r\n"
            f"PROVEEDOR: {proveedor}\r\n"
            f"PRODUCTO: {producto}\r\n"
            f"LOTE: {lote}\r\n"
            f"FECHA DE VENCIMIENTO: {fecha_ven}\r\n"
        )

        with serial.Serial(puerto, 9600, timeout=2) as ser:
            ser.flushOutput()
            time.sleep(0.5)

            ser.write(datos.encode("utf-8") + b'\r\n')
            ser.flush()
            time.sleep(1)

            respuesta = ser.read(100).decode("utf-8", errors="ignore").strip()
            print(f"🔍 Respuesta antes de imprimir: {respuesta}")

            comandos = [b'PRINT\r\n', b'SEND\r\n', b'\x1bP\r\n', b'\x1bPRINT\r\n', b'ST,PRINT\r\n']

            for comando in comandos:
                print(f"💡 Enviando comando de impresión: {comando}")
                ser.write(comando)
                ser.flush()
                time.sleep(2)

                confirmacion = ser.read(100).decode("ascii", errors="ignore").strip()
                print(f"🖨️ Respuesta de impresión: {confirmacion}")

                if "PRINT" in confirmacion or "OK" in confirmacion:
                    return {"success": True, "mensaje": "Impresión confirmada", "respuesta": confirmacion}

            return {"success": False, "mensaje": "No se pudo confirmar la impresión", "respuesta": confirmacion}

    except serial.SerialException as e:
        return {"success": False, "error": f"Error de conexión con la impresora: {str(e)}"}

    except Exception as e:
        return {"success": False, "error": f"Error inesperado: {str(e)}"}




const form_pedidos=document.getElementById("form-pedidos")
const desplgebale_terceros = document.getElementById("tercero-list")
const desplegable_productos = document.getElementById("producto-list")
let id_pedido=document.getElementById("id_pedido")
let btn_mis_pedidos=document.getElementById("btnMisPedidos")
let fecha=form_pedidos.querySelector(".datepicker")
let tercero=form_pedidos.querySelector("#id_terceros")
let producto=form_pedidos.querySelector("#id_productos")
let cantidad=form_pedidos.querySelector("#id_cantidad")
let btn_productos=form_pedidos.querySelector("#btn-productos")
let head_prod_ter_sel=form_pedidos.querySelector("#prod-ter-sel")
let productos_seleccionados=form_pedidos.querySelector("#productos-selecionados")
let head_ped_ter_reg=form_pedidos.querySelector("#ped-ter-reg")
let pedidos_terceros=form_pedidos.querySelector("#pedidos-hechos")
let orden_compra=form_pedidos.querySelector("#id_orden_compra")
let observacion=form_pedidos.querySelector("#id_observacion")
let btn_registrar=form_pedidos.querySelector("#btn-reg")
let btn_cerrar_sesion=form_pedidos.querySelector("#logout")
let btn_actualizar=form_pedidos.querySelector("#btn-act")
let btn_cancelar=form_pedidos.querySelector("#btn-canc")
const ventana_modal=document.getElementById("modalPedidos")
let tabla_pedidos = document.getElementById("tablaPedidos")
let cuerpo_tabla=document.getElementById("tbody-pedidos")
let cabecera_tabla=document.getElementById("thead-pedidos")
let input_busqueda_pedidos=document.getElementById("buscar-pedido")
let btn_cerrar_modal=document.getElementById("cerrarModal")
let data_terceros
let data_productos
let pedidos_comercial=[]

//--------------------------- CARGAS INICIALES
/*Esta funcion transforma los datos enviados por el backend
de los terceros y productos para transformarlos en listas
y agrega la escucha de eventos para cerrar los desplehables cuando se hace
click fuera de ellos*/
function listas_productos_terceros(){
    try{
        data_terceros=JSON.parse(document.getElementById("terceros-data").textContent)
        data_productos=JSON.parse(document.getElementById("productos-data").textContent)
        desplgebale_terceros.innerHTML=""
        desplegable_productos.innerHTML=""
        tercero.addEventListener("focus",mostrar_terceros)
        tercero.addEventListener("input",mostrar_terceros)
        producto.addEventListener("focus",mostrar_productos)
        producto.addEventListener("input",mostrar_productos)
        document.addEventListener("click",function(e){
            if(!tercero.contains(e.target) && !desplgebale_terceros.contains(e.target)){
                desplgebale_terceros.style.display="none"
            }
            if(!producto.contains(e.target) && !desplegable_productos.contains(e.target)){
                desplegable_productos.style.display="none"
            }
        })
    }catch(error){
        console.error("Error al parsear o generar la lista de terceros:", error)
    }
}

//Esta funcion trae del backend la lista de pedidos segun el usuario logeado
function cargar_pedidos(){
    fetch("/pedidos_comercial/").then(response=>response.json()).then(
        data=>{pedidos_comercial=data}
    ).catch(error=>Swal.fire({title:"Error",text:`Ocurrio un error al buscar los pedidos: ${error}`,icon:"error",showConfirmButton:false,timer:1300}))
}

//Esta funcion configura el campo fecha que vamos a utilizar
function def_campo_fecha(){
    flatpickr(".datepicker", {
        dateFormat: "Y-m-d", // Formato compatible con Django
        altFormat: "Y-m-d",
        altInput: true, // Muestra un formato legible
        locale: "es", // Traducción al español
        allowInput: false, // Permite escribir manualmente la fecha
        enableTime:false,
        disableMobile: true, // Habilitar en dispositivos moviles
        minDate:"today"
    });
}

//---------------------------------------- ESTADO DE LOS COMPONENTES DEL FORMULARIO
//Esta funcion limpia los campos del formulario cada que se llama
function estado_defecto(){
    id_pedido.value=""
    fecha._flatpickr.setDate("", true);
    tercero.value=""
    producto.value=""
    cantidad.value=""
    productos_seleccionados.innerHTML=""
    pedidos_terceros.innerHTML=""
    orden_compra.value=""
    observacion.value=""
    acceso_formulario()
}

//Esta funcion valida si se está editando un producto para bloqquear algunas funciones del formulario
function acceso_formulario(){
    if(id_pedido.value!==""){
        btn_mis_pedidos.disabled=true
        btn_mis_pedidos.style="background-color:gray;"
        tercero.setAttribute("readonly","readonly")
        tercero.style="outline: 1px solid red; color: red;"
        btn_productos.disabled=true
        btn_productos.style="background-color:gray;"
        btn_registrar.style.display="none"
        btn_actualizar.style.display="block"
        btn_cerrar_sesion.style.display="none"
        btn_cancelar.style.display="block"
    }else{
        btn_mis_pedidos.disabled=false
        btn_mis_pedidos.style.display=""
        tercero.removeAttribute("readonly")
        tercero.style=""
        btn_productos.disabled=false
        btn_productos.removeAttribute("style")
        btn_registrar.removeAttribute("style")
        btn_actualizar.style="display:none;"
        btn_cerrar_sesion.style=""
        btn_cancelar.style="display:none;"
    }
    campos_productos_pedidos()
}

/*Esta funcion valida si existen pedidos para el tercero seleccionado o si existen
productos seleccionados para mostrar u ocultar los campos*/
function campos_productos_pedidos(){
    if(productos_seleccionados.childElementCount>0){
        head_prod_ter_sel.style.display="block"
        productos_seleccionados.style.display="block"
    }else{
        head_prod_ter_sel.style.display="none"
        productos_seleccionados.style.display="none"
    }
    if(pedidos_terceros.childElementCount>0){
        head_ped_ter_reg.style.display="block"
        pedidos_terceros.style.display="block"
    }else{
        head_ped_ter_reg.style.display="none"
        pedidos_terceros.style.display="none"
    }
}

//------------------------------------------FUNCIONALIDAD PRINCIPAL

//Filtra los terceros segun se vallan digitando en el campo tercero
function mostrar_terceros(){
    const termino=tercero.value.toLowerCase()
    desplgebale_terceros.innerHTML=''
    if(termino==""){
        desplgebale_terceros.style.display="none"
        return
    }
    Object.entries(data_terceros).forEach(([Key,value])=>{
        if(value.toLowerCase().includes(termino)){
            const opcion=document.createElement("div")
            opcion.textContent=value
            opcion.dataset.value=Key
            opcion.addEventListener("click",function(){
                tercero.value=opcion.textContent
                pedidos_por_tercero(opcion.textContent)
                desplgebale_terceros.style.display="none"
            });
            desplgebale_terceros.appendChild(opcion)
        }
    })
    desplgebale_terceros.style.display=desplgebale_terceros.children.length ? "block":"none"

}

//Filtra los productos segun se vallan digitando en el campo producto
function mostrar_productos(){
    const termino=producto.value.toLowerCase()
    desplegable_productos.innerHTML=''
    if(termino===""){
        desplegable_productos.style.display="none"
        return
    }
    Object.entries(data_productos).forEach(([Key,value])=>{
        if(value.toLowerCase().includes(termino)){
            const opcion=document.createElement("div")
            opcion.textContent=value
            opcion.dataset.value=Key
            opcion.addEventListener("click",function(){
                producto.value=opcion.textContent
                desplegable_productos.style.display="none"
            })
            desplegable_productos.appendChild(opcion)
        }
    })
    desplegable_productos.style.display=desplegable_productos.children.length ? "block":"none"
}

//Filtra los pedidos ya registrados segun la fecha y tercero seleccionado
function pedidos_por_tercero(tercero){
    pedidos_terceros.innerHTML=""
    if(pedidos_comercial){
        pedidos_comercial.forEach(pedido=>{
            let fechaFlag=pedido.fecha.trim()===fecha.value.trim()
            let terceroFlag=pedido.tercero.trim()===tercero.split(":")[1].trim()
            if(fechaFlag && terceroFlag){
                let contenedor=document.createElement("div")
                contenedor.setAttribute("class","dat-pedidos")
                contenedor.innerHTML=`
                    <p class="temp-cant">${pedido.cantidad}</p>
                    <p class="temp-producto">${pedido.producto.split("-")[1]}</p>
                    <p class="consecutivo-pedido">${pedido.id}</p>
                `
                pedidos_terceros.appendChild(contenedor)
            }
        })
    }
    campos_productos_pedidos()
}

//Esta funcion agrega los productos a un contenedor y los muestra
function seleccionar_productos(){
    let prodVacio=producto.value.trim()===""
    let cantInvalida=cantidad.value<=0
    let prodNoExiste=!Object.values(data_productos).includes(producto.value)
    if( prodVacio || cantInvalida || prodNoExiste){
        producto.style="outline: 1px solid red;color:red;"
        cantidad.style="outline: 1px solid red;color:red;"
        Swal.fire({title:"Error",text:"recuerde rellenar los campos y digitar productos existentes",icon:"error",showConfirmButton:false,timer:1300})
        return
    }
    if (productos_seleccionados.querySelector(`#${CSS.escape(producto.value)}`) ? true:false){
        producto.value=""
        cantidad.value=""
        Swal.fire({title:"Aviso",text:"Este producto ya fue registrado",icon:"warning",showConfirmButton:false,timer:1300})
        return
    }
    producto.removeAttribute("style")
    cantidad.removeAttribute("style")
    let cont=document.createElement("div")
    let boton=document.createElement("button")
    let img=document.createElement("img")
    let iconUrl=productos_seleccionados.getAttribute("data-img-url")
    cont.setAttribute("class","dat-productos")
    cont.innerHTML=`
        <input min="1" max="999" class="input-cant-productos" type="number" style="grid-column-start:1;" value="${cantidad.value}">
        <p id="${producto.value}" class="nombre-producto" style="grid-column-start:2;margin:0;">${producto.value.split("-")[1]}</p>
    `
    boton.type="button"
    boton.title="eliminar producto"
    boton.setAttribute("class","btn-del-prod")
    img.src=iconUrl
    img.alt="Icono"
    boton.appendChild(img)
    cont.appendChild(boton)
    productos_seleccionados.prepend(cont)
    boton.addEventListener("click",function(){
        let nodoPadre=boton.parentNode
        productos_seleccionados.removeChild(nodoPadre)
        campos_productos_pedidos()
    })
    producto.value=""
    cantidad.value=""
    campos_productos_pedidos()
}

//Realiza el fetch de la url /registrar_pedidos/ para enviar los datos al backend
function registrar_pedidos(pedidos){
    fetch("/registrar_pedidos/",{
        method:"POST",
        headers:{
            'Content_Type':'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body:JSON.stringify({pedidos:pedidos})
    }).then(response=>response.json()).then(data=>{
        if(data.estado){
            Swal.fire({
                title: "Pedidos registrados",
                text: "Todos los pedidos han sido guardados correctamente.",
                icon: "success",
                showConfirmButton:false,
                timer:1300
            }).then(() => {
                window.location.reload();
            });
        }else{
            Swal.fire({
                title: "Error",
                text: data.error,
                icon: "error",
                showConfirmButton:false,
                timer:1300
            })
        }
    }).catch(error=>{
        console.error("error al registrar pedidos: ",error)
    })
}

//Recorre el contenedor "productos-seleccionados" para extraer la informacion y devolver una lista
function consolidar_pedido(){
    let seleccionados=productos_seleccionados.querySelectorAll(".dat-productos")
    if(!validar_pedido(seleccionados)) return
    let pedidos=[]
    let cliente_id=tercero.value.split(":")[0].trim()
    let aux=""
    seleccionados.forEach(producto=>{
        let pro=producto.querySelector(".nombre-producto").value
        let id_pro=producto.querySelector(".nombre-producto").id.split("-")[0]
        let cantidad=producto.querySelector(".input-cant-productos").value
        if(!cantidad && !cantidad>0){
            aux+=pro+", "
        }
        pedidos.push({
            fecha:fecha.value,
            cliente_id:cliente_id,
            id_pro:id_pro,
            cantidad:cantidad,
            orden_compra:orden_compra.value,
            observacion:observacion.value
        })
    })
    let flag=true
    if(aux!==""){
        Swal.fire({
            title:"Advertencia",
            text:`los productos (${aux} ) no se registraran por un error en los datos, ¿desea corregirlos?`,
            icon:"warning",
            showCancelButton:true,
            confirmButtonText:"Si",
            cancelButtonText:"No"
        }).then((response)=>{
            flag=response.isConfirmed
        })
    }
    if(flag) return pedidos
    return
}

//Valida los campos necesarios para enviar los pedidos
function validar_pedido(seleccionados){
    if(seleccionados.length===0){
        Swal.fire({
            tittle:"Informacion",
            text:"Debe seleccionar al menos un producto antes de registrar al pedido",
            icon:"info",
            showConfirmButton:false,
            timer:1300})
        return false
    }
    if(fecha.value===""){
        Swal.fire({
            title:"Informacion",
            text:`No se olvide de seleccionar una fecha`,
            icon:"info",
            showConfirmButton:false,
            timer:1300})
        return false
    }
    if(!Object.values(data_terceros).includes(tercero.value)){
        Swal.fire({
            title:"Error",
            text:`Verifique el nombre del cliente`,
            icon:"error",
            showConfirmButton:false,
            timer:1300})
        return false
    }
    return true
}

//Actualiza un pedido al recibir el envio del formulario segun el id del pedido
function actualizar_pedido(){
    if (validar_actualizacion()) return
    let datos=[producto.value.split("-")[0],cantidad.value,fecha.value,observacion.value,orden_compra.value,id_pedido.value]
    fetch("/actualizar_pedido/",{
        method:"POST",
        headers:{
            'Content_Type':'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body:JSON.stringify({pedido:datos})
    }).then(response=>response.json()).then(data=>{
        if(data.estado){
            Swal.fire({
                title: "Confirmacion",
                text: "Pedido actualizado correctamente",
                icon: "success",
                showConfirmButton:false,
                timer:1300
            }).then(() => {
                window.location.href = "/vista_pedidos/"
            });
        }else{
            Swal.fire({
                title: "Error",
                text: data.error,
                icon: "error",
                showConfirmButton:false,
                timer:1300
            })
        }
    }).catch(error=>{
        console.error("error al actualizar pedido: ",error)
    })
}

//Valida los campos necesarios para actualizar un producto
function validar_actualizacion(){
    let flagFecha=fecha.value===""
    let flagProducto=producto.value===""
    let flagCantidad=cantidad.value<=0
    let flagCons=id_pedido.value===""
    let prodNoExiste=!Object.values(data_productos).includes(producto.value)
    if (flagFecha || flagProducto || flagCantidad || flagCons || prodNoExiste){
        Swal.fire({
            title: "Error",
            text: "Valide que los campos esten completos o el nombre del producto sea correcto",
            icon: "error",
            showConfirmButton:false,
            timer:1300
        })
        return true
    }
    return false
}

//Atrapa y devuelve el valor del CSRF TOKEN necesario para la validacion entre cliente servidor
function getCSRFToken(){
    return document.querySelector('[name=csrfmiddlewaretoken]').value
}

//---------------------------------------MANEJO VENTANA MODAL

//Depende del tamaño de la pantalla muestra una vista de escritorio o una vista de movil
function mostrar_pedidos(){
    id_pedido.value="";
    cuerpo_tabla.innerHTML='<tr id="sin-pedidos" hidden><th><h3>no se encontraron pedidos</h3></th></tr>'
    if(screen.width>=1140) pedidos_vista_escritorio()
    else if(screen.width<1140) pedidos_vista_movil()
    ventana_modal.showModal()
}

//Pinta una vista de escritorio para los pedidos
function pedidos_vista_escritorio(){
    cuerpo_tabla.innerHTML+=`<tr class='tr-large-head'>
                        <th>Id Pedido</th>
                        <th>Cliente</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Despacho</th>
                        <th>Fecha</th>
                        <th>Orden de compra</th>
                        <th>Observacion</th>
                        <th>---</th>
                    </tr>`
    
    pedidos_comercial.forEach(pedido=>{
        let fila=`
            <tr id="${pedido.id}:${pedido.tercero}:${pedido.producto}">
                <td>${pedido.id}</td>
                <td>${pedido.tercero}</td>
                <td>${pedido.producto}</td>
                <td>${pedido.cantidad}</td>
                <td>${pedido.despacho}</td>
                <td>${pedido.fecha}</td>
                <td>${pedido.ord_compra}</td>
                <td>${pedido.obs}</td>
                <td>
                    <button type="button" class="btns-tabla btn-tabla-editar btn-func-editar" data-id="${pedido.id}">Editar</button>
                    <button type="button" class="btns-tabla btn-tabla-eliminar btn-func-eliminar" data-id="${pedido.id}">Eliminar</button>
                </td>
            </tr>
            `
        cuerpo_tabla.innerHTML += fila;
    })
}

//Pinta una vista de movil para los pedidos
function pedidos_vista_movil(){
    cuerpo_tabla.innerHTML+="<tr class='tr-small-head'><th class='th-small'>Informacion</th></tr>"
    pedidos_comercial.forEach(pedido=>{
        let fila=`
        <tr id="${pedido.id}:${pedido.tercero}:${pedido.producto}" class="tr-small-body">
            <th class="th-small">
                <p class="phead" style="grid-row-start: 1">Consecutivo:</p>
                <p class="phead" style="grid-row-start: 2">Cliente:</p>
                <p class="phead" style="grid-row-start: 3">Producto:</p>
                <p class="phead" style="grid-row-start: 4">Cantidad:</p>
                <p class="phead" style="grid-row-start: 5">Despacho:</p>
                <p class="phead" style="grid-row-start: 6">Fecha:</p>
                <p class="phead" style="grid-row-start: 7">Orden compra:</p>
                <p class="phead" style="grid-row-start: 8">Observacion: </p>
                <button style="grid-row-start: 9" type="button" class="btns-tabla btn-tabla-eliminar btn-func-eliminar" data-id="${pedido.id}">Eliminar</button>
                <p id="idPedido" class="pinf" style="grid-row-start: 1">${pedido.id}</p>
                <p id="idPedido" class="pinf" style="grid-row-start: 2">${pedido.tercero}</p>
                <p class="pinf" style="grid-row-start: 3">${pedido.producto}</p>
                <p class="pinf" style="grid-row-start: 4">${pedido.cantidad}</p>
                <p class="pinf" style="grid-row-start: 5">${pedido.despacho}</p>
                <p class="pinf" style="grid-row-start: 6"">${pedido.fecha}</p>
                <p class="pinf" style="grid-row-start: 7">${pedido.ord_compra}</p>
                <p class="pinf" style="grid-row-start: 8">${pedido.obs}</p>
                <button style="grid-row-start: 9" type="button" class="btns-tabla btn-tabla-editar btn-func-editar" data-id="${pedido.id}">Editar</button>
            </th>
        </tr>
        `
        cuerpo_tabla.innerHTML += fila;
    })
}

//Filtra los pedidos segun se digite en el campo de busqueda asociado
function filtrar_pedidos(){
    const contenido=cuerpo_tabla.querySelectorAll("tr")
    const query=input_busqueda_pedidos.value.toLowerCase()
    const msg=cuerpo_tabla.querySelector("#sin-pedidos")
    let disc=0
    contenido.forEach(row=>{
        if (row.id.toLowerCase().indexOf(query)>-1){
            row.style.display=""
            disc++;
        }
        else{row.style.display="none";}
    })
    if(disc==0){
        msg.style.display="table-row"
    }else{
        msg.style.display="none"         
    }
}

//Escribe los datos del pedido seleccionado en el formulario
function buscar_pedido(pedidoId){
    fetch('/buscar_pedido/'+pedidoId+'/').then(response=>response.json()).then(
        pedido=>{
            let splitFecha = pedido.fecha.split("-")
            let año=parseInt(splitFecha[0],10)
            let mes=parseInt(splitFecha[1],10)-1
            let dia=parseInt(splitFecha[2],10)
            id_pedido.value=pedido.id
            tercero.value=pedido.tercero
            producto.value=pedido.producto
            cantidad.value=pedido.cantidad
            fecha._flatpickr.setDate(new Date(año,mes,dia), true)
            orden_compra.value=pedido.ord_compra
            observacion.value=pedido.obs
            ventana_modal.close()
            acceso_formulario()
        }
    ).catch(error =>console.error("Error: ",error))
}

//Elimina el pedido seleccionado segun su ID
async function eliminar_pedido(pedidoId){
    ventana_modal.close()
    let flag= await Swal.fire({
        title:"advertencia",
        text:"¿Esta seguro de eliminar el pedido?",
        showCancelButton: true,
        confirmButtonText: "Si",
        cancelButtonText:"No"
    })
    if(!flag.isConfirmed){
        ventana_modal.showModal()
        return
    }
    fetch("/eliminar_pedido/",{
        method:'POST',
        headers:{
            'Content_Type':'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body:JSON.stringify({id:pedidoId})
    }).then(response=>response.json()).then(data=>{
        if(data.estado){
            cargar_pedidos()
            Swal.fire({
                title:"Confirmacion",
                text:`${data.mensaje}`,
                icon:"success",
                showConfirmButton:false,
                timer:1300}).then(function(){
                    mostrar_pedidos()
                })
        }else{
            Swal.fire({title:"Error",text:`ocurrio un error al eliminar el pedido: ${data.error}`,icon:"error",showConfirmButton:false,timer:1300})
        }
    }).catch(error=>
        Swal.fire({title:"Error",text:`ocurrio un error al eliminar el pedido: ${error}`,icon:"error",showConfirmButton:false,timer:1300})
    )
}

//Cancelar la actualizacion de un pedido y devuelve el formulario a su estado inicial
function cancelar_editar(){
    estado_defecto()
    mostrar_pedidos()
}

//---------------------------------------CARGA DE EVENTOS

//Detecta el evento click en el boton de productos para poder seleccionarlos
btn_productos.addEventListener("click",seleccionar_productos)

//Detecta el evento submit en el formulario
form_pedidos.addEventListener("submit",function(e){
    e.preventDefault()
    let boton=document.activeElement;
    if(boton.name==="accion"){
        if(boton.value==="reg"){
            let pedidos=consolidar_pedido()
            if (pedidos){
                registrar_pedidos(pedidos)
            }
        }else if(boton.value==="act"){
            actualizar_pedido()
        }else{
            Swal.fire({
                title:"Evento inesperado",
                text:"Submit inesperado",
                icon:"warning",
                showConfirmButton: false,
                timer: 2000
            })
        }
    }
})

//Evento click en el boton de registro, para detectar si existen productos sin seleccionar
btn_registrar.addEventListener("click",function(e){
    if(producto.value!="" && cantidad.value>0){
        Swal.fire({
            title:"Advertencia",
            text:`
            Tiene un producto sin seleccionar:
            ${producto.value.split("-")[1]} cantidad ${cantidad.value}.
            por favor borrelo o seleccionelo antes de registrar el pedido
            `,
            icon:"warning",
            showConfirmButton: false,
            timer:3000
        })
        e.preventDefault()
    }
})

//Evento click en el boton salir, agrega la funcionalidad de validar si existen productos seleccionados
btn_cerrar_sesion.addEventListener("click",function(e){
    e.preventDefault()
    if(productos_seleccionados.childElementCount>0){
        Swal.fire({
            title:"Advertencia",
            text:"Aun tiene productos seleccionados, ¿desea registrarlos?",
            icon:"warning",
            showConfirmButton:true,
            showCancelButton:true,
            confirmButtonText:"Si",
            cancelButtonText:"No",
            confirmButtonColor:"green",
            cancelButtonColor:"red"
        }).then(response=>{
            if(!response.isConfirmed){
                window.location.href="/logout/"
            }
        })
    }else{
        window.location.href="/logout/"
    }
})

//Agregamos la funcion para abrir el modal y cargar pedidos
btn_mis_pedidos.addEventListener("click",mostrar_pedidos);

//Cuando la ventana modal esta abierta, detecta el giro de pantalla para ajustarla
window.addEventListener("orientationchange",function(){
    if(ventana_modal.open){
        ventana_modal.close()
        mostrar_pedidos()
    }
})

//Agregamos a la tabla la funcion de eliminar pedidos y le delegamos la funcion a los botones "eliminar"
//Agregamos a la tabla la funcion de editar pedido y le delegamos la funcion a los botones "editar"
tabla_pedidos.addEventListener("click",function(event){
    if(event.target.classList.contains("btn-func-eliminar")){
        let pedidoId=event.target.getAttribute("data-id")
        eliminar_pedido(pedidoId)
    }
    if(event.target.classList.contains("btn-func-editar")){
        let pedidoId=event.target.getAttribute("data-id")
        buscar_pedido(pedidoId)
    }
});

//Asociamos al evento input la funcion de filtrar pedidos segun se escriba en el
input_busqueda_pedidos.addEventListener("input",filtrar_pedidos)

//Agregamos la funcion de cerrar el modal al boton "X" y dejamos el formulario en su estado inicial
btn_cerrar_modal.addEventListener("click",function(){
    ventana_modal.close()
    estado_defecto()
})

//Agregamos la funcion de cancelar la edicion de un pedido en el evento click
btn_cancelar.addEventListener("click",cancelar_editar)

//-------------------------
listas_productos_terceros()
cargar_pedidos()
def_campo_fecha()
estado_defecto()
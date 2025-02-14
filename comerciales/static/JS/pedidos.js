document.addEventListener("DOMContentLoaded", function() {
    let btnCargarPedidos = document.getElementById("btnMisPedidos");
    let modalPedidos = document.getElementById("modalPedidos");
    let cerrarModal = document.getElementById("cerrarModal");
    let tablaPedidos = document.getElementById("tablaPedidos");
    let tbody = document.getElementById("tbody-pedidos");
    let thead = document.getElementById("thead-pedidos");
    let bpedido = document.getElementById("buscar-pedido");
    let form = document.getElementById("form-pedidos");
    let btnReg=document.getElementById("btn-reg");
    let btnAct=document.getElementById("btn-act");
    let btnSal=document.getElementById("logout");
    let btnCan=document.getElementById("btn-canc");
    let inputPedido=document.getElementById("id_pedido");
    let inputTerceros=document.getElementById("id_terceros");
    let inputProductos=document.getElementById("id_productos");
    let tercerosData=document.getElementById("terceros-data");
    let listaTerceros=[];
    let productosData=document.getElementById("productos-data");
    let prod_terceros=document.getElementById("productos-selecionados")
    let pedi_terceros=document.getElementById("pedidos-hechos")
    let inputCantidad=document.getElementById("id_cantidad")
    let btnProductos=document.getElementById("btn-productos")
    const dropdownTer = document.getElementById("tercero-list");
    const dropdownPro = document.getElementById("producto-list");
    let misPedidos=[]


    campoFecha()
    estadoInicial()
    verificar_ProPed()
    cargar_pedidos()

    try{
        tercerosData=JSON.parse(tercerosData.textContent);
        productosData=JSON.parse(productosData.textContent);
        dropdownTer.innerHTML='';
        dropdownPro.innerHTML='';
        inputTerceros.addEventListener("focus",tercerosLista);
        inputTerceros.addEventListener("input",tercerosLista);
        inputProductos.addEventListener("focus",productosLista);
        inputProductos.addEventListener("input",productosLista);

        document.addEventListener("click",function (e){
            if(!inputTerceros.contains(e.target) && !dropdownTer.contains(e.target)){
                dropdownTer.style.display="none";
            }
        });
        document.addEventListener("click",function (e){
            if(!inputProductos.contains(e.target) && !dropdownPro.contains(e.target)){
                dropdownPro.style.display="none";
            }
        });

    }catch (error){
        console.error("Error al parsear o generar la lista de terceros:", error);
    };

    function campoFecha(){
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

    function estadoInicial(){
        let inputFecha=form.querySelector(".datepicker");
        inputPedido.value="";
        inputTerceros.value="";
        form.querySelector("#id_productos").value="";
        form.querySelector("#id_cantidad").value="";
        inputFecha._flatpickr.setDate("", true);
        form.querySelector("#id_orden_compra").value="";
        form.querySelector("#id_observacion").value="";
        estadoFormulario()
    }

    function tercerosLista(){
        const termino=inputTerceros.value.toLowerCase();
        dropdownTer.innerHTML='';
        if(termino==""){
            dropdownTer.style.display="none";
            return;
        }

        Object.entries(tercerosData).forEach(([Key,value])=>{
            listaTerceros.push(value)
            if(value.toLowerCase().includes(termino)){
                const opcion=document.createElement("div");
                opcion.textContent=value;
                opcion.dataset.value=Key;
                opcion.addEventListener("click",function(){
                    inputTerceros.value=opcion.textContent;
                    dropdownTer.style.display="none";
                });
                dropdownTer.appendChild(opcion);
            }
        })
        dropdownTer.style.display=dropdownTer.children.length ? "block":"none";
    };

    function productosLista(){
        const termino=inputProductos.value.toLowerCase();
        dropdownPro.innerHTML='';
        if(termino==""){
            dropdownPro.style.display="none";
            return;
        }

        Object.entries(productosData).forEach(([Key,value])=>{
            if(value.toLowerCase().includes(termino)){
                const opcion=document.createElement("div");
                opcion.textContent=value;
                opcion.dataset.value=Key;
                opcion.addEventListener("click",function(){
                    inputProductos.value=opcion.textContent;
                    dropdownPro.style.display="none";
                });
                dropdownPro.appendChild(opcion);
            }
        })
        dropdownPro.style.display=dropdownPro.children.length ? "block":"none";
    };

    function mostrar_pedidos(){
        inputPedido.value="";
        tbody.innerHTML='<tr id="sin-pedidos" hidden><th><h3>no se encontraron pedidos</h3></th></tr>'
        if(screen.width>=1140) pedidos_escritorio()
        else if(screen.width<1140) pedidos_movil()
        modalPedidos.showModal()
    }

    function capturar_pedido(){
        let seleccionados=prod_terceros.querySelectorAll(".dat-productos")
        let fecha=form.querySelector(".datepicker").value
        let cliente=inputTerceros.value
        if(!validar_pedido(seleccionados,fecha,cliente)) return
        let pedidos=[]
        let cliente_id=cliente.split(":")[0].trim()
        let orden_compra=form.querySelector("#id_orden_compra").value
        let observacion=form.querySelector("#id_observacion").value
        let aux=""
        seleccionados.forEach(producto=>{
            let pro=producto.querySelector(".nombre-producto").value
            let id_pro=producto.querySelector(".nombre-producto").id.split("-")[0]
            let cantidad=producto.querySelector(".input-cant-productos").value
            if(!cantidad && !cantidad>0){
               aux+=pro+", "
            }
            pedidos.push({
                fecha:fecha,
                cliente_id:cliente_id,
                id_pro:id_pro,
                cantidad:cantidad,
                orden_compra:orden_compra,
                observacion:observacion
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
        return []
    }

    function validar_pedido(seleccionados,fecha,cliente){
        if(seleccionados.length===0){
            Swal.fire({
                tittle:"Informacion",
                text:"Debe seleccionar al menos un producto antes de registrar al pedido",
                icon:"info",
                showConfirmButton:false,
                timer:1300})
            return false
        }
        if(fecha===""){
            Swal.fire({
                title:"Informacion",
                text:`No se olvide de seleccionar una fecha`,
                icon:"info",
                showConfirmButton:false,
                timer:1300})
            return false
        }
        if(!listaTerceros.includes(cliente)){
            Swal.fire({
                title:"Error",
                text:`Revise el nombre del cliente`,
                icon:"error",
                showConfirmButton:false,
                timer:1300})
            return false
        }
        return true

    }

    function registrar_pedidos(pedidos){
        fetch("/registrar_pedidos/",{
            method:"POST",
            headers:{
                'Content_Type':'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body:JSON.stringify({pedidos:pedidos})
        }).then(response=>response.json()).then(data=>{
            console.log("Pedidos registrados:", data);
            if(data.estado){
                Swal.fire({
                    title: "Pedidos registrados",
                    text: "Todos los pedidos han sido guardados correctamente.",
                    icon: "success",
                    showConfirmButton:false,
                    timer:1300
                }).then(() => {
                    window.location.reload(); // 🔥 Recargar la página después de la confirmación
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

    function validar_actualizacion(fecha,producto,cantidad,consecutivo){
        let flagFecha=fecha===""
        let flagProducto=producto===""
        let flagCantidad=cantidad<=0
        let flagCons=consecutivo===""
        let prodNoExiste=!Object.values(productosData).includes(inputProductos.value)
        if (flagFecha || flagProducto || flagCantidad || flagCons || prodNoExiste){
            Swal.fire({
                title: "Error",
                text: "Valide que los campos esten completos",
                icon: "error",
                showConfirmButton:false,
                timer:1300
            })
            return true
        }
        return false
    }

    function actualizar_pedido(){
        let fecha=form.querySelector(".datepicker").value
        let producto=form.querySelector("#id_productos").value.split("-")[0]
        let cantidad=form.querySelector("#id_cantidad").value
        let ord_compra=form.querySelector("#id_orden_compra").value
        let obs=form.querySelector("#id_observacion").value
        let consecutivo=form.querySelector("#id_pedido").value
        if (validar_actualizacion(fecha,producto,cantidad,consecutivo)) return
        let datos=[producto,cantidad,fecha,obs,ord_compra,consecutivo]
        fetch("/actualizar_pedido/",{
            method:"POST",
            headers:{
                'Content_Type':'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body:JSON.stringify({pedido:datos})
        }).then(response=>response.json()).then(data=>{
            console.log("Pedidos registrados:", data);
            if(data.estado){
                Swal.fire({
                    title: "Confirmacion",
                    text: "Pedido actualizado correctamente",
                    icon: "success",
                    showConfirmButton:false,
                    timer:1300
                }).then(() => {
                    window.location.href = "/mis_pedidos/"
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

    function pedidos_escritorio(){
        thead.innerHTML=`<tr>
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
        
        misPedidos.forEach(pedido=>{
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
            tbody.innerHTML += fila;
        })
    }
    
    function pedidos_movil(){
        thead.innerHTML="<tr class='tr-small-head'><th class='th-small'>Informacion</th></tr>"
        misPedidos.forEach(pedido=>{
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
            tbody.innerHTML += fila;
        })
    }

    function filtrarPedidos(){
        const contenido=tbody.querySelectorAll("tr");
        const query=bpedido.value.toLowerCase();
        const msg=tbody.querySelector("#sin-pedidos");
        let disc=0
        contenido.forEach(row=>{
            if (row.id.toLowerCase().indexOf(query)>-1){
                row.style.display="";
                disc++;
            }
            else{row.style.display="none";};
        });
        if(disc==0){
            msg.style.display="table-row"
        }else{
            msg.style.display="none"         
        }
    };

    function buscarPedido(pedidoId){
        fetch('/buscar_pedido/'+pedidoId+'/').then(response=>response.json()).then(
            pedido=>{
                let splitFecha = pedido.fecha.split("-")
                let año=parseInt(splitFecha[0],10)
                let mes=parseInt(splitFecha[1],10)-1
                let dia=parseInt(splitFecha[2],10)
                let inputFecha=form.querySelector(".datepicker");
                inputPedido.value=pedido.id;
                inputTerceros.value=pedido.tercero;
                form.querySelector("#id_productos").value=pedido.producto;
                form.querySelector("#id_cantidad").value=pedido.cantidad;
                inputFecha._flatpickr.setDate(new Date(año,mes,dia), true);
                form.querySelector("#id_orden_compra").value=pedido.ord_compra;
                form.querySelector("#id_observacion").value=pedido.obs;
                modalPedidos.close();
                estadoFormulario();
            }
        ).catch(error =>console.error("Error: ",error))
    }

    async function eliminarPedido(pedidoId){
        modalPedidos.close()
        let flag= await Swal.fire({
            title:"advertencia",
            text:"¿Esta seguro de eliminar el pedido?",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText:"No"
        })
        if(!flag.isConfirmed){
            modalPedidos.showModal()
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

    function cancelarEditar(){
        inputPedido.value=''
        inputTerceros.value="";
        let inputFecha=form.querySelector(".datepicker");
        inputFecha._flatpickr.setDate("");  
        form.querySelector("#id_productos").value="";
        form.querySelector("#id_cantidad").value="";
        form.querySelector("#id_fecha").value="";
        form.querySelector("#id_orden_compra").value="";
        form.querySelector("#id_observacion").value="";
        mostrar_pedidos();
        estadoFormulario();
    }

    function estadoFormulario(){
        if(inputPedido.value!==""){
            btnProductos.disabled=true
            btnProductos.setAttribute("style","background-color:gray")
            btnCargarPedidos.disabled=true;
            btnCargarPedidos.setAttribute("style","background-color:gray;")
            inputTerceros.setAttribute("readonly","readonly");
            inputTerceros.setAttribute("style","border-color: #f12323; color: #f12323;");
            btnReg.setAttribute("style","display: none;");
            btnSal.setAttribute("style","display: none;");
            btnAct.setAttribute("style","");
            btnCan.setAttribute("style","");
            
        }else{
            btnProductos.disabled=false  
            btnProductos.removeAttribute("style")
            btnCargarPedidos.disabled=false;
            btnCargarPedidos.removeAttribute("style")
            inputTerceros.removeAttribute("readonly");
            inputTerceros.removeAttribute("style");
            btnReg.setAttribute("style","");
            btnSal.setAttribute("style","");
            btnAct.setAttribute("style","display: none;");
            btnCan.setAttribute("style","display: none;");
        }
    }

    function getCSRFToken(){
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }

    function agregarProducto(){
        let prodVacio=inputProductos.value.trim()===""
        let cantInvalida=inputCantidad.value<=0
        let prodNoExiste=!Object.values(productosData).includes(inputProductos.value)
        if( prodVacio || cantInvalida || prodNoExiste){
            inputProductos.style="outline: 1px solid red;color:red;"
            inputCantidad.style="outline: 1px solid red;color:red;"
            Swal.fire({title:"Error",text:"recuerde rellenar los campos y digitar productos existentes",icon:"error",showConfirmButton:false,timer:1300})
            return
        }
        if (prod_terceros.querySelector(`#${CSS.escape(inputProductos.value)}`) ? true:false){
            inputProductos.value=""
            inputCantidad.value=""
            Swal.fire({title:"Aviso",text:"Este producto ya fue registrado",icon:"warning",showConfirmButton:false,timer:1300})
            return
        }
        inputProductos.removeAttribute("style")
        inputCantidad.removeAttribute("style")
        let cont=document.createElement("div")
        let boton=document.createElement("button")
        let img=document.createElement("img")
        let iconUrl=prod_terceros.getAttribute("data-img-url")
        cont.setAttribute("class","dat-productos")
        cont.innerHTML=`
            <input min="1" max="999" class="input-cant-productos" type="number" style="grid-column-start:1;" value="${inputCantidad.value}">
            <p id="${inputProductos.value}" class="nombre-producto" style="grid-column-start:2;margin:0;">${inputProductos.value.split("-")[1]}</p>
        `
        boton.type="button"
        boton.title="eliminar producto"
        boton.setAttribute("class","btn-del-prod")
        img.src=iconUrl
        img.alt="Icono"
        boton.appendChild(img)
        cont.appendChild(boton)
        prod_terceros.prepend(cont)
        boton.addEventListener("click",function(){
            let nodoPadre=boton.parentNode
            prod_terceros.removeChild(nodoPadre)
            verificar_ProPed()
        })
        inputProductos.value=""
        inputCantidad.value=""
        verificar_ProPed()
    }

    function pedidosXTerceros(){
        let inputFecha=form.querySelector(".datepicker");
        requestAnimationFrame(()=>{
            pedi_terceros.innerHTML=""
            if(misPedidos){
                misPedidos.forEach(pedido=>{
                    let fechaFlag=pedido.fecha.trim()===inputFecha.value.trim()
                    let terceroFlag=pedido.tercero.trim()===inputTerceros.value.split(":")[1].trim()
                    if(fechaFlag && terceroFlag){
                        let contenedor=document.createElement("div")
                        contenedor.setAttribute("class","dat-pedidos")
                        contenedor.innerHTML=`
                            <p class="temp-cant">${pedido.cantidad}</p>
                            <p class="temp-producto">${pedido.producto.split("-")[1]}</p>
                            <p class="consecutivo-pedido">${pedido.id}</p>
                        `
                        pedi_terceros.appendChild(contenedor)
                    }
            })
            }
            verificar_ProPed()
        })
    }

    function verificar_ProPed(){
        let hproter=document.getElementById("prod-ter-sel")
        let hpedter=document.getElementById("ped-ter-reg")
        if(prod_terceros.childElementCount>0){
            hproter.style.display="block"
            prod_terceros.style.display="block"
        }else{
            hproter.style.display="none"
            prod_terceros.style.display="none"
        }
        if(pedi_terceros.childElementCount>0){
            hpedter.style.display="block"
            pedi_terceros.style.display="block"
        }else{
            hpedter.style.display="none"
            pedi_terceros.style.display="none"
        }
    }

    function cargar_pedidos(){
        fetch("/todos_pedidos/").then(response=>response.json()).then(
            data=>{misPedidos=data}
        ).catch(error=>Swal.fire({title:"Error",text:`Ocurrio un error al buscar los pedidos: ${error}`,icon:"error",showConfirmButton:false,timer:1300}))
    }

    inputTerceros.addEventListener("change",pedidosXTerceros)

    btnProductos.addEventListener("click",agregarProducto)

    form.addEventListener("submit",function(e){
        e.preventDefault()
        let boton=document.activeElement;
        if(boton.name==="accion"){
            if(boton.value==="reg"){
                let pedidos=capturar_pedido()
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

    //Cuando la ventana modal esta abierta, detecta el giro de pantalla
    window.addEventListener("orientationchange",function(){
        if(modalPedidos.open){
            modalPedidos.close();
            cargarPedidos();
        }
    });

    //agregamos la funcion de cerrar el modal
    cerrarModal.addEventListener("click",function(){modalPedidos.close()});

    //Agregamos la funcion para abrir el modal y cargar pedidos
    btnCargarPedidos.addEventListener("click",mostrar_pedidos);

    //Agregamos al input la funcion de filtrar pedidos
    bpedido.addEventListener("input",filtrarPedidos);

    //Agregamos a la tabla la funcion de eliminar pedidos y le delegamos la funcion a los botones "eliminar"
    //Agregamos a la tabla la funcion de editar pedido y le delegamos la funcion a los botones "editar"
    tablaPedidos.addEventListener("click",function(event){
        if(event.target.classList.contains("btn-func-eliminar")){
            let pedidoId=event.target.getAttribute("data-id");
            eliminarPedido(pedidoId);
        }
        if(event.target.classList.contains("btn-func-editar")){
            let pedidoId=event.target.getAttribute("data-id");
            buscarPedido(pedidoId);
        }
    });

    btnCan.addEventListener("click",cancelarEditar)

});
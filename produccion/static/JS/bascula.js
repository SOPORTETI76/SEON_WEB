document.addEventListener("DOMContentLoaded", function () {
    const eliminarBtn = document.getElementById("eliminar-btn");
    const urlEliminar = document.getElementById("eliminarRegistrosUrl")?.value;
    const modal = document.getElementById("modal-editar");
    const closeModal = document.querySelector(".close-btn");
    const form = document.getElementById("editar-form");
    const imprimirBtn = document.getElementById("imprimir-btn");
    
    let registroId = null;
    let tipoRegistro = null;

    if (!urlEliminar) {
        console.error("No se pudo obtener la URL de eliminación. ❌");
        return;
    }

    eliminarBtn.addEventListener("click", async function () {
        let registrosBascula = [];
        let registrosDispositivo = [];

        document.querySelectorAll(".registro-checkbox-bascula:checked").forEach(checkbox => {
            registrosBascula.push(checkbox.value);
        });

        document.querySelectorAll(".registro-checkbox-dispositivo:checked").forEach(checkbox => {
            registrosDispositivo.push(checkbox.value);
        });

        if (registrosBascula.length === 0 && registrosDispositivo.length === 0) {
            alert("No has seleccionado ningún registro para eliminar. 🤕");
            return;
        }

        let csrftoken = document.querySelector("[name=csrfmiddlewaretoken]")?.value;
        if (!csrftoken) {
            alert("Error: No se encontró el token CSRF.");
            return;
        }

        let datos = {
            registros_bascula: registrosBascula,
            registros_dispositivo: registrosDispositivo
        };

        try {
            let response = await fetch(urlEliminar, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrftoken
                },
                body: JSON.stringify(datos)
            });

            let data = await response.json();

            if (data.success) {
                alert("Registros eliminados con éxito. ✅");
                location.reload();
            } else {
                alert("Error: " + data.mensaje);
            }
        } catch (error) {
            console.error("❌ Error al eliminar:", error);
        }
    });

    document.querySelectorAll(".btn-editar").forEach(button => {
        button.addEventListener("click", async function () {
            registroId = this.getAttribute("data-id");
            tipoRegistro = this.getAttribute("data-tipo");
            const url = this.getAttribute("data-url");

            console.log("URL de solicitud:", url);
            
            if (!registroId || !tipoRegistro || !url) {
                console.error("Datos de edición no válidos.");
                return;
            }

            document.getElementById("registro_id").value = registroId;
            document.getElementById("tipo_registro").value = tipoRegistro;

            document.getElementById("campo-peso").style.display = tipoRegistro === "bascula" ? "block" : "none";
            document.getElementById("campo-datos").style.display = tipoRegistro === "bascula" ? "none" : "block";

            try {
                let response = await fetch(url);
                let data = await response.json();

                console.log("Respuesta del servidor:", data);

                if (data.estado && data.data.length > 0) {
                    let registro = data.data[0];
                
                    console.log("Datos del registro:", registro); // Verifica estructura en consola
                
                    document.getElementById("peso").value = registro[1] || "";
                    document.getElementById("datos").value = registro[2] || "";
                    document.getElementById("codigo_proveedor").value = registro[3] || "";
                    document.getElementById("proveedor").value = registro[4] || "";
                    document.getElementById("producto").value = registro[5] || "";
                    document.getElementById("lote").value = registro[6] || "";
                    document.getElementById("fecha_vencimiento").value = registro[7]
                        ? new Date(registro[7]).toISOString().split("T")[0]
                        : "";
                    
                    modal.style.display = "block";
                } else {
                    alert("No se encontraron datos para editar.");
                }
                
            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        });
    });

    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
    
        let url = form.action;
        let csrftoken = document.querySelector("[name=csrfmiddlewaretoken]")?.value;
    
        if (!url || !csrftoken) {
            console.error("No se pudo obtener la URL o el token CSRF.");
            return;
        }
    
        if (!confirm("¿Estás seguro de que quieres actualizar este registro?")) {
            return;
        }
    
        let datos = {
            registro_id: document.getElementById("registro_id").value,
            tipo_registro: document.getElementById("tipo_registro").value,
            peso: document.getElementById("peso").value,
            datos: document.getElementById("datos").value,
            codigo_proveedor: document.getElementById("codigo_proveedor").value,
            proveedor: document.getElementById("proveedor").value,
            producto: document.getElementById("producto").value,
            lote: document.getElementById("lote").value,
            fecha_vencimiento: document.getElementById("fecha_vencimiento").value
        };
    
        console.log("Enviando datos para actualizar:", datos);
        console.log("URL de actualización:", url);
    
        try {
            let response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrftoken
                },
                body: JSON.stringify(datos)
            });
    
            let textResponse = await response.text();
            console.log("Respuesta del servidor (texto):", textResponse);
    
            // Verificar si la respuesta es JSON
            try {
                let data = JSON.parse(textResponse);
                console.log("Respuesta del servidor (JSON):", data);
    
                if (data.success) {
                    alert("Registro actualizado correctamente ✅");
                    modal.style.display = "none";
                    location.reload();
                } else {
                    alert("Error al actualizar: " + data.mensaje);
                }
            } catch (jsonError) {
                console.error("❌ Error al parsear JSON:", jsonError);
                alert("Error inesperado: La respuesta del servidor no es válida.");
            }
        } catch (error) {
            console.error("❌ Error al actualizar:", error);
        }
    });
    
    
    
});

function selectText(element) {
    element.select();
}



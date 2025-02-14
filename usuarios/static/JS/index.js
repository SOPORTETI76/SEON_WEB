document.addEventListener("DOMContentLoaded",function(){
    let imagen = document.getElementById("img-login")

    window.addEventListener("orientationchange",function(){
        if(screen.width<750){
            imagen.attributes['src'].value="/static/IMG/productos_pacos_recorte.jpg"
        }else{
            imagen.attributes['src'].value="/static/IMG/productos_pacos.png"
        }
    })

    if(screen.width<750){
        imagen.attributes['src'].value="/static/IMG/productos_pacos_recorte.jpg"
    }
});
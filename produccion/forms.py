from django import forms
from django.core.exceptions import ValidationError

class BasculaForm(forms.Form):
    peso = forms.DecimalField(
        max_digits=10,
        decimal_places=2,
        label="Peso Leído"
    )
    cod_proveedor = forms.CharField(
        max_length=50,
        required=False,
        label="Código de Proveedor:"
    )
    proveedor = forms.CharField(
        max_length=100,
        required=False,
        label="Proveedor:"
    )
    lote = forms.CharField(
        max_length=100,
        required=False,
        label="Lote:"
    )
    producto = forms.CharField(
        max_length=255,
        required=False,
        label="Producto:"
    )
    fecha_ven = forms.DateField(
        required=False,
        label="Fecha de Vencimiento:"
    )

    def clean(self):
        peso = self.cleaned_data.get("peso")
        if peso <= 0:
            raise ValidationError("Peso Inválido") 

#####################################################################################        
        
class DispositivoForm(forms.Form):  
    datos = forms.CharField(
        widget= forms.Textarea,
        label="Datos Enviados:"
    )

    cod_proveedor = forms.CharField(
        max_length=50,
        required=False,
        label="Código de Proveedor:"
    )
    proveedor = forms.CharField(
        max_length=100,
        required=False,
        label="Proveedor:"
    )
    lote = forms.CharField(
        max_length=100,
        required=False,
        label="Lote:"
    )
    producto = forms.CharField(
        max_length=255,
        required=False,
        label="Producto:"
    )
    fecha_ven = forms.DateField(
        required=False,
        label="Fecha de Vencimiento:"
    )
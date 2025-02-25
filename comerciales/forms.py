from django import forms
from datetime import date

class pedidos_form(forms.Form):

    terceros=forms.CharField(
        label="",
        required=True,
        widget=forms.TextInput(attrs={"placeholder":"Buscar tercero","class":"inp-pedido","autocomplete":"off","name":"off","style":"background-color:gray;","readonly":"readonly"})     
    )
    productos=forms.CharField(
        label="",
        required=False,
        widget=forms.TextInput(attrs={"placeholder":"Buscar producto","class":"inp-pedido","autocomplete":"off","name":"off","readonly":"readonly","style":"background-color:gray;"})
    )

    cantidad=forms.IntegerField(
        label="",
        required=False,
        min_value=1,
        widget=forms.NumberInput(attrs={'placeholder':'Cantidad','class':'inp-pedido','min': '1'})
    )

    fecha=forms.DateField(
        label='',
        required=True,
        widget=forms.TextInput(attrs={'placeholder':'Selecione una fecha','class':'inp-pedido datepicker'})
    )
    
    observacion=forms.CharField(
        label='',
        required=False,
        max_length=100,
        widget=forms.Textarea(attrs={'placeholder':'Aqui puede digitar sus observaciones... ','class':'inp-pedido txt-obs','row':5,'maxlength':'100'})
    )
    orden_compra=forms.CharField(
        max_length=15,
        label='',
        required=False,
        widget=forms.TextInput(attrs={'placeholder':'Digitar orden de compra','class':'inp-pedido'})
    )

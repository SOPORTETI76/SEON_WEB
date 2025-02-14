from django import forms

class form_login(forms.Form):
    usuario=forms.CharField(
        label="",
        max_length=20,
        required=True,
        widget=forms.TextInput(attrs={"placeholder":"Digite su usuario","class":"log"})
    )
    clave=forms.CharField(
        label="",
        max_length=10,
        required=True,
        widget=forms.PasswordInput(attrs={"placeholder":"Digite su contraseña","class":"log"})
    )
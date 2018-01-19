from django import forms
from .models import Image, Feedback

class ImageForm(forms.ModelForm):
    class Meta:
        model = Image
        fields = ('image',)

class FeedbackForm(forms.ModelForm):
	u_email = forms.EmailField(label='')
	u_name = forms.CharField(label='')
	u_body = forms.CharField(widget=forms.Textarea, label='')
	class Meta:
		model = Feedback
		fields = ('u_name', 'u_email', 'u_body')
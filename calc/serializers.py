from .models import Image
from rest_framework import serializers

class UserProfileSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Image
        fields = ('image', 'title')
        readonly_fields = ('image')
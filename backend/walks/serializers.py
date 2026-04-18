from rest_framework import serializers
from .models import Dog, WalkRequest

class DogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dog
        fields = '__all__'

class WalkRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalkRequest
        fields = '__all__'

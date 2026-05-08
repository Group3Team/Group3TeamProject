from rest_framework import serializers
from .models import Dog, WalkRequest

class DogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dog
        fields = '__all__'
        read_only_fields = ['owner']

class WalkRequestSerializer(serializers.ModelSerializer):
    walker_username = serializers.CharField(source='walker.username', read_only=True)
    
    class Meta:
        model = WalkRequest
        fields = '__all__'
        read_only_fields = ['owner']

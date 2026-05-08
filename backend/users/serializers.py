from rest_framework import serializers
from .models import User, WalkerProfile, OwnerProfile

class WalkerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalkerProfile
        fields = ['max_dogs', 'service_radius_km', 'current_location', 'is_online']

class OwnerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OwnerProfile
        fields = ['home_location']

class UserSerializer(serializers.ModelSerializer):
    walker_profile = WalkerProfileSerializer(read_only=True)
    owner_profile = OwnerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'walker_profile', 'owner_profile']

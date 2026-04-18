from .models import Messages
from rest_framework import serializers


class MessagesSerializer(serializers.ModelSerializer):

    class Meta:
        model = Messages
        fields = ('id', 'owner', 'walker', 'message', 'create_at',)
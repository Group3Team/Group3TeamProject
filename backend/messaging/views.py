from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Messages
from .serializers import MessagesSerializer

# Create your views here.
class MessagesView():

    def get(self, request):
        messages = Messages.objects.all()
        serializer = MessagesSerializer(messages, many=True)
        return Response(serializer.data)
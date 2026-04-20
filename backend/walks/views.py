from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Dog, WalkRequest
from .serializers import DogSerializer, WalkRequestSerializer

class DogViewSet(viewsets.ModelViewSet):
    queryset = Dog.objects.all()
    serializer_class = DogSerializer

class WalkRequestViewSet(viewsets.ModelViewSet):
    queryset = WalkRequest.objects.all()
    serializer_class = WalkRequestSerializer

@api_view(['POST'])
def create_payment_intent(request):
    return Response(
        {'error': 'Payment processing not yet configured.'},
        status=status.HTTP_501_NOT_IMPLEMENTED
    )

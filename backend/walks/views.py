from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from .models import Dog, WalkRequest
from .serializers import DogSerializer, WalkRequestSerializer
import stripe

stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', 'sk_test_mock')
from .serializers import DogSerializer, WalkRequestSerializer

class DogViewSet(viewsets.ModelViewSet):
    queryset = Dog.objects.all()
    serializer_class = DogSerializer

class WalkRequestViewSet(viewsets.ModelViewSet):
    queryset = WalkRequest.objects.all()
    serializer_class = WalkRequestSerializer

@api_view(['POST'])
def create_payment_intent(request):
    try:
        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            amount=2500, # $25.00
            currency='usd',
            automatic_payment_methods={
                'enabled': True,
            },
        )
        return Response({
            'clientSecret': intent.client_secret
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, WalkerProfile, OwnerProfile
from .serializers import UserSerializer, WalkerProfileSerializer, OwnerProfileSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class WalkerProfileViewSet(viewsets.ModelViewSet):
    queryset = WalkerProfile.objects.all()
    serializer_class = WalkerProfileSerializer

class OwnerProfileViewSet(viewsets.ModelViewSet):
    queryset = OwnerProfile.objects.all()
    serializer_class = OwnerProfileSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')
    role = request.data.get('role', 'OWNER')

    if not username or not email or not password:
        return Response({'error': 'username, email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password, role=role)
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data,
    }, status=status.HTTP_201_CREATED)

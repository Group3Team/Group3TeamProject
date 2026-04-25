import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import walks.routing # You'll need to create this

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(walks.routing.websocket_urlpatterns)
    ),
})
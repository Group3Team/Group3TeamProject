from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/walk/(?P<walk_id>\w+)/$', consumers.WalkConsumer.as_asgi()),
]
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

class WalkConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            walk_id = int(self.scope['url_route']['kwargs']['walk_id'])
        except (ValueError, KeyError):
            await self.close(code=4004)  # Bad request ID
            return

        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close(code=4001)  # Unauthorized — no valid session
            return

        try:
            from .models import WalkRequest
            walk_request = await sync_to_async(WalkRequest.objects.get)(pk=walk_id)
        except WalkRequest.DoesNotExist:
            await self.close(code=4004)  # Not found
            return

        # Only owner or assigned walker can join the walk WebSocket
        if user != walk_request.owner and (walk_request.walker is None or user != walk_request.walker):
            await self.close(code=4003)  # Forbidden
            return

        self.walk_id = walk_id
        self.room_group_name = f'walk_{self.walk_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'location_update':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'walk_message',
                    'action': 'location_update',
                    'lat': data.get('lat'),
                    'lng': data.get('lng'),
                }
            )
        elif action == 'chat_message':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'walk_message',
                    'action': 'chat_message',
                    'message': data.get('message'),
                    'sender_id': data.get('sender_id')
                }
            )
            
    async def walk_message(self, event):
        await self.send(text_data=json.dumps(event))

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class WalkConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.walk_id = self.scope['url_route']['kwargs']['walk_id']
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

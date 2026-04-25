import time
from django.core.management.base import BaseCommand
from walks.models import WalkRequest
from users.models import User

class Command(BaseCommand):
    help = 'Automatically accepts pending walk requests for demo purposes'

    def handle(self, *args, **options):
        self.stdout.write('Auto-accept bot started...')
        dummy_walker = User.objects.get(username='dummy_walker')
        
        while True:
            pending = WalkRequest.objects.filter(status='SEARCHING')
            for request in pending:
                self.stdout.write(f'Accepting request {request.id}...')
                request.status = 'ACCEPTED'
                request.walker = dummy_walker
                request.save()
            
            time.sleep(5)

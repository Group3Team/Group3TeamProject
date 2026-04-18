from django.db import models
from users.models import User
# Create your models here.

class Message(models.Model):
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    message = models.TextField()
    create_at = models.DateTimeField(auto_now_add=True)
from django.db import models
from users.models import User
# Create your models here.

class Messages(models.Model):
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_message')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_message')
    message = models.TextField()
    create_at = models.DateTimeField(auto_now_add=True)
  
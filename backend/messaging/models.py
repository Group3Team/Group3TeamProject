from django.db import models
from users.models import User
# Create your models here.

class Messages(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name='owner_profile')
    walker = models.OneToOneField(User, on_delete=models.CASCADE, related_name='walker_profile')
    message = models.TextField()
    create_at = models.DateTimeField(auto_now_add=True)
  
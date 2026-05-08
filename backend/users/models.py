from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('OWNER', 'Owner'),
        ('WALKER', 'Walker'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='OWNER')
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
    )

class WalkerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='walker_profile')
    max_dogs = models.IntegerField(default=1)
    service_radius_km = models.FloatField(default=5.0)
    current_location = models.PointField(null=True, blank=True)
    is_online = models.BooleanField(default=False)

class OwnerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='owner_profile')
    home_location = models.PointField(null=True, blank=True)

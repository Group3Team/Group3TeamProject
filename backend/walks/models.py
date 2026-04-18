from django.contrib.gis.db import models
from django.conf import settings

class Dog(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='dogs')
    name = models.CharField(max_length=100)
    breed = models.CharField(max_length=100, blank=True)
    size = models.CharField(max_length=20, choices=(('SMALL', 'Small'), ('MEDIUM', 'Medium'), ('LARGE', 'Large')))
    notes = models.TextField(blank=True)

class WalkRequest(models.Model):
    STATUS_CHOICES = (
        ('SEARCHING', 'Searching'),
        ('ACCEPTED', 'Accepted'),
        ('ARRIVING', 'Arriving'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='walk_requests_as_owner')
    walker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='walk_requests_as_walker')
    dogs = models.ManyToManyField(Dog)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SEARCHING')
    pickup_location = models.PointField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    price = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    payment_intent_id = models.CharField(max_length=100, blank=True, null=True)

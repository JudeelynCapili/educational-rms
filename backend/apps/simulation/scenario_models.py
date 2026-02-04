"""Models for scenario analysis and capacity snapshots."""
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class CapacitySnapshot(models.Model):
    """Snapshot of capacity data at a point in time."""
    timestamp = models.DateTimeField(auto_now_add=True)
    date = models.DateField()
    room_count = models.IntegerField()
    total_slots = models.IntegerField()
    booked_slots = models.IntegerField()
    utilization_pct = models.FloatField()
    equipment_data = models.JSONField(default=dict)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Snapshot {self.date} - {self.utilization_pct}%"


class SavedScenario(models.Model):
    """Saved scenario analysis for comparison and tracking."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    scenario_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} by {self.user.username}"

from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

class Equipment(models.Model):
    """Equipment that can be linked to rooms"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    quantity = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} (x{self.quantity})"
    
    class Meta:
        verbose_name_plural = "Equipment"

class Room(models.Model):
    ROOM_TYPES = [
        ('LAB', 'Computer Lab'),
        ('CLASSROOM', 'Classroom'),
        ('CONFERENCE', 'Conference Room'),
        ('AUDITORIUM', 'Auditorium'),
        ('STUDY_ROOM', 'Study Room'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES)
    capacity = models.IntegerField()
    floor = models.CharField(max_length=10, blank=True)
    building = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    equipment = models.ManyToManyField(Equipment, blank=True, related_name='rooms')
    features = models.JSONField(default=list, blank=True, help_text="Additional features like projector, whiteboard, etc.")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_room_type_display()})"
    
    class Meta:
        ordering = ['name']

class TimeSlot(models.Model):
    SLOT_TYPES = [
        ('HOURLY', 'Hourly'),
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
    ]
    
    name = models.CharField(max_length=100, help_text="e.g., Morning Slot, Period 1")
    slot_type = models.CharField(max_length=20, choices=SLOT_TYPES, default='HOURLY')
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    days_of_week = models.JSONField(default=list, blank=True, help_text="Days when this slot is available [0=Monday, 6=Sunday]")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("End time must be after start time")
    
    def __str__(self):
        return f"{self.name}: {self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"
    
    class Meta:
        ordering = ['start_time']

class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]
    
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='bookings')
    date = models.DateField()
    end_date = models.DateField(null=True, blank=True, help_text="For multi-day bookings")
    purpose = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    participants_count = models.IntegerField()
    
    # Recurring booking fields
    is_recurring = models.BooleanField(default=False)
    recurrence_pattern = models.CharField(max_length=50, blank=True, help_text="e.g., DAILY, WEEKLY, MONTHLY")
    recurrence_end_date = models.DateField(null=True, blank=True)
    parent_booking = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='recurring_instances')
    
    # Admin override fields
    conflict_override = models.BooleanField(default=False, help_text="Admin can override conflict detection")
    override_reason = models.TextField(blank=True)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='approved_bookings')
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-time_slot__start_time']
        indexes = [
            models.Index(fields=['date', 'room']),
            models.Index(fields=['status']),
            models.Index(fields=['user']),
        ]
    
    def clean(self):
        # Check for conflicts unless override is enabled
        if not self.conflict_override:
            conflicts = Booking.objects.filter(
                room=self.room,
                date=self.date,
                time_slot=self.time_slot,
                status__in=['APPROVED', 'CONFIRMED']
            ).exclude(pk=self.pk)
            
            if conflicts.exists():
                raise ValidationError(f"This time slot is already booked for {self.room.name}")
    
    def __str__(self):
        return f"{self.room.name} - {self.date} ({self.time_slot})"

class Waitlist(models.Model):
    """Waitlist for bookings when resources are unavailable"""
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]
    
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='waitlist_entries')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='waitlist_entries')
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='waitlist_entries')
    date = models.DateField()
    purpose = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    participants_count = models.IntegerField()
    is_fulfilled = models.BooleanField(default=False)
    fulfilled_booking = models.ForeignKey(Booking, null=True, blank=True, on_delete=models.SET_NULL, related_name='waitlist_source')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-priority', 'created_at']
        indexes = [
            models.Index(fields=['date', 'room']),
            models.Index(fields=['is_fulfilled']),
        ]
    
    def __str__(self):
        return f"Waitlist: {self.user.email} - {self.room.name} on {self.date}"
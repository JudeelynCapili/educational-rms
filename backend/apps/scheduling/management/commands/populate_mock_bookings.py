from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.scheduling.models import Booking, Room, TimeSlot
from datetime import datetime, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate database with mock booking data'

    def handle(self, *args, **options):
        # Get existing users
        users = User.objects.filter(is_active=True)[:5]
        if not users.exists():
            self.stdout.write("No active users found. Please create users first.")
            return
        
        user_list = list(users)

        # Get existing rooms
        rooms = Room.objects.all()
        if not rooms.exists():
            self.stdout.write("No rooms found. Please create rooms first.")
            return

        # Get existing time slots
        time_slots = TimeSlot.objects.all()
        if not time_slots.exists():
            self.stdout.write("No time slots found. Please create time slots first.")
            return

        # Mock booking data
        mock_bookings = [
            {
                'course_code': 'TESOL',
                'user_name': 'Juan Dela Cruz',
                'date_offset': 11,  # Feb 16
                'time_slot_index': 0,
                'room_name': 'CMSC 311',
                'status': 'APPROVED',
                'priority': 'MEDIUM',
                'participants': 20,
                'is_recurring': True,
                'recurrence_pattern': 'WEEKLY',
                'purpose': 'TESOL Class'
            },
            {
                'course_code': 'BSCS 201',
                'user_name': 'Maria Garcia',
                'date_offset': 12,  # Feb 17
                'time_slot_index': 1,
                'room_name': 'Lab Room 101',
                'status': 'APPROVED',
                'priority': 'HIGH',
                'participants': 35,
                'is_recurring': False,
                'purpose': 'Computer Science Lab'
            },
            {
                'course_code': 'MATH 101',
                'user_name': 'Jose Santos',
                'date_offset': 13,  # Feb 18
                'time_slot_index': 2,
                'room_name': 'Lecture Hall A',
                'status': 'APPROVED',
                'priority': 'LOW',
                'participants': 50,
                'is_recurring': True,
                'recurrence_pattern': 'WEEKLY',
                'purpose': 'Mathematics Lecture'
            },
        ]

        # Additional mock bookings to reach ~108 total
        statuses = ['PENDING', 'APPROVED', 'CONFIRMED', 'COMPLETED', 'REJECTED']
        priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
        courses = ['BSCS 101', 'BSCS 102', 'BSCS 201', 'BSCS 301', 'MATH 101', 'PHYS 101', 'CHEM 101', 'TESOL']
        
        # Create bookings from mock data
        created_count = 0
        for mock in mock_bookings:
            # Find user from existing users
            user = random.choice(user_list)
            
            # Find room
            room = next((r for r in rooms if mock['room_name'] in r.name or r.name in mock['room_name']), rooms.first())
            
            # Get time slot
            time_slot = list(time_slots)[min(mock['time_slot_index'], time_slots.count() - 1)]
            
            # Calculate date
            base_date = datetime(2026, 2, 5)
            booking_date = base_date + timedelta(days=mock['date_offset'])
            
            # Check if booking already exists
            existing = Booking.objects.filter(
                room=room,
                date=booking_date.date(),
                time_slot=time_slot,
                user=user
            ).exists()
            
            if not existing:
                booking = Booking.objects.create(
                    room=room,
                    user=user,
                    time_slot=time_slot,
                    date=booking_date.date(),
                    purpose=mock['purpose'],
                    status=mock['status'],
                    priority=mock['priority'],
                    participants_count=mock['participants'],
                    is_recurring=mock['is_recurring'],
                    recurrence_pattern=mock.get('recurrence_pattern', ''),
                    notes=f"Course: {mock['course_code']}"
                )
                created_count += 1
                self.stdout.write(f"Created booking: {mock['course_code']} - {booking_date.date()}")

        # Create additional random bookings to reach ~108
        existing_bookings = Booking.objects.count()
        target_count = 108
        bookings_to_create = max(0, target_count - existing_bookings)
        
        for i in range(bookings_to_create):
            user = random.choice(user_list)
            room = random.choice(rooms)
            time_slot = random.choice(list(time_slots))
            
            # Generate random date in February 2026
            date_offset = random.randint(1, 28)
            base_date = datetime(2026, 2, 1)
            booking_date = base_date + timedelta(days=date_offset)
            
            # Check for conflicts
            existing = Booking.objects.filter(
                room=room,
                date=booking_date.date(),
                time_slot=time_slot,
                status__in=['APPROVED', 'CONFIRMED']
            ).exists()
            
            if not existing:
                course = random.choice(courses)
                booking = Booking.objects.create(
                    room=room,
                    user=user,
                    time_slot=time_slot,
                    date=booking_date.date(),
                    purpose=f"{course} Class",
                    status=random.choice(statuses),
                    priority=random.choice(priorities),
                    participants_count=random.randint(10, 60),
                    is_recurring=random.choice([True, False]),
                    notes=f"Course: {course}"
                )
                created_count += 1

        final_count = Booking.objects.count()
        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} bookings. Total bookings: {final_count}'))

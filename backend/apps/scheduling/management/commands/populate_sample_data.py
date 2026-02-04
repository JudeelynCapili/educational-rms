from django.core.management.base import BaseCommand
from apps.scheduling.models import Room, Equipment, RoomEquipment

class Command(BaseCommand):
    help = 'Populate database with sample rooms and equipment'

    def handle(self, *args, **options):
        # Create equipment
        equipment_data = [
            {'name': 'Projector', 'quantity': 10},
            {'name': 'Whiteboard', 'quantity': 15},
            {'name': 'Computers', 'quantity': 50},
            {'name': 'Microphone', 'quantity': 20},
            {'name': 'Camera', 'quantity': 8},
        ]
        
        equipment_objs = {}
        for eq_data in equipment_data:
            eq, created = Equipment.objects.get_or_create(
                name=eq_data['name'],
                defaults={'quantity': eq_data['quantity']}
            )
            equipment_objs[eq_data['name']] = eq
            if created:
                self.stdout.write(f"Created equipment: {eq.name}")
            else:
                self.stdout.write(f"Equipment already exists: {eq.name}")

        # Create rooms
        rooms_data = [
            {
                'name': 'Lab A101',
                'room_type': 'LAB',
                'capacity': 30,
                'floor': '1',
                'building': 'Building A',
                'equipment_list': ['Computers', 'Projector', 'Whiteboard']
            },
            {
                'name': 'Lab B202',
                'room_type': 'LAB',
                'capacity': 25,
                'floor': '2',
                'building': 'Building B',
                'equipment_list': ['Computers', 'Whiteboard', 'Camera']
            },
            {
                'name': 'Conference Room C303',
                'room_type': 'CONFERENCE',
                'capacity': 15,
                'floor': '3',
                'building': 'Building C',
                'equipment_list': ['Projector', 'Microphone', 'Camera']
            },
            {
                'name': 'Classroom D101',
                'room_type': 'CLASSROOM',
                'capacity': 40,
                'floor': '1',
                'building': 'Building D',
                'equipment_list': ['Projector', 'Whiteboard']
            },
            {
                'name': 'Study Room E201',
                'room_type': 'STUDY_ROOM',
                'capacity': 8,
                'floor': '2',
                'building': 'Building E',
                'equipment_list': ['Whiteboard']
            },
        ]

        for room_data in rooms_data:
            equipment_list = room_data.pop('equipment_list')
            room, created = Room.objects.get_or_create(
                name=room_data['name'],
                defaults=room_data
            )
            
            if created:
                self.stdout.write(f"Created room: {room.name}")
            else:
                self.stdout.write(f"Room already exists: {room.name}")
            
            # Assign equipment to room
            for eq_name in equipment_list:
                if eq_name in equipment_objs:
                    re, created = RoomEquipment.objects.get_or_create(
                        room=room,
                        equipment=equipment_objs[eq_name],
                        defaults={'quantity': 1}
                    )
                    if created:
                        self.stdout.write(f"  Assigned {eq_name} to {room.name}")

        self.stdout.write(self.style.SUCCESS('✓ Sample data populated successfully!'))

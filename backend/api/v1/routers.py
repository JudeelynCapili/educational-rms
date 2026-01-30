from rest_framework.routers import DefaultRouter
from apps.users.views import UserViewSet, UserProfileViewSet
from apps.scheduling.views import (
    BookingViewSet, RoomViewSet, TimeSlotViewSet,
    EquipmentViewSet, WaitlistViewSet
)
from apps.simulation.views import SimulationViewSet

router = DefaultRouter()

# Auth endpoints
router.register(r'auth/users', UserViewSet, basename='user')
router.register(r'auth/profiles', UserProfileViewSet, basename='profile')

# Scheduling endpoints
router.register(r'scheduling/bookings', BookingViewSet, basename='booking')
router.register(r'scheduling/rooms', RoomViewSet, basename='room')
router.register(r'scheduling/timeslots', TimeSlotViewSet, basename='timeslot')
router.register(r'scheduling/equipment', EquipmentViewSet, basename='equipment')
router.register(r'scheduling/waitlist', WaitlistViewSet, basename='waitlist')

# Simulation endpoints
router.register(r'simulation', SimulationViewSet, basename='simulation')

urlpatterns = router.urls

"""Dashboard views and utilities for user dashboard."""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from apps.scheduling.models import Booking, Room, TimeSlot, Waitlist
from apps.simulation.models import SimulationResult
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics for the current user."""
    logger.info(f'=== DASHBOARD REQUEST ===')
    logger.info(f'User: {request.user}')
    logger.info(f'Auth: {request.auth}')
    logger.info(f'Headers: {dict(request.headers)}')
    logger.info(f'Authenticated: {request.user.is_authenticated}')
    
    user = request.user
    
    # User info
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role,
        'department': user.department,
        'avatar_url': f"https://ui-avatars.com/api/?name={user.get_full_name() or user.username}&background=0D8ABC&color=fff"
    }
    
    # Get recent bookings (limit 5)
    # Admin/Faculty see all recent bookings, others see only their own
    if user.role.upper() in ['ADMIN', 'FACULTY']:
        recent_bookings = Booking.objects.all().select_related('room', 'time_slot', 'user').order_by('-created_at')[:5]
    else:
        recent_bookings = Booking.objects.filter(user=user).select_related('room', 'time_slot').order_by('-created_at')[:5]
    
    bookings_data = [
        {
            'id': booking.id,
            'room_name': booking.room.name,
            'date': booking.date.isoformat(),
            'time': f"{booking.time_slot.start_time} - {booking.time_slot.end_time}",
            'status': booking.status,
            'purpose': booking.purpose,
            'user_name': booking.user.get_full_name() or booking.user.username if user.role.upper() in ['ADMIN', 'FACULTY'] else None,
        }
        for booking in recent_bookings
    ]
    
    # Get booking stats
    # Admin/Faculty see system-wide stats, others see only their own
    if user.role.upper() in ['ADMIN', 'FACULTY']:
        booking_stats = {
            'total_bookings': Booking.objects.count(),
            'confirmed_bookings': Booking.objects.filter(status='CONFIRMED').count(),
            'pending_bookings': Booking.objects.filter(status='PENDING').count(),
            'approved_bookings': Booking.objects.filter(status='APPROVED').count(),
            'cancelled_bookings': Booking.objects.filter(status='CANCELLED').count(),
            'rejected_bookings': Booking.objects.filter(status='REJECTED').count(),
        }
    else:
        booking_stats = {
            'total_bookings': Booking.objects.filter(user=user).count(),
            'confirmed_bookings': Booking.objects.filter(user=user, status='CONFIRMED').count(),
            'pending_bookings': Booking.objects.filter(user=user, status='PENDING').count(),
            'approved_bookings': Booking.objects.filter(user=user, status='APPROVED').count(),
            'cancelled_bookings': Booking.objects.filter(user=user, status='CANCELLED').count(),
            'rejected_bookings': Booking.objects.filter(user=user, status='REJECTED').count(),
        }
    
    # Get simulation stats (if user has run simulations)
    simulation_stats = {
        'total_simulations': SimulationResult.objects.count(),
        'latest_simulation': None
    }
    
    latest_sim = SimulationResult.objects.order_by('-run_date').first()
    if latest_sim:
        simulation_stats['latest_simulation'] = {
            'scenario_name': latest_sim.scenario.name if latest_sim.scenario else 'Unknown',
            'run_date': latest_sim.run_date.isoformat(),
        }
    
    # Admin-specific scheduling stats
    scheduling_stats = None
    if user.role.upper() in ['ADMIN', 'FACULTY']:
        today = timezone.now().date()
        week_from_now = today + timedelta(days=7)
        
        scheduling_stats = {
            'pending_approvals': Booking.objects.filter(status='PENDING').count(),
            'total_rooms': Room.objects.filter(is_active=True).count(),
            'active_time_slots': TimeSlot.objects.filter(is_active=True).count(),
            'waitlist_entries': Waitlist.objects.filter(is_fulfilled=False).count(),
            'upcoming_bookings': Booking.objects.filter(
                date__gte=today,
                date__lte=week_from_now,
                status__in=['APPROVED', 'CONFIRMED']
            ).count(),
            'conflicts_today': Booking.objects.filter(
                date=today,
                conflict_override=True
            ).count(),
        }
        
        # Get pending booking requests for quick approval
        pending_requests = Booking.objects.filter(status='PENDING').select_related(
            'user', 'room', 'time_slot'
        ).order_by('-created_at')[:5]
        
        scheduling_stats['pending_requests'] = [
            {
                'id': booking.id,
                'user_name': booking.user.get_full_name() or booking.user.username,
                'room_name': booking.room.name,
                'date': booking.date.isoformat(),
                'time': f"{booking.time_slot.start_time} - {booking.time_slot.end_time}",
                'purpose': booking.purpose,
                'priority': booking.priority,
                'created_at': booking.created_at.isoformat(),
            }
            for booking in pending_requests
        ]
    
    response_data = {
        'success': True,
        'user': user_data,
        'booking_stats': booking_stats,
        'recent_bookings': bookings_data,
        'simulation_stats': simulation_stats,
    }
    
    if scheduling_stats:
        response_data['scheduling_stats'] = scheduling_stats
    
    return Response(response_data, status=status.HTTP_200_OK)

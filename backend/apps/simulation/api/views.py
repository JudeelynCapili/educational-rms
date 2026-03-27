"""Views for simulation app."""
import math
import random
from datetime import datetime
from collections import deque
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import SimulationScenario, SimulationResult, SimulationAuditLog
from .serializers import (
    SimulationScenarioSerializer,
    SimulationResultSerializer,
    SimulationAuditLogSerializer,
)
from apps.scheduling.models import Room, Equipment, RoomEquipment, Booking


class SimulationViewSet(viewsets.ModelViewSet):
    """ViewSet for Simulation management."""
    
    serializer_class = SimulationScenarioSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['created_at']
    ordering_fields = ['created_at', 'name']

    HISTORY_RETENTION_PER_CATEGORY = 10
    HISTORY_TYPE_KEYWORDS = {
        'room-usage': ['room usage simulation', 'room usage'],
        'equipment-usage': ['equipment usage simulation', 'equipment usage'],
        'peak-hour': ['peak-hour scenario simulation', 'peak-hour', 'peak hour'],
        'what-if': ['what-if analysis', 'what-if', 'what if'],
        'shortage': ['shortage scenario simulation', 'shortage scenario', 'shortage'],
    }
    
    def get_queryset(self):
        """Get all simulations."""
        return SimulationScenario.objects.all()

    @action(detail=False, methods=['get'])
    def system_snapshot(self, request):
        """Return current rooms, equipment, and booking summary for simulation setup."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        rooms = Room.objects.all().prefetch_related('room_equipment__equipment')
        equipment = Equipment.objects.all()

        room_payload = []
        for room in rooms:
            eq_list = []
            for re in room.room_equipment.all():
                eq_list.append({
                    'id': re.equipment.id,
                    'name': re.equipment.name,
                    'quantity': re.quantity,
                })
            room_payload.append({
                'id': room.id,
                'name': room.name,
                'capacity': room.capacity,
                'equipment': eq_list,
            })

        equipment_payload = [
            {
                'id': eq.id,
                'name': eq.name,
                'quantity': eq.quantity,
                'is_active': eq.is_active,
            }
            for eq in equipment
        ]

        booking_summary = {}
        bookings = Booking.objects.select_related('room', 'time_slot')
        if start_date:
            bookings = bookings.filter(date__gte=start_date)
        if end_date:
            bookings = bookings.filter(date__lte=end_date)

        for booking in bookings:
            duration = (
                (booking.time_slot.end_time.hour + booking.time_slot.end_time.minute / 60)
                - (booking.time_slot.start_time.hour + booking.time_slot.start_time.minute / 60)
            )
            room_id = booking.room_id
            if room_id not in booking_summary:
                booking_summary[room_id] = {
                    'room_id': room_id,
                    'room_name': booking.room.name,
                    'total_bookings': 0,
                    'total_hours': 0.0,
                }
            booking_summary[room_id]['total_bookings'] += 1
            booking_summary[room_id]['total_hours'] += max(duration, 0.0)

        return Response({
            'rooms': room_payload,
            'equipment': equipment_payload,
            'booking_summary': list(booking_summary.values())
        })

    def _get_rng(self, prng, seed):
        if prng == 'system':
            return random.SystemRandom()
        rng = random.Random()
        if seed is not None:
            rng.seed(seed)
        return rng

    def _service_time(self, rng, service_distribution, service_rate, service_time):
        if service_distribution == 'fixed':
            return service_time
        return rng.expovariate(service_rate)

    def _simulate_replication(self, params):
        arrival_rate = params.get('arrival_rate')
        service_distribution = params.get('service_distribution', 'exponential')
        service_rate = params.get('service_rate', 1.0)
        service_time = params.get('service_time')
        num_servers = int(params.get('num_servers') or 1)
        simulation_hours = float(params.get('simulation_hours') or 8)
        prng = params.get('prng', 'mt19937')
        seed = params.get('seed')

        rng = self._get_rng(prng, seed)

        if arrival_rate is None or arrival_rate <= 0:
            raise ValueError('arrival_rate must be greater than 0')

        if service_distribution == 'exponential' and (service_rate is None or service_rate <= 0):
            raise ValueError('service_rate must be greater than 0 for exponential distribution')

        if service_distribution == 'fixed' and (service_time is None or service_time <= 0):
            raise ValueError('service_time must be greater than 0 for fixed distribution')

        # Simulation clock in hours
        t = 0.0
        max_time = simulation_hours

        next_arrival = rng.expovariate(arrival_rate)
        # Tracks only currently busy servers. Idle servers are implied by
        # num_servers - len(busy_end_times) and prevent zero-time departure loops.
        busy_end_times = []
        queue = deque()

        total_wait = 0.0
        total_system = 0.0
        total_service = 0.0
        served_count = 0
        max_queue_length = 0
        last_event_time = 0.0
        area_queue = 0.0

        while t < max_time:
            next_departure = min(busy_end_times) if busy_end_times else math.inf
            next_event = min(next_arrival, next_departure)

            # Advance time and accumulate queue length
            if next_event > max_time:
                area_queue += len(queue) * (max_time - last_event_time)
                break

            area_queue += len(queue) * (next_event - last_event_time)
            t = next_event
            last_event_time = t

            if next_arrival <= next_departure:
                # Arrival
                if len(busy_end_times) < num_servers:
                    service_duration = self._service_time(rng, service_distribution, service_rate, service_time)
                    total_wait += 0.0
                    total_system += service_duration
                    total_service += service_duration
                    served_count += 1
                    busy_end_times.append(t + service_duration)
                else:
                    queue.append(t)
                    max_queue_length = max(max_queue_length, len(queue))

                next_arrival = t + rng.expovariate(arrival_rate)
            else:
                # Departure
                busy_end_times.remove(next_departure)
                if queue:
                    arrival_time = queue.popleft()
                    wait_time = t - arrival_time
                    service_duration = self._service_time(rng, service_distribution, service_rate, service_time)
                    total_wait += wait_time
                    total_system += wait_time + service_duration
                    total_service += service_duration
                    served_count += 1
                    busy_end_times.append(t + service_duration)

        avg_queue_length = area_queue / max_time if max_time > 0 else 0.0
        avg_waiting_time = total_wait / served_count if served_count > 0 else 0.0
        avg_system_time = total_system / served_count if served_count > 0 else 0.0
        server_utilization = total_service / (num_servers * max_time) if max_time > 0 else 0.0

        return {
            'avg_queue_length': avg_queue_length,
            'avg_waiting_time': avg_waiting_time,
            'avg_system_time': avg_system_time,
            'server_utilization': server_utilization,
            'max_queue_length': max_queue_length,
            'served_count': served_count
        }

    def _log_audit(self, request, action, message, *, level='info', scenario=None, result=None, metadata=None):
        try:
            SimulationAuditLog.objects.create(
                action=action,
                level=level,
                message=message,
                metadata=metadata or {},
                user=request.user if getattr(request, 'user', None) and request.user.is_authenticated else None,
                scenario=scenario,
                result=result,
            )
        except Exception:
            # Audit logging failures must not break simulation flows.
            pass

    def _estimate_mm_c(self, params):
        arrival_rate = params.get('arrival_rate')
        service_distribution = params.get('service_distribution', 'exponential')
        service_rate = params.get('service_rate')
        service_time = params.get('service_time')
        num_servers = int(params.get('num_servers', 1))
        simulation_hours = float(params.get('simulation_hours', 8))

        if arrival_rate is None or arrival_rate <= 0:
            raise ValueError('arrival_rate must be greater than 0')
        if service_distribution == 'fixed':
            if service_time is None or service_time <= 0:
                raise ValueError('service_time must be greater than 0 for fixed distribution')
            service_rate = 1.0 / service_time
        if service_rate is None or service_rate <= 0:
            raise ValueError('service_rate must be greater than 0')
        if num_servers < 1:
            raise ValueError('num_servers must be at least 1')

        capacity = num_servers * service_rate
        if arrival_rate >= capacity:
            raise ValueError('System is unstable: arrival_rate must be less than num_servers * service_rate')

        a = arrival_rate / service_rate
        rho = arrival_rate / capacity

        # Compute P0 for M/M/c
        sum_terms = 0.0
        for k in range(num_servers):
            sum_terms += (a ** k) / self._factorial(k)
        last_term = (a ** num_servers) / (self._factorial(num_servers) * (1 - rho))
        p0 = 1.0 / (sum_terms + last_term)

        # Erlang C formula for Lq
        lq = (p0 * (a ** num_servers) * rho) / (self._factorial(num_servers) * (1 - rho) ** 2)
        wq = lq / arrival_rate
        w = wq + 1.0 / service_rate
        l = arrival_rate * w

        served_count = arrival_rate * simulation_hours

        return {
            'avg_queue_length': lq,
            'avg_waiting_time': wq,
            'avg_system_time': w,
            'server_utilization': rho,
            'max_queue_length': 0,
            'served_count': served_count
        }

    @staticmethod
    def _factorial(n):
        result = 1
        for i in range(2, n + 1):
            result *= i
        return result

    def _category_filter(self, simulation_type, include_legacy=False):
        if not simulation_type:
            return Q()

        typed_filter = Q(scenario__parameters__simulation_type=simulation_type)
        if not include_legacy:
            return typed_filter

        keywords = self.HISTORY_TYPE_KEYWORDS.get(simulation_type, [])
        if not keywords:
            return typed_filter

        keyword_filter = Q()
        for keyword in keywords:
            keyword_filter |= Q(scenario__name__icontains=keyword)
            keyword_filter |= Q(scenario__description__icontains=keyword)

        legacy_filter = (
            Q(scenario__parameters__simulation_type__isnull=True)
            | Q(scenario__parameters__simulation_type='')
        )

        return typed_filter | (legacy_filter & keyword_filter)

    def _prune_history_for_category(self, simulation_type):
        """Keep only the most recent N runs per simulation category."""
        if not simulation_type:
            return

        category_runs = SimulationResult.objects.filter(
            self._category_filter(simulation_type, include_legacy=True)
        ).order_by('-run_date', '-id')

        stale_run_ids = list(
            category_runs.values_list('id', flat=True)[self.HISTORY_RETENTION_PER_CATEGORY:]
        )
        if stale_run_ids:
            SimulationResult.objects.filter(id__in=stale_run_ids).delete()
    
    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        """Run the simulation and generate results."""
        scenario = self.get_object()

        params = scenario.parameters or {}
        run_mode = request.data.get('mode', 'simulate')
        num_replications = request.data.get('num_replications') or scenario.num_replications or 1000

        try:
            num_replications = int(num_replications)
        except (ValueError, TypeError):
            self._log_audit(
                request,
                action='run_failed',
                level='error',
                scenario=scenario,
                message='Simulation run rejected due to invalid num_replications',
                metadata={'num_replications': request.data.get('num_replications')},
            )
            return Response({'error': 'num_replications must be an integer'}, status=status.HTTP_400_BAD_REQUEST)

        if num_replications < 100:
            num_replications = 100

        self._log_audit(
            request,
            action='run_started',
            scenario=scenario,
            message='Simulation run started',
            metadata={'mode': run_mode, 'num_replications': num_replications},
        )

        if run_mode == 'estimate':
            try:
                aggregated = self._estimate_mm_c(params)
            except ValueError as exc:
                self._log_audit(
                    request,
                    action='run_failed',
                    level='error',
                    scenario=scenario,
                    message='Simulation estimate failed',
                    metadata={'error': str(exc), 'mode': run_mode},
                )
                return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
            aggregated['num_replications'] = 0
            result = SimulationResult.objects.create(
                scenario=scenario,
                metrics=aggregated,
                raw_data={'mode': 'estimate'}
            )
            self._log_audit(
                request,
                action='run_succeeded',
                scenario=scenario,
                result=result,
                message='Simulation estimate completed successfully',
                metadata={'mode': run_mode},
            )
            self._prune_history_for_category(params.get('simulation_type'))
            return Response(
                SimulationResultSerializer(result).data,
                status=status.HTTP_201_CREATED
            )

        metrics_list = []
        for rep in range(num_replications):
            rep_params = dict(params)
            # Different seed per replication if provided
            if rep_params.get('seed') is not None:
                try:
                    rep_params['seed'] = int(rep_params['seed']) + rep
                except (ValueError, TypeError):
                    rep_params['seed'] = None
            try:
                metrics_list.append(self._simulate_replication(rep_params))
            except ValueError as exc:
                self._log_audit(
                    request,
                    action='run_failed',
                    level='error',
                    scenario=scenario,
                    message='Simulation run failed while computing replications',
                    metadata={'error': str(exc), 'mode': run_mode},
                )
                return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        # Aggregate metrics
        def avg(key):
            return sum(m[key] for m in metrics_list) / len(metrics_list)

        aggregated = {
            'avg_queue_length': avg('avg_queue_length'),
            'avg_waiting_time': avg('avg_waiting_time'),
            'avg_system_time': avg('avg_system_time'),
            'server_utilization': avg('server_utilization'),
            'max_queue_length': max(m['max_queue_length'] for m in metrics_list),
            'served_count_avg': avg('served_count'),
            'num_replications': num_replications
        }

        result = SimulationResult.objects.create(
            scenario=scenario,
            metrics=aggregated,
            raw_data={'replications': metrics_list[:100]}
        )
        self._log_audit(
            request,
            action='run_succeeded',
            scenario=scenario,
            result=result,
            message='Simulation run completed successfully',
            metadata={'mode': run_mode, 'num_replications': num_replications},
        )
        self._prune_history_for_category(params.get('simulation_type'))
        
        return Response(
            SimulationResultSerializer(result).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get all results for a simulation scenario."""
        scenario = self.get_object()
        results = scenario.simulationresult_set.all()
        serializer = SimulationResultSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get recent simulation runs across scenarios."""
        limit = request.query_params.get('limit', 50)
        simulation_type = request.query_params.get('simulation_type')
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            return Response({'error': 'limit must be an integer'}, status=status.HTTP_400_BAD_REQUEST)

        limit = max(1, min(limit, 200))
        if simulation_type:
            self._prune_history_for_category(simulation_type)

        runs = SimulationResult.objects.select_related('scenario')
        if simulation_type:
            runs = runs.filter(self._category_filter(simulation_type, include_legacy=True))
        runs = runs.order_by('-run_date', '-id')[:limit]

        payload = []
        for run in runs:
            scenario = run.scenario
            payload.append({
                'id': run.id,
                'scenario': scenario.id,
                'scenario_name': scenario.name,
                'scenario_description': scenario.description,
                'scenario_created_at': scenario.created_at,
                'run_date': run.run_date,
                'metrics': run.metrics,
                'raw_data': run.raw_data,
                'parameters': scenario.parameters,
                'num_replications': scenario.num_replications,
            })

        return Response(payload)

    @action(detail=False, methods=['get'])
    def audit_logs(self, request):
        """List recent simulation audit logs."""
        limit = request.query_params.get('limit', 100)
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            return Response({'error': 'limit must be an integer'}, status=status.HTTP_400_BAD_REQUEST)

        limit = max(1, min(limit, 500))
        queryset = SimulationAuditLog.objects.select_related('scenario', 'result').all()[:limit]
        serializer = SimulationAuditLogSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def backup(self, request):
        """Export simulation scenarios/results as a JSON backup payload."""
        include_raw = str(request.query_params.get('include_raw', '0')).lower() in {'1', 'true', 'yes'}

        scenarios = []
        scenario_qs = SimulationScenario.objects.order_by('-created_at')
        for scenario in scenario_qs:
            scenarios.append({
                'id': scenario.id,
                'name': scenario.name,
                'description': scenario.description,
                'parameters': scenario.parameters,
                'num_replications': scenario.num_replications,
                'created_at': scenario.created_at,
            })

        results = []
        result_qs = SimulationResult.objects.select_related('scenario').order_by('-run_date')
        for result in result_qs:
            payload = {
                'id': result.id,
                'scenario_id': result.scenario_id,
                'scenario_name': result.scenario.name,
                'run_date': result.run_date,
                'metrics': result.metrics,
            }
            if include_raw:
                payload['raw_data'] = result.raw_data
            results.append(payload)

        logs = SimulationAuditLog.objects.order_by('-created_at')[:200]
        audit_logs = SimulationAuditLogSerializer(logs, many=True).data

        self._log_audit(
            request,
            action='backup_exported',
            message='Simulation backup exported',
            metadata={
                'include_raw': include_raw,
                'scenario_count': len(scenarios),
                'result_count': len(results),
            },
        )

        return Response({
            'exported_at': datetime.utcnow().isoformat() + 'Z',
            'include_raw': include_raw,
            'scenarios': scenarios,
            'results': results,
            'audit_logs': audit_logs,
        })

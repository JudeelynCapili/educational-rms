"""Views for simulation app."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SimulationScenario, SimulationResult
from .serializers import SimulationScenarioSerializer, SimulationResultSerializer


class SimulationViewSet(viewsets.ModelViewSet):
    """ViewSet for Simulation management."""
    
    serializer_class = SimulationScenarioSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['created_at']
    ordering_fields = ['created_at', 'name']
    
    def get_queryset(self):
        """Get all simulations."""
        return SimulationScenario.objects.all()
    
    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        """Run the simulation and generate results."""
        scenario = self.get_object()
        
        # Placeholder for simulation engine
        result = SimulationResult.objects.create(
            scenario=scenario,
            metrics={
                'avg_queue_length': 2.5,
                'avg_waiting_time': 15.0,
                'avg_system_time': 20.0,
                'server_utilization': 0.75,
                'max_queue_length': 10,
            },
            raw_data={'status': 'completed'}
        )
        
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

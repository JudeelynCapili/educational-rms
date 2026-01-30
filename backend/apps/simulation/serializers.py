"""Serializers for simulation app."""
from rest_framework import serializers
from .models import SimulationScenario, SimulationResult


class SimulationScenarioSerializer(serializers.ModelSerializer):
    """Serializer for SimulationScenario."""
    
    class Meta:
        model = SimulationScenario
        fields = [
            'id', 'name', 'description', 'arrival_rate',
            'service_rate', 'num_servers', 'simulation_hours',
            'num_replications', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SimulationResultSerializer(serializers.ModelSerializer):
    """Serializer for SimulationResult."""
    
    class Meta:
        model = SimulationResult
        fields = [
            'id', 'scenario', 'avg_queue_length', 'avg_waiting_time',
            'avg_system_time', 'server_utilization', 'max_queue_length',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

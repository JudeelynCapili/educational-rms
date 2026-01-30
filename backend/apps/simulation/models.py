from django.db import models
import json

class SimulationScenario(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    parameters = models.JSONField()  # arrival_rate, service_rate, etc.
    num_replications = models.IntegerField(default=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class SimulationResult(models.Model):
    scenario = models.ForeignKey(SimulationScenario, on_delete=models.CASCADE)
    run_date = models.DateTimeField(auto_now_add=True)
    metrics = models.JSONField()  # avg_waiting_time, utilization, etc.
    raw_data = models.JSONField(blank=True, null=True)
    
    def __str__(self):
        return f"Result for {self.scenario.name} - {self.run_date}"
import os
import random
from locust import HttpUser, task, between

samples_path = os.path.join(os.path.dirname(__file__), "..", "fixtures", "samples.txt")
with open(samples_path, "r", encoding="utf-8") as f:
    project_urls = [line.strip() for line in f if line.strip()]

class ProjectAnalyzer(HttpUser):
    wait_time = between(1, 2)

    @task
    def analyze_project_by_url(self):
        url = random.choice(project_urls)

        self.client.post(
            "/api/analyses",
            params={"project_url": url},
            name="/api/analyses (URL Upload)"
        )
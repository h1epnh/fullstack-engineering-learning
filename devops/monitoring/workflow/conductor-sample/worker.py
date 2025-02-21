from conductor.client.configuration.configuration import Configuration
from conductor.client.worker.worker import Worker
from datetime import datetime

# Define the execute functions separately
def greet_task_execute(task):
    name = task.input_data.get('name', 'User')
    return Worker.task_result_with_output({'message': f'Hello, {name}!'})

def format_task_execute(task):
    greeting = task.input_data.get('greeting', 'Hello!')
    return Worker.task_result_with_output({'formattedMessage': f'{greeting} - {datetime.now().isoformat()}'})

# Configuration
config = Configuration(server_api_url='http://localhost:8080/api')

# Workers with execute_function
workers = [
    Worker(task_definition_name='greet_task', execute_function=greet_task_execute),
    Worker(task_definition_name='format_task', execute_function=format_task_execute)
]

from conductor.client.worker.worker_task import WorkerTaskRunner

runner = WorkerTaskRunner(workers=workers, config=config)
runner.start()
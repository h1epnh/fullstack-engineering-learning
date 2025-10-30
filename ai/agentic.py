import openai

client = openai.OpenAI(
    api_key="any-value",
    base_url="http://localhost:1234/v1"
)

response = client.chat.completions.create(
    model="openai/gpt-oss-20b", # use the model name you loaded
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "tell me gold price in vietnam today"}
    ],
    temperature=0.7,
    max_tokens=1000
)

print(response.choices[0].message.content)
# imports
import os
from agno.agent import Agent
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.memory.v2.memory import Memory
from agno.models.google import Gemini
from rich.pretty import pprint

# User Name
user_id = "data_scientist"

# Creating a memory database
memory = Memory(
    db=SqliteMemoryDb(table_name="memory", 
                      db_file="tmp/memory.db"),
    model=Gemini(id="gemini-2.0-flash", 
                 api_key=os.environ.get("GEMINI_API_KEY"))
                 )

# Clear the memory before start
memory.clear()

# Create the agent
agent = Agent(
    model=Gemini(id="gemini-2.0-flash", api_key=os.environ.get("GEMINI_API_KEY")),
    user_id=user_id,
    memory=memory,
    # Enable the Agent to dynamically create and manage user memories
    enable_agentic_memory=True,
    add_datetime_to_instructions=True,
    markdown=True,
)


# Run the code
if __name__ == "__main__":
    agent.print_response("My name is Gustavo and I am a Data Scientist learning about AI Agents.")
    memories = memory.get_user_memories(user_id=user_id)
    print(f"Memories about {user_id}:")
    pprint(memories)
    agent.print_response("What topic should I study about?")
    agent.print_response("I write articles for Towards Data Science.")
    print(f"Memories about {user_id}:")
    pprint(memories)
    agent.print_response("Where should I post my next article?")
import json
import sys

# Load collection
with open('postman/infoware-construction-erp.postman_collection.json', 'r') as f:
    collection = json.load(f)

# Add missing variables
vars_to_add = [
    {"key": "projectTaskId", "value": "00000000-0000-0000-0000-000000000000", "type": "string"},
    {"key": "projectTaskDelayId", "value": "00000000-0000-0000-0000-000000000000", "type": "string"},
]

existing_keys = [v["key"] for v in collection["variable"]]
for var in vars_to_add:
    if var["key"] not in existing_keys:
        collection["variable"].append(var)
        print(f"Added variable: {var['key']}")

# Helper functions
def create_request(name, method, path, query_params=None, body=None, auth_token="{{userAccessToken}}"):
    request = {
        "name": name,
        "request": {
            "auth": {
                "type": "bearer",
                "bearer": [
                    {"key": "token", "value": auth_token, "type": "string"}
                ]
            },
            "method": method,
            "header": [
                {"key": "Content-Type", "value": "application/json"},
                {"key": "language", "value": "{{language}}"}
            ],
            "url": {
                "raw": f"{{{{baseUrl}}}}{path}",
                "host": ["{{baseUrl}}"],
                "path": path.split('/')[1:],
                "query": query_params or []
            }
        }
    }
    
    if body:
        request["request"]["body"] = {
            "mode": "raw",
            "raw": body,
            "options": {"raw": {"language": "json"}}
        }
    
    return request

# Create User Project Stages folder
user_project_stages_item = {
    "name": "User Project Stages",
    "item": [
        create_request(
            "Create Project Stage",
            "POST",
            "/api/user/project-stages?projectId={{projectId}}&language={{language}}",
            body='{\n  "stageName": {\n    "en": "Planning Phase"\n  },\n  "stageSequence": 1,\n  "description": {\n    "en": "Initial planning stage"\n  }\n}'
        ),
        create_request(
            "List Project Stages",
            "GET",
            "/api/user/project-stages?projectId={{projectId}}&language={{language}}&searchKey=&page=1&limit=10"
        ),
        create_request(
            "Get Project Stage",
            "GET",
            "/api/user/project-stages/{{projectStageId}}?language={{language}}"
        ),
        create_request(
            "Update Project Stage",
            "PUT",
            "/api/user/project-stages/{{projectStageId}}?language={{language}}",
            body='{\n  "stageName": {\n    "en": "Updated Planning Phase"\n  },\n  "stageSequence": 1,\n  "description": {\n    "en": "Updated description"\n  }\n}'
        ),
        create_request(
            "Delete Project Stage",
            "DELETE",
            "/api/user/project-stages/{{projectStageId}}?language={{language}}"
        ),
    ]
}

# Create User Project Tasks folder
user_project_tasks_item = {
    "name": "User Project Tasks",
    "item": [
        create_request(
            "Create Project Task",
            "POST",
            "/api/user/project-tasks?projectId={{projectId}}&stageId={{projectStageId}}&language={{language}}",
            body='{\n  "taskName": {\n    "en": "Task 1"\n  },\n  "description": {\n    "en": "Task description"\n  },\n  "priority": "HIGH",\n  "assignedTo": "{{targetUserId}}",\n  "startDate": "2024-01-15",\n  "endDate": "2024-01-20",\n  "status": "TODO"\n}'
        ),
        create_request(
            "List Project Tasks",
            "GET",
            "/api/user/project-tasks?projectId={{projectId}}&stageId={{projectStageId}}&language={{language}}&searchKey=&page=1&limit=10"
        ),
        create_request(
            "Get Project Task",
            "GET",
            "/api/user/project-tasks/{{projectTaskId}}?language={{language}}"
        ),
        create_request(
            "Update Project Task",
            "PUT",
            "/api/user/project-tasks/{{projectTaskId}}?language={{language}}",
            body='{\n  "taskName": {\n    "en": "Updated Task 1"\n  },\n  "description": {\n    "en": "Updated description"\n  },\n  "priority": "MEDIUM",\n  "assignedTo": "{{targetUserId}}",\n  "startDate": "2024-01-15",\n  "endDate": "2024-01-22",\n  "status": "IN_PROGRESS"\n}'
        ),
        create_request(
            "Delete Project Task",
            "DELETE",
            "/api/user/project-tasks/{{projectTaskId}}?language={{language}}"
        ),
    ]
}

# Create User Project Task Delays folder
user_project_task_delays_item = {
    "name": "User Project Task Delays",
    "item": [
        create_request(
            "Create Project Task Delay",
            "POST",
            "/api/user/project-task-delays?projectId={{projectId}}&stageId={{projectStageId}}&taskId={{projectTaskId}}&language={{language}}",
            body='{\n  "reason": {\n    "en": "Material unavailable"\n  },\n  "requestedDelay": 5,\n  "approvalStatus": "PENDING"\n}'
        ),
        create_request(
            "List Project Task Delays",
            "GET",
            "/api/user/project-task-delays?projectId={{projectId}}&stageId={{projectStageId}}&taskId={{projectTaskId}}&language={{language}}&searchKey=&page=1&limit=10"
        ),
        create_request(
            "Get Project Task Delay",
            "GET",
            "/api/user/project-task-delays/{{projectTaskDelayId}}?language={{language}}"
        ),
        create_request(
            "Update Project Task Delay",
            "PUT",
            "/api/user/project-task-delays/{{projectTaskDelayId}}?language={{language}}",
            body='{\n  "reason": {\n    "en": "Updated reason: Weather delay"\n  },\n  "requestedDelay": 7,\n  "approvalStatus": "PENDING"\n}'
        ),
        create_request(
            "Delete Project Task Delay",
            "DELETE",
            "/api/user/project-task-delays/{{projectTaskDelayId}}?language={{language}}"
        ),
    ]
}

# Add new items to collection
# Find where to insert (after User Auth, before other domain items)
user_auth_index = None
for i, item in enumerate(collection["item"]):
    if item["name"] == "User Auth":
        user_auth_index = i
        break

if user_auth_index is not None:
    # Insert after User Auth
    collection["item"].insert(user_auth_index + 1, user_project_stages_item)
    collection["item"].insert(user_auth_index + 2, user_project_tasks_item)
    collection["item"].insert(user_auth_index + 3, user_project_task_delays_item)
    print("Added three user feature items after User Auth")
else:
    print("WARNING: User Auth not found, appending to end")
    collection["item"].append(user_project_stages_item)
    collection["item"].append(user_project_tasks_item)
    collection["item"].append(user_project_task_delays_item)

# Update collection description
collection["info"]["description"] = "Organized Postman collection with one top-level folder per module. Requests are named in CRUD style and use collection variables for base URL, tokens, and reusable IDs. Includes User Project Stages, Tasks, and Task Delays endpoints."

# Save updated collection
with open('postman/infoware-construction-erp.postman_collection.json', 'w') as f:
    json.dump(collection, f, indent=2, ensure_ascii=False)

print(f"Successfully updated collection!")
print(f"Total items: {len(collection['item'])}")
print(f"Total variables: {len(collection['variable'])}")

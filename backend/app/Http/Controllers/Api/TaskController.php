<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use Exception;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    private function userRoleInProject(Project $project, int $userId): string|null
    {
        if ($project->owner_id === $userId) return 'owner';

        $member = $project->members()
            ->where('user_id', $userId)
            ->first();

        return $member?->pivot?->role ?? null;
    }

    public function index(Request $request, Project $project)
    {
        $role = $this->userRoleInProject($project, $request->user()->id);

        if (!$role) {
            return response()->json(['message' => 'You are not a member of this project.'], 403);
        }

        $tasks = $project->tasks()
            ->with(['assignee:id,name,email', 'creator:id,name,email'])
            ->get();

        return response()->json([
            'tasks'    => $tasks,
            'progress' => $project->progress,
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $role = $this->userRoleInProject($project, $request->user()->id);

        if (!in_array($role, ['owner', 'manager'])) {
            return response()->json(['message' => 'Only the project owner or manager can create tasks.'], 403);
        }

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'required|integer|exists:users,id',
        ]);

        $isAssigneeMember = $project->members()
            ->where('user_id', $validated['assigned_to'])
            ->exists();

        $isAssigneeOwner = $project->owner_id === $validated['assigned_to'];

        if (!$isAssigneeMember && !$isAssigneeOwner) {
            return response()->json([
                'message' => 'The assigned user is not a member of this project.',
            ], 422);
        }

        $task = Task::create([
            'project_id'  => $project->id,
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status'      => 'todo',
            'assigned_to' => $validated['assigned_to'],
            'created_by'  => $request->user()->id,
        ]);

        $task->load(['assignee:id,name,email', 'creator:id,name,email']);

        return response()->json(['task' => $task], 201);
    }

    public function updateStatus(Request $request, Project $project, Task $task)
    {
        if ($task->project_id !== $project->id) {
            return response()->json(['message' => 'Task does not belong to this project.'], 404);
        }

        if ($task->assigned_to !== $request->user()->id) {
            return response()->json(['message' => 'You can only update tasks assigned to you.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:todo,in_progress,done',
        ]);

        $task->update(['status' => $validated['status']]);

        return response()->json([
            'task'     => $task->fresh(['assignee:id,name,email', 'creator:id,name,email']),
            'progress' => $project->progress,
        ]);
    }

    public function myTasks(string $id){
        try{
            $mytasks = Task::where('assigned_to', $id)->with('project:id,name')->get();

            return response()->json([
                'mytasks' => $mytasks
            ], 200);

        }catch(Exception $e){
            return response()->json([
                'message' => 'Unable to get tasks data',
                'error' => $e->getMessage()
            ], 500);
        }   
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Exception;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $ownedProjects = Project::where('owner_id', $user->id)
            ->withCount('members')
            ->with('owner')
            ->get();

        $sharedProjects = $user->projects()
            ->withCount('members')
            ->with('owner')
            ->get();

        return response()->json([
            'owned' => $ownedProjects,
            'shared' => $sharedProjects,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'in:active,completed,on_hold',
        ]);

        $project = Project::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'active',
            'owner_id' => $request->user()->id,
        ]);

        return response()->json([
            'project' => $project,
        ], 201);
    }

    public function update(Request $request, string $id){
        try{
            Project::where('id', $id)->update([
                'name' => $request->name,
                'description' => $request->description,
                'status' => $request->status,
            ]);

            return response()->json([
                'message' =>'ok'
            ], 200);

        }catch(Exception $e){
            return response()->json([
                'message' => 'Unable to update project data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, Project $project)
    {
        $project->load([
            'owner',
            'members' => function ($query) {
                $query->select('users.id', 'users.name', 'users.email')
                    ->withPivot('role');
            },
        ]);

        return response()->json([
            'project' => $project,
        ]);
    }

    public function addMember(Request $request, Project $project)
    {
        if ($project->owner_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Only the project owner can add members.',
            ], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'role'    => 'required|in:manager,member',
        ]);

        if ($validated['user_id'] === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot add yourself as a member.',
            ], 422);
        }

        $alreadyMember = $project->members()
            ->where('user_id', $validated['user_id'])
            ->exists();

        if ($alreadyMember) {
            return response()->json([
                'message' => 'This user is already a member of the project.',
            ], 422);
        }

        $project->members()->attach($validated['user_id'], [
            'role' => $validated['role'],
        ]);

        $project->load([
            'members' => function ($query) {
                $query->select('users.id', 'users.name', 'users.email')
                    ->withPivot('role');
            },
        ]);

        return response()->json([
            'message' => 'Member added successfully.',
            'members' => $project->members,
        ], 201);
    }
}

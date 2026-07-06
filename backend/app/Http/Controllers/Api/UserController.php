<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $users = User::where('role', 'user')->get();

            return response()->json([
                'users' => $users
            ], 200);

        }catch(Exception $e){
            return response()->json([
                'message' => 'Unable to get users data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try{
            User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password,
                'role' => $request->role
            ]);

            return response()->json([
                'message' => 'ok'
            ], 200);

        }catch(Exception $e){
            return response()->json([
                'message' => 'Unable to process data',
                'error' => $e->getMessage()
            ], 200);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try{
            $data = User::where('id', $id)->first();

            return response()->json([
                'data' => $data
            ], 200);

        }catch(Exception $e){
            return response()->json([
                'message' => 'Unable to get user data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
            User::where('id', $id)->update([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password,
                'role' => $request->role
            ]);

            return response()->json([
                'message' => 'ok'
            ], 200);

        }catch(Exception $e){
            return response()->json([
                'message' => 'Unable to update user information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try{
            User::where('id', $id)->delete();

            return response()->json([
                'message' => 'ok'
            ], 200);
        }catch(Exception $e){
            return response()->json([
                'message' => 'Unable to delete data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function search(Request $request)
    {
        $query = $request->query('q', '');

        if (strlen(trim($query)) < 2) {
            return response()->json(['users' => []]);
        }

        $users = User::where('id', '!=', $request->user()->id)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->select('id', 'name', 'email', 'role')
            ->limit(8)
            ->get();

        return response()->json(['users' => $users]);
    }

}

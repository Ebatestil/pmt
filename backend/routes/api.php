<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    //projects
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::post('/project/update', [ProjectController::class, 'update']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);
    Route::post('/projects/{project}/members', [ProjectController::class, 'addMember']);
    Route::get('/projects/{project}/tasks', [TaskController::class, 'index']);
    Route::post('/projects/{project}/tasks', [TaskController::class, 'store']);
    Route::patch('/projects/{project}/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    
    //tasks
    Route::get('/tasks/{id}', [TaskController::class, 'myTasks']);

    //users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/user/{id}', [UserController::class, 'show']);
    Route::post('/user/store', [UserController::class, 'store']);
    Route::post('/user/update', [UserController::class, 'update']);
    Route::get('/users/search', [UserController::class, 'search']);
});
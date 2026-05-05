<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityComment;
use App\Http\Requests\StoreCommentRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class CommentController extends Controller
{
    public function store(StoreCommentRequest $request, Activity $activity)
    {
        // El Policy recibe la actividad para verificar permisos de acceso
        Gate::authorize('create', [ActivityComment::class, $activity]);

        DB::transaction(function () use ($request, $activity) {
            // 1. Crear comentario
            $activity->comments()->create([
                'user_id' => auth()->id(),
                'organization_id' => auth()->user()->organization_id,
                'body' => $request->body,
                'is_internal' => $request->is_internal ?? false,
            ]);

//            // 2. Registrar en historial (Objetivo 7 del contexto general)
//            $activity->histories()->create([
//                'organization_id' => auth()->user()->organization_id,
//                'user_id' => auth()->id(),
//                'type' => 'comment_added',
//                'description' => 'Agregó un nuevo comentario a la actividad.',
//            ]);
        });

        return redirect()->back()->with('success', 'Comentario añadido.');
    }
}

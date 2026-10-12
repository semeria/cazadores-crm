<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ClientController extends Controller
{
    public function search(Request $request)
    {
        Gate::authorize('viewAny', Client::class);

        $validated = $request->validate([
            'q' => 'required|string|min:2|max:100',
        ]);

        $search = $validated['q'];
        $organizationId = $request->user()->organization_id;

        $clients = Client::query()
            ->where('organization_id', $organizationId)
            ->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->limit(15)
            ->get(['id', 'name', 'email', 'phone', 'address']);

        return response()->json(['clients' => $clients]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuoteRequest;
use App\Http\Requests\UpdateQuoteRequest;
use App\Models\OrganizationQuoteSetting;
use App\Models\Quote;
use App\Services\QuoteService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class QuoteController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Quote::class);

        $filters = $request->validate([
            'search' => 'nullable|string|max:100',
        ]);

        $user = $request->user();
        $quotes = Quote::query()
            ->where('organization_id', $user->organization_id)
            ->when(! $user->isOwner(), fn ($query) => $query->where('created_by', $user->id))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($subquery) use ($search) {
                    $subquery->where('quote_number', 'like', "%{$search}%")
                        ->orWhere('recipient_name', 'like', "%{$search}%");
                });
            })
            ->with('creator:id,name')
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Quotes/Index', [
            'quotes' => $quotes,
            'filters' => $filters,
            'canConfigure' => $user->isOwner(),
        ]);
    }

    public function create(Request $request)
    {
        Gate::authorize('create', Quote::class);

        $settings = OrganizationQuoteSetting::query()
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        return Inertia::render('Quotes/Create', [
            'folioSettings' => [
                'prefix' => $settings?->quote_prefix ?? 'COT-',
                'number_padding' => $settings?->number_padding ?? 6,
            ],
        ]);
    }

    public function store(StoreQuoteRequest $request, QuoteService $quoteService)
    {
        Gate::authorize('create', Quote::class);

        $quote = $quoteService->create($request->user(), $request->validated());

        return redirect()->route('quotes.show', $quote)->with('success', 'Cotización creada correctamente.');
    }

    public function show(Quote $quote)
    {
        Gate::authorize('view', $quote);

        $quote->load(['items', 'creator:id,name', 'organization:id,name']);
        $settings = OrganizationQuoteSetting::query()
            ->where('organization_id', $quote->organization_id)
            ->first();

        return Inertia::render('Quotes/Show', [
            'quote' => $quote,
            'logoUrl' => $settings?->logo_path ? route('quotes.organization-logo') : null,
        ]);
    }

    public function edit(Quote $quote)
    {
        Gate::authorize('update', $quote);

        return Inertia::render('Quotes/Edit', [
            'quote' => $quote->load(['items', 'client']),
        ]);
    }

    public function update(UpdateQuoteRequest $request, Quote $quote, QuoteService $quoteService)
    {
        Gate::authorize('update', $quote);
        $quoteService->update($quote, $request->validated());

        return redirect()->route('quotes.show', $quote)->with('success', 'Cotización actualizada correctamente.');
    }

    public function pdf(Quote $quote)
    {
        Gate::authorize('view', $quote);

        return $this->renderPdf($quote)->download($this->pdfFileName($quote));
    }

    public function pdfPreview(Quote $quote)
    {
        Gate::authorize('view', $quote);

        return $this->renderPdf($quote)->stream($this->pdfFileName($quote));
    }

    private function renderPdf(Quote $quote)
    {
        $quote->load(['items', 'creator:id,name', 'organization:id,name']);
        $settings = OrganizationQuoteSetting::query()
            ->where('organization_id', $quote->organization_id)
            ->first();
        $logoDataUri = $this->logoDataUri($settings?->logo_path);

        $pdf = Pdf::loadView('pdf.quotes.show', [
            'quote' => $quote,
            'logoDataUri' => $logoDataUri,
        ])->setPaper('a4', 'portrait')->setOptions([
            'defaultFont' => 'DejaVu Sans',
            'isRemoteEnabled' => false,
        ]);

        return $pdf;
    }

    private function pdfFileName(Quote $quote): string
    {
        $safeFolio = preg_replace('/[^A-Za-z0-9._-]+/', '-', $quote->quote_number) ?: (string) $quote->id;

        return "cotizacion-{$safeFolio}.pdf";
    }

    public function destroy(Quote $quote)
    {
        Gate::authorize('delete', $quote);

        $quoteNumber = $quote->quote_number;
        $quote->delete();

        return redirect()->route('quotes.index')->with('success', "Cotización {$quoteNumber} eliminada permanentemente.");
    }

    private function logoDataUri(?string $logoPath): ?string
    {
        if (! $logoPath || ! Storage::disk('local')->exists($logoPath)) {
            return null;
        }

        $image = @imagecreatefromstring(Storage::disk('local')->get($logoPath));
        if (! $image) {
            return null;
        }

        ob_start();
        imagepng($image);
        $png = ob_get_clean();
        imagedestroy($image);

        return $png === false ? null : 'data:image/png;base64,'.base64_encode($png);
    }
}

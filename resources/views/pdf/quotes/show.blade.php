<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Cotización {{ $quote->quote_number }}</title>
    <style>
        @page {
            margin: 34px 42px 62px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            color: #1e293b;
            font-family: "DejaVu Sans", sans-serif;
            font-size: 10px;
            line-height: 1.45;
        }

        .header {
            border-bottom: 2px solid #f59e0b;
            margin-bottom: 24px;
            padding-bottom: 18px;
            width: 100%;
        }

        .header-table,
        .items-table,
        .totals-table {
            border-collapse: collapse;
            width: 100%;
        }

        .header-table td {
            vertical-align: top;
            width: 50%;
        }

        .logo {
            max-height: 65px;
            max-width: 190px;
        }

        .organization-name {
            color: #0f172a;
            font-size: 15px;
            font-weight: bold;
            margin-top: 5px;
        }

        .quote-heading {
            color: #b45309;
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 2px;
            text-align: right;
            text-transform: uppercase;
        }

        .quote-number {
            color: #0f172a;
            font-size: 21px;
            font-weight: bold;
            margin-top: 5px;
            text-align: right;
        }

        .quote-meta {
            color: #64748b;
            font-size: 9px;
            margin-top: 4px;
            text-align: right;
        }

        .section-title {
            color: #64748b;
            font-size: 8px;
            font-weight: bold;
            letter-spacing: 1px;
            margin-bottom: 8px;
            text-transform: uppercase;
        }

        .recipient {
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 22px;
            padding-bottom: 18px;
        }

        .recipient-name {
            color: #0f172a;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 4px;
        }

        .muted {
            color: #64748b;
        }

        .items-table {
            margin-top: 8px;
        }

        .items-table thead {
            display: table-header-group;
        }

        .items-table th {
            background: #f8fafc;
            border-bottom: 1px solid #cbd5e1;
            color: #64748b;
            font-size: 8px;
            letter-spacing: .6px;
            padding: 10px 8px;
            text-align: left;
            text-transform: uppercase;
        }

        .items-table td {
            border-bottom: 1px solid #e2e8f0;
            padding: 11px 8px;
            vertical-align: top;
        }

        .items-table tr {
            page-break-inside: avoid;
        }

        .right {
            text-align: right !important;
        }

        .totals-table {
            margin-left: auto;
            margin-top: 18px;
            width: 245px;
        }

        .totals-table td {
            padding: 5px 0;
        }

        .total-row td {
            border-top: 1px solid #cbd5e1;
            color: #0f172a;
            font-size: 13px;
            font-weight: bold;
            padding-top: 10px;
        }

        .notes {
            border-top: 1px solid #e2e8f0;
            margin-top: 24px;
            padding-top: 14px;
        }

        .notes-content {
            white-space: pre-line;
        }

        .footer {
            bottom: -38px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 8px;
            height: 28px;
            left: 0;
            position: fixed;
            right: 0;
            padding-top: 8px;
            width: 100%;
        }

        .footer-table {
            border-collapse: collapse;
            width: 100%;
        }

        .footer-mark {
            background: #fef3c7;
            border-radius: 4px;
            color: #78350f;
            font-size: 8px;
            font-weight: bold;
            padding: 3px 5px;
        }

        .footer-jaeger {
            color: #334155;
            font-weight: bold;
        }

        .footer-system {
            color: #d97706;
            font-weight: bold;
        }

        .footer-page {
            color: #94a3b8;
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header">
        <table class="header-table">
            <tr>
                <td>
                    @if ($logoDataUri)
                        <img class="logo" src="{{ $logoDataUri }}" alt="Logo de {{ $quote->organization->name }}">
                    @endif
                    <div class="organization-name">{{ $quote->organization->name }}</div>
                </td>
                <td>
                    <div class="quote-heading">Cotización</div>
                    <div class="quote-number">{{ $quote->quote_number }}</div>
                    <div class="quote-meta">Emitida: {{ $quote->issued_at->format('d/m/Y') }}</div>
                    @if ($quote->valid_until)
                        <div class="quote-meta">Vigente hasta: {{ $quote->valid_until->format('d/m/Y') }}</div>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <div class="recipient">
        <div class="section-title">Preparada para</div>
        <div class="recipient-name">{{ $quote->recipient_name }}</div>
        @if ($quote->recipient_email)<div class="muted">{{ $quote->recipient_email }}</div>@endif
        @if ($quote->recipient_phone)<div class="muted">{{ $quote->recipient_phone }}</div>@endif
        @if ($quote->recipient_address)<div class="muted">{!! nl2br(e($quote->recipient_address)) !!}</div>@endif
    </div>

    <div class="section-title">Conceptos · {{ $quote->currency }}</div>
    <table class="items-table">
        <thead>
            <tr>
                <th>Concepto</th>
                <th class="right">Cantidad</th>
                <th class="right">Precio unitario</th>
                <th class="right">Importe</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($quote->items as $item)
                <tr>
                    <td>{{ $item->description }}</td>
                    <td class="right">{{ $item->quantity }}</td>
                    <td class="right">{{ $quote->currency }} {{ number_format((float) $item->unit_price, 2, '.', ',') }}</td>
                    <td class="right">{{ $quote->currency }} {{ number_format((float) $item->line_total, 2, '.', ',') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals-table">
        <tr>
            <td>Subtotal</td>
            <td class="right">{{ $quote->currency }} {{ number_format((float) $quote->subtotal, 2, '.', ',') }}</td>
        </tr>
        @if ((float) $quote->discount_amount > 0)
            <tr>
                <td>Descuento{{ $quote->discount_type === 'percent' ? ' ('.$quote->discount_value.'%)' : '' }}</td>
                <td class="right">- {{ $quote->currency }} {{ number_format((float) $quote->discount_amount, 2, '.', ',') }}</td>
            </tr>
        @endif
        <tr>
            <td>IVA ({{ $quote->tax_rate }}%)</td>
            <td class="right">{{ $quote->currency }} {{ number_format((float) $quote->tax_amount, 2, '.', ',') }}</td>
        </tr>
        <tr class="total-row">
            <td>Total</td>
            <td class="right">{{ $quote->currency }} {{ number_format((float) $quote->total, 2, '.', ',') }}</td>
        </tr>
    </table>

    @if ($quote->notes)
        <div class="notes">
            <div class="section-title">Notas y condiciones</div>
            <div class="notes-content">{{ $quote->notes }}</div>
        </div>
    @endif

    <div class="footer">
        <table class="footer-table">
            <tr>
                <td><span class="footer-mark">JS</span> &nbsp; Powered by <span class="footer-jaeger">Jaeger</span><span class="footer-system">System</span></td>
                <td class="footer-page">{{ $quote->currency }} · Cotización {{ $quote->quote_number }}</td>
            </tr>
        </table>
    </div>
</body>
</html>

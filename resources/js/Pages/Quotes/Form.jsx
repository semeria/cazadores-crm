import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/UI/Card';
import ClientPicker from '../../Components/Quotes/ClientPicker';

const todayLocal = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${today.getFullYear()}-${month}-${day}`;
};

const formatMoney = (amount, currency) => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
}).format(Number(amount) || 0);

export default function QuoteForm({ quote = null, folioSettings = null }) {
    const isEditing = Boolean(quote);
    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        folio_mode: 'auto',
        custom_folio: '',
        client_id: quote?.client_id || '',
        save_client: !quote,
        recipient_name: quote?.recipient_name || '',
        recipient_email: quote?.recipient_email || '',
        recipient_phone: quote?.recipient_phone || '',
        recipient_address: quote?.recipient_address || '',
        issued_at: quote?.issued_at || todayLocal(),
        valid_until: quote?.valid_until || '',
        currency: quote?.currency || 'MXN',
        discount_type: quote?.discount_type || 'none',
        discount_value: quote?.discount_value || '0.00',
        tax_rate: quote?.tax_rate || '0.00',
        items: quote?.items?.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
        })) || [{ description: '', quantity: '1.00', unit_price: '0.00' }],
        notes: quote?.notes || '',
    });
    const [selectedClient, setSelectedClient] = useState(quote?.client || null);
    const [clientSearch, setClientSearch] = useState('');
    const [clientResults, setClientResults] = useState([]);
    const [searchingClients, setSearchingClients] = useState(false);

    useEffect(() => {
        const query = clientSearch.trim();
        if (query.length < 2) {
            setClientResults([]);
            setSearchingClients(false);
            return undefined;
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(() => {
            setSearchingClients(true);
            axios.get('/clients/search', { params: { q: query }, signal: controller.signal })
                .then((response) => setClientResults(response.data.clients || []))
                .catch((error) => {
                    if (!axios.isCancel(error) && error.name !== 'CanceledError') {
                        setClientResults([]);
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) setSearchingClients(false);
                });
        }, 250);

        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [clientSearch]);

    const subtotal = data.items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)), 0);
    const discountValue = Number(data.discount_value) || 0;
    const discountAmount = data.discount_type === 'percent'
        ? subtotal * Math.min(discountValue, 100) / 100
        : data.discount_type === 'fixed' ? Math.min(subtotal, discountValue) : 0;
    const taxAmount = Math.max(0, subtotal - discountAmount) * (Number(data.tax_rate) || 0) / 100;
    const total = Math.max(0, subtotal - discountAmount) + taxAmount;

    const updateItem = (index, field, value) => {
        const items = data.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item);
        setData('items', items);
    };

    const selectClient = (client) => {
        setSelectedClient(client);
        setClientSearch('');
        setClientResults([]);
        clearErrors('client_id', 'recipient_email');
        setData({
            ...data,
            client_id: client.id,
            save_client: false,
            recipient_name: client.name || '',
            recipient_email: client.email || '',
            recipient_phone: client.phone || '',
            recipient_address: client.address || '',
        });
    };

    const clearSelectedClient = () => {
        setSelectedClient(null);
        setData({ ...data, client_id: '', save_client: false });
    };

    const submit = (event) => {
        event.preventDefault();

        const options = {
            onError: (validationErrors) => {
                if (validationErrors.recipient_email && data.save_client && data.recipient_email) {
                    setClientSearch(data.recipient_email);
                }
            },
        };

        if (isEditing) {
            put(`/quotes/${quote.id}`, options);
        } else {
            post('/quotes', options);
        }
    };

    const inputClass = 'mt-1 w-full rounded-lg border-slate-300 bg-white text-sm text-slate-900 focus:border-brand-500 focus:ring-brand-500 dark:border-slate-600 dark:bg-surface-900 dark:text-white';
    const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-200';

    return (
        <AuthenticatedLayout>
            <Head title={isEditing ? `Editar ${quote.quote_number}` : 'Nueva cotización'} />
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <Link href="/quotes" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-400">← Cotizaciones</Link>
                        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                            {isEditing ? `Editar ${quote.quote_number}` : 'Nueva cotización'}
                        </h1>
                    </div>
                    {!isEditing && <span className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">Folio automático: {folioSettings?.prefix || 'COT-'} + consecutivo</span>}
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {!isEditing && (
                        <Card title="Folio">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className={labelClass}>
                                    Tipo de folio
                                    <select className={inputClass} value={data.folio_mode} onChange={(event) => setData('folio_mode', event.target.value)}>
                                        <option value="auto">Automático ({folioSettings?.prefix || 'COT-'} y consecutivo)</option>
                                        <option value="custom">Personalizado</option>
                                    </select>
                                </label>
                                {data.folio_mode === 'custom' && (
                                    <label className={labelClass}>
                                        Folio personalizado
                                        <input className={inputClass} value={data.custom_folio} onChange={(event) => setData('custom_folio', event.target.value)} maxLength="64" required />
                                        {errors.custom_folio && <span className="mt-1 block text-xs text-red-600">{errors.custom_folio}</span>}
                                    </label>
                                )}
                            </div>
                        </Card>
                    )}

                    <ClientPicker
                        selectedClient={selectedClient}
                        search={clientSearch}
                        results={clientResults}
                        searching={searchingClients}
                        saveClient={data.save_client}
                        duplicateEmailError={data.save_client && !selectedClient ? errors.recipient_email : null}
                        onSearchChange={setClientSearch}
                        onSelect={selectClient}
                        onClear={clearSelectedClient}
                        onSaveClientChange={(saveClient) => {
                            setData('save_client', saveClient);
                            if (!saveClient) clearErrors('recipient_email');
                        }}
                    />
                    {errors.client_id && <p className="text-sm text-red-600">{errors.client_id}</p>}

                    <Card title="Cliente y vigencia">
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className={labelClass}>
                                Nombre o razón social *
                                <input className={inputClass} value={data.recipient_name} onChange={(event) => setData('recipient_name', event.target.value)} required />
                                {errors.recipient_name && <span className="mt-1 block text-xs text-red-600">{errors.recipient_name}</span>}
                            </label>
                            <label className={labelClass}>
                                Correo
                                <input type="email" className={inputClass} value={data.recipient_email} onChange={(event) => setData('recipient_email', event.target.value)} />
                                {errors.recipient_email && !(data.save_client && !selectedClient && errors.recipient_email.startsWith('Ya existe un cliente')) && <span className="mt-1 block text-xs text-red-600">{errors.recipient_email}</span>}
                            </label>
                            <label className={labelClass}>
                                Teléfono
                                <input className={inputClass} value={data.recipient_phone} onChange={(event) => setData('recipient_phone', event.target.value)} />
                            </label>
                            <label className={labelClass}>
                                Moneda
                                <select className={inputClass} value={data.currency} onChange={(event) => setData('currency', event.target.value)}>
                                    <option value="MXN">MXN — Peso mexicano</option>
                                    <option value="USD">USD — Dólar estadounidense</option>
                                </select>
                            </label>
                            <label className={labelClass}>
                                Fecha de emisión *
                                <input type="date" className={inputClass} value={data.issued_at} onChange={(event) => setData('issued_at', event.target.value)} required />
                            </label>
                            <label className={labelClass}>
                                Vigente hasta
                                <input type="date" className={inputClass} value={data.valid_until} onChange={(event) => setData('valid_until', event.target.value)} />
                                {errors.valid_until && <span className="mt-1 block text-xs text-red-600">{errors.valid_until}</span>}
                            </label>
                            <label className={`${labelClass} md:col-span-2`}>
                                Dirección
                                <textarea className={inputClass} rows="2" value={data.recipient_address} onChange={(event) => setData('recipient_address', event.target.value)} />
                            </label>
                        </div>
                    </Card>

                    <Card title="Conceptos">
                        <div className="space-y-4">
                            {data.items.map((item, index) => (
                                <div key={index} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Concepto {index + 1}</h2>
                                        <button
                                            type="button"
                                            disabled={data.items.length === 1}
                                            onClick={() => setData('items', data.items.filter((_, itemIndex) => itemIndex !== index))}
                                            className="text-xs font-semibold text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400"
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_140px_180px]">
                                        <label className={labelClass}>
                                            Descripción *
                                            <input className={inputClass} value={item.description} onChange={(event) => updateItem(index, 'description', event.target.value)} required />
                                            {errors[`items.${index}.description`] && <span className="mt-1 block text-xs text-red-600">{errors[`items.${index}.description`]}</span>}
                                        </label>
                                        <label className={labelClass}>
                                            Cantidad *
                                            <input type="number" min="0.01" step="0.01" className={inputClass} value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} required />
                                            {errors[`items.${index}.quantity`] && <span className="mt-1 block text-xs text-red-600">{errors[`items.${index}.quantity`]}</span>}
                                        </label>
                                        <label className={labelClass}>
                                            Precio unitario * ({data.currency})
                                            <input type="number" min="0" step="0.01" className={inputClass} value={item.unit_price} onChange={(event) => updateItem(index, 'unit_price', event.target.value)} required />
                                            {errors[`items.${index}.unit_price`] && <span className="mt-1 block text-xs text-red-600">{errors[`items.${index}.unit_price`]}</span>}
                                        </label>
                                    </div>
                                    <p className="mt-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Importe: {formatMoney((Number(item.quantity) || 0) * (Number(item.unit_price) || 0), data.currency)}
                                    </p>
                                </div>
                            ))}

                            {errors.items && <p className="text-sm text-red-600">{errors.items}</p>}
                            <button
                                type="button"
                                onClick={() => setData('items', [...data.items, { description: '', quantity: '1.00', unit_price: '0.00' }])}
                                className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-900/30"
                            >
                                + Agregar concepto
                            </button>
                        </div>
                    </Card>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <Card title="Descuento e IVA">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className={labelClass}>
                                    Descuento
                                    <select
                                        className={inputClass}
                                        value={data.discount_type}
                                        onChange={(event) => {
                                            setData('discount_type', event.target.value);
                                            if (event.target.value === 'none') setData('discount_value', '0.00');
                                        }}
                                    >
                                        <option value="none">Sin descuento</option>
                                        <option value="percent">Porcentaje</option>
                                        <option value="fixed">Monto fijo ({data.currency})</option>
                                    </select>
                                </label>
                                {data.discount_type !== 'none' && (
                                    <label className={labelClass}>
                                        {data.discount_type === 'percent' ? 'Descuento (%)' : `Descuento (${data.currency})`}
                                        <input type="number" min="0" max={data.discount_type === 'percent' ? '100' : undefined} step="0.01" className={inputClass} value={data.discount_value} onChange={(event) => setData('discount_value', event.target.value)} />
                                        {errors.discount_value && <span className="mt-1 block text-xs text-red-600">{errors.discount_value}</span>}
                                    </label>
                                )}
                                <label className={labelClass}>
                                    IVA (%)
                                    <input type="number" min="0" max="100" step="0.01" className={inputClass} value={data.tax_rate} onChange={(event) => setData('tax_rate', event.target.value)} />
                                    {errors.tax_rate && <span className="mt-1 block text-xs text-red-600">{errors.tax_rate}</span>}
                                </label>
                                <label className={`${labelClass} sm:col-span-2`}>
                                    Notas y condiciones
                                    <textarea className={inputClass} rows="4" value={data.notes} onChange={(event) => setData('notes', event.target.value)} />
                                </label>
                            </div>
                        </Card>

                        <Card title="Resumen">
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between gap-3 text-slate-600 dark:text-slate-300"><dt>Subtotal</dt><dd>{formatMoney(subtotal, data.currency)}</dd></div>
                                {discountAmount > 0 && <div className="flex justify-between gap-3 text-slate-600 dark:text-slate-300"><dt>Descuento</dt><dd>-{formatMoney(discountAmount, data.currency)}</dd></div>}
                                <div className="flex justify-between gap-3 text-slate-600 dark:text-slate-300"><dt>IVA ({Number(data.tax_rate) || 0}%)</dt><dd>{formatMoney(taxAmount, data.currency)}</dd></div>
                                <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
                                    <div className="flex justify-between gap-3 text-base font-bold text-slate-900 dark:text-white"><dt>Total</dt><dd>{formatMoney(total, data.currency)}</dd></div>
                                </div>
                            </dl>
                        </Card>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                        <Link href={isEditing ? `/quotes/${quote.id}` : '/quotes'} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancelar</Link>
                        <button type="submit" disabled={processing} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-500 disabled:opacity-50">
                            {processing ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear cotización'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

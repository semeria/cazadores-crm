import React from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FileText, Pencil, Plus, Search, Settings2, Trash2 } from 'lucide-react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/UI/Card';

const formatMoney = (amount, currency) => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
}).format(Number(amount) || 0);

const formatDate = (value) => {
    if (!value) return '—';
    const date = String(value).slice(0, 10);

    return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
        .format(new Date(`${date}T12:00:00`));
};

export default function Index({ quotes, filters, canConfigure }) {
    const { auth, flash } = usePage().props;
    const { data, setData } = useForm({ search: filters.search || '' });

    const search = (event) => {
        event.preventDefault();
        router.get('/quotes', { search: data.search }, { preserveState: true, replace: true });
    };

    const deleteQuote = (quote) => {
        const confirmed = window.confirm(`¿Eliminar permanentemente la cotización ${quote.quote_number} y sus conceptos? Esta acción no se puede deshacer.`);
        if (confirmed) {
            router.delete(`/quotes/${quote.id}`, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Cotizaciones" />
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-brand-700 dark:text-brand-400">Gestión comercial</p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Cotizaciones</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Consulta y prepara propuestas para tus clientes.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {canConfigure && (
                            <Link href="/quotes/settings" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                                <Settings2 size={17} /> Configuración
                            </Link>
                        )}
                        <Link href="/quotes/create" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-500">
                            <Plus size={18} /> Nueva cotización
                        </Link>
                    </div>
                </div>

                {flash?.success && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-900/25 dark:text-emerald-300">{flash.success}</div>}

                <Card>
                    <form onSubmit={search} className="mb-5 flex flex-col gap-3 sm:flex-row">
                        <label className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-slate-300 px-3 text-slate-400 dark:border-slate-600 dark:bg-surface-900">
                            <Search size={17} aria-hidden="true" />
                            <input
                                type="search"
                                value={data.search}
                                onChange={(event) => setData('search', event.target.value)}
                                placeholder="Buscar por folio o cliente"
                                aria-label="Buscar cotizaciones"
                                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-800 outline-none focus:ring-0 dark:text-white"
                            />
                        </label>
                        <button type="submit" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600">Buscar</button>
                    </form>

                    {quotes.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                        <th className="px-3 py-3 font-semibold">Folio</th>
                                        <th className="px-3 py-3 font-semibold">Cliente</th>
                                        <th className="px-3 py-3 font-semibold">Fecha</th>
                                        <th className="px-3 py-3 font-semibold">Creada por</th>
                                        <th className="px-3 py-3 text-right font-semibold">Total</th>
                                        <th className="px-3 py-3 text-right font-semibold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {quotes.data.map((quote) => (
                                        <tr key={quote.id} className="text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-surface-900/60">
                                            <td className="px-3 py-4 font-semibold">
                                                <Link href={`/quotes/${quote.id}`} className="text-brand-800 hover:underline dark:text-brand-300">{quote.quote_number}</Link>
                                            </td>
                                            <td className="px-3 py-4">{quote.recipient_name}</td>
                                            <td className="px-3 py-4 text-slate-500 dark:text-slate-400">{formatDate(quote.issued_at)}</td>
                                            <td className="px-3 py-4 text-slate-500 dark:text-slate-400">{quote.creator?.name || 'Usuario eliminado'}</td>
                                            <td className="px-3 py-4 text-right font-semibold">{formatMoney(quote.total, quote.currency)}</td>
                                            <td className="px-3 py-4 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <Link
                                                        href={`/quotes/${quote.id}/edit`}
                                                        aria-label={`Editar cotización ${quote.quote_number}`}
                                                        title="Editar cotización"
                                                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-400 dark:hover:bg-brand-900/30 dark:hover:text-brand-300"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>
                                                    {(auth?.user?.role === 'owner' || auth?.user?.id === quote.created_by) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteQuote(quote)}
                                                            aria-label={`Eliminar cotización ${quote.quote_number}`}
                                                            title="Eliminar cotización"
                                                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-slate-400 dark:hover:bg-red-900/25 dark:hover:text-red-300"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center px-5 py-14 text-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"><FileText size={23} /></span>
                            <h2 className="mt-4 font-semibold text-slate-900 dark:text-white">Aún no hay cotizaciones</h2>
                            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">Crea una cotización para verla aquí. Cada usuario consulta sus propias cotizaciones y el owner puede consultar las de toda la organización.</p>
                            <Link href="/quotes/create" className="mt-5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-500">Crear cotización</Link>
                        </div>
                    )}

                    {quotes.links?.length > 3 && (
                        <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
                            {quotes.links.map((link, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    className={`rounded-lg px-3 py-1.5 text-sm ${link.active ? 'bg-brand-600 font-semibold text-white' : 'bg-slate-100 text-slate-700 dark:bg-surface-900 dark:text-slate-200'} disabled:cursor-not-allowed disabled:opacity-40`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

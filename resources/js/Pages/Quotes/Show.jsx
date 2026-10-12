import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, Eye, Pencil, X, Trash2 } from 'lucide-react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Card from '../../Components/UI/Card';
import ModalTransition from '../../Components/Transitions/ModalTransition';

const formatMoney = (amount, currency) => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
}).format(Number(amount) || 0);

const formatDate = (value) => {
    if (!value) return '—';
    const date = String(value).slice(0, 10);

    return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
        .format(new Date(`${date}T12:00:00`));
};

export default function Show({ quote, logoUrl }) {
    const { auth, flash } = usePage().props;
    const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
    const canEdit = auth?.user?.role === 'owner' || auth?.user?.id === quote.created_by;
    const discountDescription = quote.discount_type === 'percent'
        ? `Descuento (${quote.discount_value}%)`
        : quote.discount_type === 'fixed' ? 'Descuento' : null;

    const deleteQuote = () => {
        const confirmed = window.confirm(`¿Eliminar permanentemente la cotización ${quote.quote_number} y sus conceptos? Esta acción no se puede deshacer.`);
        if (confirmed) {
            router.delete(`/quotes/${quote.id}`);
        }
    };

    useEffect(() => {
        if (!isPdfPreviewOpen) {
            return undefined;
        }

        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setIsPdfPreviewOpen(false);
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', closeOnEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, [isPdfPreviewOpen]);

    return (
        <AuthenticatedLayout>
            <Head title={`Cotización ${quote.quote_number}`} />
            <div className="mx-auto max-w-5xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <Link href="/quotes" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-700 dark:text-slate-300 dark:hover:text-brand-300"><ArrowLeft size={17} /> Cotizaciones</Link>
                    {canEdit && (
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setIsPdfPreviewOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"><Eye size={16} /> Vista previa PDF</button>
                            <Link href={`/quotes/${quote.id}/edit`} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-500"><Pencil size={16} /> Editar</Link>
                            <button type="button" onClick={deleteQuote} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-900/25"><Trash2 size={16} /> Eliminar</button>
                        </div>
                    )}
                </div>

                {flash?.success && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-900/25 dark:text-emerald-300">{flash.success}</div>}

                <Card className="overflow-hidden">
                    <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-6 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            {logoUrl ? (
                                <img src={logoUrl} alt={`Logo de ${quote.organization.name}`} className="max-h-16 max-w-40 object-contain" />
                            ) : (
                                <div className="flex h-14 min-w-14 items-center justify-center rounded-xl bg-brand-50 px-3 text-sm font-bold text-brand-900 dark:bg-brand-900/30 dark:text-brand-200">{quote.organization.name}</div>
                            )}
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Organización</p>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white">{quote.organization.name}</h1>
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-700 dark:text-brand-400">Cotización</p>
                            <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{quote.quote_number}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Emitida {formatDate(quote.issued_at)}</p>
                            {quote.valid_until && <p className="text-sm text-slate-500 dark:text-slate-400">Vigente hasta {formatDate(quote.valid_until)}</p>}
                        </div>
                    </div>

                    <div className="grid gap-6 border-b border-slate-200 py-6 dark:border-slate-700 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Preparada para</p>
                            <h2 className="mt-2 font-semibold text-slate-900 dark:text-white">{quote.recipient_name}</h2>
                            {quote.recipient_email && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{quote.recipient_email}</p>}
                            {quote.recipient_phone && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{quote.recipient_phone}</p>}
                            {quote.recipient_address && <p className="mt-1 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{quote.recipient_address}</p>}
                        </div>
                        <div className="sm:text-right">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Moneda</p>
                            <p className="mt-2 font-semibold text-slate-900 dark:text-white">{quote.currency === 'MXN' ? 'MXN — Peso mexicano' : 'USD — Dólar estadounidense'}</p>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Preparada por {quote.creator?.name || 'Usuario eliminado'}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto py-6">
                        <table className="w-full min-w-[520px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                    <th className="py-3 pr-3">Concepto</th>
                                    <th className="px-3 py-3 text-right">Cantidad</th>
                                    <th className="px-3 py-3 text-right">Precio unitario</th>
                                    <th className="py-3 pl-3 text-right">Importe</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {quote.items.map((item) => (
                                    <tr key={item.id} className="text-slate-700 dark:text-slate-200">
                                        <td className="py-4 pr-3">{item.description}</td>
                                        <td className="px-3 py-4 text-right">{item.quantity}</td>
                                        <td className="px-3 py-4 text-right">{formatMoney(item.unit_price, quote.currency)}</td>
                                        <td className="py-4 pl-3 text-right font-semibold">{formatMoney(item.line_total, quote.currency)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-700">
                        <dl className="w-full max-w-sm space-y-3 text-sm">
                            <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300"><dt>Subtotal</dt><dd>{formatMoney(quote.subtotal, quote.currency)}</dd></div>
                            {discountDescription && <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300"><dt>{discountDescription}</dt><dd>-{formatMoney(quote.discount_amount, quote.currency)}</dd></div>}
                            <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300"><dt>IVA ({quote.tax_rate}%)</dt><dd>{formatMoney(quote.tax_amount, quote.currency)}</dd></div>
                            <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-white"><dt>Total</dt><dd>{formatMoney(quote.total, quote.currency)}</dd></div>
                        </dl>
                    </div>

                    {quote.notes && <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-700"><h2 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Notas y condiciones</h2><p className="mt-2 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">{quote.notes}</p></div>}
                </Card>
            </div>

            <ModalTransition
                open={isPdfPreviewOpen}
                ariaLabel={`Vista previa PDF de ${quote.quote_number}`}
                backdropClassName="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-5"
                panelClassName="flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-surface-800"
            >
                        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-6">
                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-white">Vista previa · {quote.quote_number}</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Revisa el documento antes de descargarlo.</p>
                            </div>
                            <button type="button" onClick={() => setIsPdfPreviewOpen(false)} aria-label="Cerrar vista previa" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-300 dark:hover:bg-slate-700"><X size={20} /></button>
                        </div>
                        <iframe title={`PDF de cotización ${quote.quote_number}`} src={`/quotes/${quote.id}/pdf/preview`} className="min-h-0 w-full flex-1 bg-slate-100 dark:bg-surface-900" />
                        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-6">
                            <a href={`/quotes/${quote.id}/pdf/preview`} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300">Abrir en otra pestaña</a>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsPdfPreviewOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">Cerrar</button>
                                <a href={`/quotes/${quote.id}/pdf`} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500"><Download size={16} /> Descargar PDF</a>
                            </div>
                        </div>
            </ModalTransition>
        </AuthenticatedLayout>
    );
}

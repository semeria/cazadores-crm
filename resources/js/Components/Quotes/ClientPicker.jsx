import React from 'react';
import { Check, Search, UserRound, X } from 'lucide-react';

export default function ClientPicker({
    selectedClient,
    search,
    results,
    searching,
    saveClient,
    duplicateEmailError,
    onSearchChange,
    onSelect,
    onClear,
    onSaveClientChange,
}) {
    return (
        <div className="space-y-4 rounded-xl border border-brand-100 bg-brand-50/50 p-4 dark:border-brand-900/50 dark:bg-brand-900/10">
            <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Cliente de la organización</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Busca un cliente existente o registra uno nuevo desde esta cotización.</p>
            </div>

            {selectedClient ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-surface-800">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300"><UserRound size={18} /></span>
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{selectedClient.name}</span>
                            <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{[selectedClient.email, selectedClient.phone].filter(Boolean).join(' · ') || 'Sin correo ni teléfono'}</span>
                        </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"><Check size={14} /> Cliente cargado</span>
                    <button type="button" onClick={onClear} className="text-xs font-semibold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400">Cambiar cliente</button>
                </div>
            ) : (
                <>
                    <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-slate-400 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 dark:border-slate-600 dark:bg-surface-900 dark:focus-within:ring-brand-900/40">
                        <Search size={17} aria-hidden="true" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder="Buscar por nombre, correo o teléfono"
                            aria-label="Buscar clientes de la organización"
                            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-800 outline-none focus:ring-0 dark:text-white"
                        />
                        {search && <button type="button" onClick={() => onSearchChange('')} aria-label="Limpiar búsqueda"><X size={16} /></button>}
                    </label>

                    {search.trim().length >= 2 && (
                        <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-surface-800">
                            {searching ? (
                                <p className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">Buscando clientes…</p>
                            ) : results.length > 0 ? results.map((client) => (
                                <button
                                    key={client.id}
                                    type="button"
                                    onClick={() => onSelect(client)}
                                    className="flex w-full items-center gap-3 border-b border-slate-100 px-3 py-3 text-left last:border-0 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 dark:border-slate-700 dark:hover:bg-brand-900/20"
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200"><UserRound size={16} /></span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{client.name}</span>
                                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{[client.email, client.phone].filter(Boolean).join(' · ')}</span>
                                    </span>
                                </button>
                            )) : (
                                <p className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">No se encontraron clientes con esos datos.</p>
                            )}
                        </div>
                    )}
                </>
            )}

            {!selectedClient && (
                <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <input
                        type="checkbox"
                        checked={saveClient}
                        onChange={(event) => onSaveClientChange(event.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>
                        <span className="block font-medium">Guardar este cliente para reutilizarlo</span>
                        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">Se registra junto con la cotización y queda disponible para toda la organización.</span>
                    </span>
                </label>
            )}

            {duplicateEmailError && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                    {duplicateEmailError}
                </p>
            )}
        </div>
    );
}

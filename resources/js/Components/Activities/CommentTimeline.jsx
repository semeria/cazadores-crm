import React from 'react';
import { useForm, usePage } from '@inertiajs/react';

export default function CommentTimeline({ activityId, comments }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing, reset, errors } = useForm({
        body: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/activities/${activityId}/comments`, {
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    return (
        <div className="mt-8 border-t dark:border-slate-700 pt-6">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
                Colaboración y Notas
            </h4>

            {/* Listado Cronológico */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {comments.map((comment) => (
                    <div key={comment.id} className={`flex flex-col ${comment.user_id === auth.user.id ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                            comment.user_id === auth.user.id
                                ? 'bg-brand-600 text-white rounded-tr-none'
                                : 'bg-slate-100 dark:bg-surface-900 dark:text-white rounded-tl-none'
                        }`}>
                            <p>{comment.body}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 uppercase">
                            {comment.user.name} • {new Date(comment.created_at).toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>

            {/* Formulario de envío */}
            <form onSubmit={submit} className="relative">
                <textarea
                    rows="2"
                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white text-sm focus:ring-brand-500"
                    placeholder="Escribe un mensaje de seguimiento..."
                    value={data.body}
                    onChange={e => setData('body', e.target.value)}
                    required
                ></textarea>
                <div className="flex justify-end mt-2">
                    <button
                        disabled={processing}
                        className="bg-brand-600 text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-brand-500 transition-colors"
                    >
                        {processing ? 'Enviando...' : 'Comentar'}
                    </button>
                </div>
            </form>
        </div>
    );
}

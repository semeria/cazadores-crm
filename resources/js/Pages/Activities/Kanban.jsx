import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Link, useForm, Head, usePage } from '@inertiajs/react'; // 1. Agregamos usePage
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import CommentTimeline from '../../Components/Activities/CommentTimeline';
import axios from 'axios';

const STATUS_TITLES = {
    pending: 'Pendientes',
    in_progress: 'En Progreso',
    in_review: 'En Revisión',
    completed: 'Completadas',
    cancelled: 'Canceladas'
};

export default function Kanban({ columns: initialColumns, users, agents }) {
    // 2. Extraemos auth de las props globales de Inertia
    const { auth } = usePage().props;

    const [columns, setColumns] = useState(initialColumns);

    useEffect(() => {
        setColumns(initialColumns);
    }, [initialColumns]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        assigned_user_id: '',
        agent_id: '',
        due_date: ''
    });

    const openCreateModal = (status = 'pending') => {
        reset();
        setData('status', status);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (activity) => {
        setData({
            title: activity.title || '',
            description: activity.description || '',
            status: activity.status || 'pending',
            priority: activity.priority || 'medium',
            assigned_user_id: activity.assigned_user_id || '',
            agent_id: activity.agent_id || '',
            due_date: activity.due_date || ''
        });
        setEditingId(activity.id);
        setIsModalOpen(true);
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (editingId) {
            put(`/activities/${editingId}`, { onSuccess: () => setIsModalOpen(false) });
        } else {
            post('/activities', { onSuccess: () => setIsModalOpen(false) });
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar esta actividad?')) {
            destroy(`/activities/${id}`, { onSuccess: () => setIsModalOpen(false) });
        }
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceColumn = [...columns[source.droppableId]];
        const destColumn = source.droppableId === destination.droppableId ? sourceColumn : [...columns[destination.droppableId]];

        const [movedItem] = sourceColumn.splice(source.index, 1);
        movedItem.status = destination.droppableId;

        destColumn.splice(destination.index, 0, movedItem);

        const newColumns = { ...columns, [source.droppableId]: sourceColumn };
        if (source.droppableId !== destination.droppableId) {
            newColumns[destination.droppableId] = destColumn;
        }

        setColumns(newColumns);

        const updatedItems = destColumn.map((item, index) => ({
            id: item.id,
            status: destination.droppableId,
            position: index
        }));

        axios.put('/activities/reorder', { items: updatedItems });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tablero Kanban" />

            <div className="flex justify-between items-center mb-6 px-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tablero Operativo</h2>
                <div className="flex items-center space-x-4">
                    {/* 3. Condicionamos la URL según el rol del usuario */}
                    <Link
                        href={auth?.user?.role === 'agent' ? '/agent/activities' : '/activities'}
                        className="text-sm text-slate-500 hover:text-brand-500 transition-colors"
                    >
                        Ver como Lista
                    </Link>
                    <button
                        onClick={() => openCreateModal('pending')}
                        className="bg-brand-500 text-black font-bold px-4 py-2 rounded-lg shadow-lg shadow-brand-500/20 hover:bg-brand-400 transition-all"
                    >
                        + Nueva Actividad
                    </button>
                </div>
            </div>

            <div className="flex overflow-x-auto px-4 pb-6 space-x-4 min-h-[75vh]">
                <DragDropContext onDragEnd={onDragEnd}>
                    {Object.entries(columns).map(([columnId, items]) => (
                        <div key={columnId} className="bg-slate-100 dark:bg-surface-800 p-4 rounded-xl w-80 min-w-[320px] flex flex-col border border-transparent dark:border-slate-700/50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-widest">
                                    {STATUS_TITLES[columnId]} <span className="ml-2 opacity-50">{items.length}</span>
                                </h3>
                                <button onClick={() => openCreateModal(columnId)} className="text-slate-400 hover:text-brand-500 font-bold text-xl">+</button>
                            </div>

                            <Droppable droppableId={columnId}>
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 overflow-y-auto min-h-[150px] space-y-3">
                                        {items.map((item, index) => (
                                            <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="bg-white dark:bg-surface-900 p-4 rounded-lg shadow-subtle border border-slate-200 dark:border-slate-700 group hover:border-brand-500/50 transition-colors"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug">{item.title}</div>
                                                            <button
                                                                onClick={() => openEditModal(item)}
                                                                className="text-slate-400 hover:text-brand-500 opacity-0 group-hover:opacity-100 transition"
                                                            >
                                                                ✏️
                                                            </button>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-4">
                                                            <span className="text-[10px] uppercase font-bold text-slate-400 truncate max-w-[100px]">
                                                                {item.assignee?.name || 'Sin asignar'}
                                                            </span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase
                                                                ${item.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400'}`}>
                                                                {item.priority}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </DragDropContext>
            </div>

            {/* Modal de Creación/Edición */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto py-10 px-4">
                    <div className="bg-white dark:bg-surface-800 p-8 rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 dark:border-slate-700">
                        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                            {editingId ? 'Detalles de Actividad' : 'Nueva Actividad'}
                        </h2>

                        <form onSubmit={submitForm} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título de la actividad</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    required
                                />
                                {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción operativa</label>
                                <textarea
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                                    rows="3"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                                    <select
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                    >
                                        <option value="pending">Pendiente</option>
                                        <option value="in_progress">En Progreso</option>
                                        <option value="in_review">En Revisión</option>
                                        <option value="completed">Completada</option>
                                        <option value="cancelled">Cancelada</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prioridad</label>
                                    <select
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                                        value={data.priority}
                                        onChange={e => setData('priority', e.target.value)}
                                    >
                                        <option value="low">Baja</option>
                                        <option value="medium">Media</option>
                                        <option value="high">Alta</option>
                                        <option value="urgent">Urgente</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Asignar a</label>
                                    <select
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                                        value={data.assigned_user_id}
                                        onChange={e => setData('assigned_user_id', e.target.value)}
                                    >
                                        <option value="">-- Sin Asignar --</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha límite</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-surface-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                                        value={data.due_date}
                                        onChange={e => setData('due_date', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                                <div>
                                    {editingId && (
                                        <button type="button" onClick={() => handleDelete(editingId)} className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors">
                                            Eliminar Actividad
                                        </button>
                                    )}
                                </div>
                                <div className="space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-brand-500 text-black font-bold rounded-lg hover:bg-brand-400 disabled:opacity-50 transition-all"
                                    >
                                        {processing ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Timeline de Comentarios integrada con scroll */}
                        {editingId && (
                            <div className="max-h-[400px] overflow-y-auto mt-4 px-2">
                                <CommentTimeline
                                    activityId={editingId}
                                    comments={
                                        Object.values(columns)
                                            .flat()
                                            .find(item => item.id === editingId)?.comments || []
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

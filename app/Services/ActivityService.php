<?php

namespace App\Services;

use App\Models\Activity;

class ActivityService
{
    /**
     * Crea una nueva actividad calculando automáticamente su posición en el Kanban.
     */
    public function createActivity(array $data): Activity
    {
        // Regla de negocio: La nueva tarjeta va al final de la columna correspondiente
        $maxPosition = Activity::where('status', $data['status'])->max('position');
        $data['position'] = $maxPosition ? $maxPosition + 1 : 0;

        return Activity::create($data);
    }

    /**
     * Reordena masivamente las actividades (Drag and Drop)
     */
    public function reorderActivities(array $items): void
    {
        foreach ($items as $item) {
            Activity::where('id', $item['id'])->update([
                'status' => $item['status'],
                'position' => $item['position'],
            ]);
        }
    }
}

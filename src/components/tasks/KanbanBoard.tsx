import { useState } from 'react'
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    DragOverlay,
} from '@dnd-kit/core'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, Client } from '../../types'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'

interface KanbanBoardProps {
    tasks: Task[]
    clients: Client[]
    onStatusChange: (id: number, status: Task['status']) => void
    onEdit: (task: Task) => void
    onDelete: (id: number) => void
}

const COLUMNS: { id: Task['status']; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'done', label: 'Done' },
]

export default function KanbanBoard({ tasks, clients, onStatusChange, onEdit, onDelete }: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    )

    const getTasksByStatus = (status: Task['status']) =>
        tasks.filter(t => t.status === status)

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t.id === event.active.id)
        setActiveTask(task ?? null)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        const activeTask = tasks.find(t => t.id === activeId)
        if (!activeTask) return

        // Check if dropped over a column
        const overColumn = COLUMNS.find(c => c.id === overId)
        if (overColumn && activeTask.status !== overColumn.id) {
            onStatusChange(Number(activeId), overColumn.id)
        }

        // Check if dropped over another task
        const overTask = tasks.find(t => t.id === overId)
        if (overTask && activeTask.status !== overTask.status) {
            onStatusChange(Number(activeId), overTask.status)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null)
        const { active, over } = event
        if (!over) return

        const activeTask = tasks.find(t => t.id === active.id)
        if (!activeTask) return

        const overColumn = COLUMNS.find(c => c.id === over.id)
        if (overColumn && activeTask.status !== overColumn.id) {
            onStatusChange(Number(active.id), overColumn.id)
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {COLUMNS.map(column => {
                    const columnTasks = getTasksByStatus(column.id)
                    return (
                        <KanbanColumn
                            key={column.id}
                            id={column.id}
                            label={column.label}
                            count={columnTasks.length}
                        >
                            <SortableContext
                                items={columnTasks.map(t => t.id!)}
                                strategy={verticalListSortingStrategy}
                            >
                                {columnTasks.map(task => (
                                    <KanbanCard
                                        key={task.id}
                                        task={task}
                                        client={clients.find(c => c.id === task.clientId)}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onStatusChange={onStatusChange}
                                    />
                                ))}
                            </SortableContext>
                        </KanbanColumn>
                    )
                })}
            </div>

            <DragOverlay>
                {activeTask && (
                    <KanbanCard
                        task={activeTask}
                        client={clients.find(c => c.id === activeTask.clientId)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onStatusChange={onStatusChange}
                        isDragging
                    />
                )}
            </DragOverlay>
        </DndContext>
    )
}
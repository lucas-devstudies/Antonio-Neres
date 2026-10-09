'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type ColumnId = 'todo' | 'in_progress' | 'done'

interface Task {
  id: string
  title: string
  status: ColumnId
}

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'A Fazer' },
  { id: 'in_progress', title: 'Em Progresso' },
  { id: 'done', title: 'Concluído' },
]

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Ajustar layout da home', status: 'todo' },
    { id: '2', title: 'Integrar API de autenticação', status: 'in_progress' },
    { id: '3', title: 'Configurar shadcn/ui', status: 'done' },
  ])

  // Estados para controlar o indicador visual de arraste
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null)


  // Inicio do arraste
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id)
    setDraggedTaskId(id)
  }

  // Passando por cima da coluna
  const handleDragOverColumn = (e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault()
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId)
    }
  }

  // Passando por cima de um card específico
  const handleDragOverCard = (e: React.DragEvent, taskId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragOverTaskId !== taskId) {
      setDragOverTaskId(taskId)
    }
  }

  // Limpeza de estado quando solta ou cancela
  const clearDragState = () => {
    setDraggedTaskId(null)
    setDragOverTaskId(null)
    setDragOverColumn(null)
  }

  const handleDrop = (
    e: React.DragEvent,
    targetStatus: ColumnId,
    targetTaskId?: string
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const taskId = e.dataTransfer.getData('taskId') || draggedTaskId
    if (!taskId) return

    setTasks((prev) => {
      const draggedTask = prev.find((t) => t.id === taskId)
      if (!draggedTask) return prev

      const filtered = prev.filter((t) => t.id !== taskId)
      const updatedTask = { ...draggedTask, status: targetStatus }

      if (targetTaskId && targetTaskId !== taskId) {
        const targetIndex = filtered.findIndex((t) => t.id === targetTaskId)
        if (targetIndex !== -1) {
          const newTasks = [...filtered]
          newTasks.splice(targetIndex, 0, updatedTask)
          return newTasks
        }
      }

      return [...filtered, updatedTask]
    })

    clearDragState()
  }

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id)
          const isOverEmptyColumn =
            dragOverColumn === column.id && columnTasks.length === 0

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOverColumn(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
              className="bg-muted/40 p-4 rounded-lg border flex flex-col gap-3 min-h-125 transition-colors"
            >
              <h2 className="font-semibold text-lg flex items-center justify-between">
                {column.title}
                <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                  {columnTasks.length}
                </span>
              </h2>

              <div className="flex flex-col gap-2 flex-1">
                {columnTasks.map((task) => {
                  const isBeingDragged = task.id === draggedTaskId
                  const isTarget = task.id === dragOverTaskId && !isBeingDragged

                  return (
                    <React.Fragment key={task.id}>
                      {/* Espaço em branco (Placeholder) inserido antes do card alvo */}
                      {isTarget && (
                        <div className="h-16 border-2 border-dashed border-primary/40 rounded-lg bg-primary/5 transition-all duration-200 animate-pulse" />
                      )}

                      <Card
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragOver={(e) => handleDragOverCard(e, task.id)}
                        onDrop={(e) => handleDrop(e, column.id, task.id)}
                        onDragEnd={clearDragState}
                        className={`cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all ${
                          isBeingDragged ? 'opacity-30 border-dashed' : ''
                        }`}
                      >
                        <CardHeader className="">
                          <CardTitle className="text-sm font-medium flex justify-between items-center">
                            {task.title}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </React.Fragment>
                  )
                })}

                {/* Espaço em branco caso a coluna esteja completamente vazia */}
                {isOverEmptyColumn && (
                  <div className="h-16 border-2 border-dashed border-primary/40 rounded-lg bg-primary/5 transition-all duration-200 animate-pulse" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Separator } from './ui/separator'

type ColumnId = 'todo' | 'in_progress' | 'done'

interface Task {
  id: string
  title: string
  status: ColumnId
  comment: string
}

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'A Fazer' },
  { id: 'in_progress', title: 'Em Progresso' },
  { id: 'done', title: 'Concluído' },
]

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Carlos Andrade',
      comment: 'Precisa ser revisado',
      status: 'todo',
    },
    {
      id: '2',
      title: 'Yasmin Augusta',
      comment: 'Aguardando feedback',
      status: 'in_progress',
    },
    {
      id: '3',
      title: 'Roberto Silva',
      comment: 'Concluído',
      status: 'done',
    },
  ])

  // No mobile, todas as colunas começam abertas.
  // No desktop, o estado não interfere: todas ficam abertas.
  const [expandedColumns, setExpandedColumns] = useState<
    Record<ColumnId, boolean>
  >({
    todo: true,
    in_progress: true,
    done: true,
  })

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null)

  const toggleColumn = (columnId: ColumnId) => {
    setExpandedColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }))
  }

  // Início do arraste
  const handleDragStart = (
    e: React.DragEvent<HTMLElement>,
    id: string,
  ) => {
    e.dataTransfer.setData('taskId', id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedTaskId(id)
  }

  // Arraste sobre a coluna, inclusive quando estiver recolhida
  const handleDragOverColumn = (
    e: React.DragEvent<HTMLElement>,
    columnId: ColumnId,
  ) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId)
    }
  }

  // Arraste sobre um card específico
  const handleDragOverCard = (
    e: React.DragEvent<HTMLElement>,
    taskId: string,
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (dragOverTaskId !== taskId) {
      setDragOverTaskId(taskId)
    }
  }

  // Limpeza dos indicadores visuais
  const clearDragState = () => {
    setDraggedTaskId(null)
    setDragOverTaskId(null)
    setDragOverColumn(null)
  }

  const handleDrop = (
    e: React.DragEvent<HTMLElement>,
    targetStatus: ColumnId,
    targetTaskId?: string,
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const taskId = e.dataTransfer.getData('taskId') || draggedTaskId

    if (!taskId) {
      clearDragState()
      return
    }

    setTasks((prev) => {
      const draggedTask = prev.find((task) => task.id === taskId)

      if (!draggedTask) return prev

      // Remove a tarefa arrastada da lista.
      const remainingTasks = prev.filter((task) => task.id !== taskId)

      const updatedTask: Task = {
        ...draggedTask,
        status: targetStatus,
      }

      // Se o destino for um card, insere a tarefa
      // imediatamente antes dele na lista.
      if (targetTaskId && targetTaskId !== taskId) {
        const targetIndex = remainingTasks.findIndex(
          (task) => task.id === targetTaskId,
        )

        if (targetIndex !== -1) {
          const newTasks = [...remainingTasks]
          newTasks.splice(targetIndex, 0, updatedTask)
          return newTasks
        }
      }

      // Soltar na coluna insere a tarefa no final
      // das tarefas daquela coluna.
      let lastTargetIndex = -1

      remainingTasks.forEach((task, index) => {
        if (task.status === targetStatus) {
          lastTargetIndex = index
        }
      })

      const newTasks = [...remainingTasks]
      newTasks.splice(lastTargetIndex + 1, 0, updatedTask)

      return newTasks
    })

    clearDragState()
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.status === column.id,
          )

          const isExpanded = expandedColumns[column.id]
          const isOverColumn = dragOverColumn === column.id

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOverColumn(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col gap-3 rounded-lg border bg-foreground/10 p-4 transition-colors md:min-h-125${
                isOverColumn
                  ? 'border-primary bg-primary/5'
                  : ''
              }`}
            >
              {/* Cabeçalho: clicável no mobile e sempre aberto no desktop */}
              <button
                type="button"
                onClick={() => toggleColumn(column.id)}
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between gap-3 text-left md:cursor-default"
              >
                <span className="flex items-center gap-2 text-lg font-semibold">
                  {column.title}

                  <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {columnTasks.length}
                  </span>
                </span>

                {/* Indicador de expansão apenas no mobile */}
                <span className="md:hidden">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </span>
              </button>

              {/* Conteúdo recolhível somente no mobile */}
              <div
                className={`flex flex-col gap-2 ${
                  isExpanded ? 'flex' : 'hidden'
                } md:flex md:flex-1`}
              >
                {columnTasks.map((task) => {
                  const isBeingDragged = task.id === draggedTaskId
                  const isTarget =
                    task.id === dragOverTaskId && !isBeingDragged

                  return (
                    <React.Fragment key={task.id}>
                      {/* Indicador da posição de destino */}
                      {isTarget && (
                        <div className="animate-pulse rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 transition-all duration-200 h-16" />
                      )}

                      <Card
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragOver={(e) => handleDragOverCard(e, task.id)}
                        onDrop={(e) =>
                          handleDrop(e, column.id, task.id)
                        }
                        onDragEnd={clearDragState}
                        className={`cursor-grab transition-all hover:border-primary/50 py-0 active:cursor-grabbing ${
                          isBeingDragged
                            ? 'border-dashed opacity-30'
                            : ''
                        }`}
                      >
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm font-medium">
                            {task.title}
                          </CardTitle>
                          <Separator orientation='horizontal' style={{paddingTop:1,paddingBottom:1}}/>
                          {task.comment && (
                            <p className="text-xs text-muted-foreground">
                              {task.comment}
                            </p>
                          )}
                        </CardHeader>
                      </Card>
                    </React.Fragment>
                  )
                })}

                {/* Área visual para colunas vazias durante o arraste */}
                {columnTasks.length === 0 && isOverColumn && (
                  <div className="flex min-h-16 items-center justify-center rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 text-sm text-muted-foreground">
                    Solte a tarefa aqui
                  </div>
                )}

                {/* Área de destino no final da coluna */}
                {columnTasks.length > 0 && isOverColumn && (
                  <div className="h-3 rounded-md border border-dashed border-primary/40 bg-primary/5" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
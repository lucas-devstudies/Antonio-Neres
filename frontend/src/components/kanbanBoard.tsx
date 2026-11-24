'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Separator } from './ui/separator'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { getAllTasks, getTaskById, updatePositionTask, updateTask } from '@/services/api'
import { ColumnId, TaskAll, TaskBasic } from '@/models/ticket'
import { Field, FieldGroup } from './ui/field'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { formatCentsToBRL } from '@/utils/formatCentes'
import { Button } from './ui/button'

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'TO_DO', title: 'A Fazer' },
  { id: 'IN_PROGRESS', title: 'Em Progresso' },
  { id: 'DONE', title: 'Concluído' },
]

export function KanbanBoard() {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [tasks, setTasks] = useState<TaskBasic[]>()
  const [task, setTask] = useState<TaskAll | null>(null)

  const [expandedColumns, setExpandedColumns] = useState<Record<ColumnId, boolean>>({
    TO_DO: true,
    IN_PROGRESS: true,
    DONE: true,
  })

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await getAllTasks()
        setTasks(response)
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      }
    }
    loadTasks()
  }, [])

  const toggleColumn = (columnId: ColumnId) => {
    setExpandedColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }))
  }

  const clearDragState = () => {
    setDraggedTaskId(null)
    setDragOverTaskId(null)
    setDragOverColumn(null)
  }

  const handleDrop = async (
    e: React.DragEvent<HTMLElement>,
    targetStatus: ColumnId,
    targetTaskId?: string,
    cardElement?: HTMLElement | null,
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId
    clearDragState()

    if (!taskId || !tasks) return

    const previousTasks = tasks
    const draggedTask = tasks.find((t) => t.id === taskId)
    if (!draggedTask) return

    const targetColumnTasks = tasks.filter(
      (t) => t.status === targetStatus && t.id !== taskId,
    )

    const movedTask: TaskBasic = {
      ...draggedTask,
      status: targetStatus,
    }

    let insertIndex = targetColumnTasks.length

    if (targetTaskId && targetTaskId !== taskId) {
      const hoveredIndex = targetColumnTasks.findIndex((t) => t.id === targetTaskId)

      if (hoveredIndex !== -1) {
        const rect = cardElement?.getBoundingClientRect() ?? e.currentTarget.getBoundingClientRect()
        const droppedBelowMiddle = e.clientY > rect.top + rect.height / 2
        insertIndex = droppedBelowMiddle ? hoveredIndex + 1 : hoveredIndex
      }
    }

    targetColumnTasks.splice(insertIndex, 0, movedTask)

    const nextTasks: TaskBasic[] = []
    for (const col of COLUMNS) {
      if (col.id === targetStatus) {
        nextTasks.push(...targetColumnTasks)
      } else {
        nextTasks.push(
          ...tasks.filter((t) => t.status === col.id && t.id !== taskId),
        )
      }
    }

    setTasks(nextTasks)

    try {
      await updatePositionTask(taskId, {
        status: targetStatus,
        position: insertIndex,
      })
    } catch (error) {
      console.error('Erro ao atualizar posição:', error)
      setTasks(previousTasks)
    }
  }

  async function updateData(taskToUpdate: TaskAll) {
    try {
      await updateTask(taskToUpdate.id, taskToUpdate)
      setTasks((prev) =>
        prev?.map((item) =>
          item.id === taskToUpdate.id
            ? {
                ...item,
                name: taskToUpdate.name,
                ticketNote: taskToUpdate.ticketNote,
              }
            : item,
        ),
      )
      setOpenModal(false)
    } catch (error) {
      console.error('Erro ao atualizar dados:', error)
    }
  }

  async function loadTask(taskId: string) {
    const response = await getTaskById(taskId)
    if (response) {
      setTask(response)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {tasks ? COLUMNS.map((column) => {
          const columnTasks = tasks.filter(
            (t) => t.status === column.id,
          )

          const isExpanded = expandedColumns[column.id]
          const isOverColumn = dragOverColumn === column.id

          return (
            <div
              key={column.id}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                if (dragOverColumn !== column.id) {
                  setDragOverColumn(column.id)
                }
              }}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col gap-3 rounded-lg border bg-foreground/10 p-4 transition-colors md:min-h-125 ${
                isOverColumn
                  ? 'border-primary bg-primary/5'
                  : ''
              }`}
            >
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

                <span className="md:hidden">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </span>
              </button>

              <div
                className={`flex flex-col gap-2 ${
                  isExpanded ? 'flex' : 'hidden'
                } md:flex md:flex-1`}
              >
                {columnTasks.map((cardTask) => {
                  const isBeingDragged = cardTask.id === draggedTaskId
                  const isTarget =
                    cardTask.id === dragOverTaskId && !isBeingDragged

                  return (
                    <Card
                      key={cardTask.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('text/plain', cardTask.id)
                        setDraggedTaskId(cardTask.id)
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        e.dataTransfer.dropEffect = 'move'
                        if (dragOverTaskId !== cardTask.id) {
                          setDragOverTaskId(cardTask.id)
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDrop(e, column.id, cardTask.id, e.currentTarget)
                      }}
                      onDragEnd={clearDragState}
                      onClick={() => {
                        void loadTask(cardTask.id)
                        setOpenModal(true)
                      }}
                      className={`cursor-grab py-0 transition-all hover:border-primary/50 active:cursor-grabbing ${
                        isBeingDragged
                          ? 'border-dashed opacity-30'
                          : ''
                      } ${
                        isTarget
                          ? 'border-t-4 border-t-primary'
                          : ''
                      }`}
                    >
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium">
                          {cardTask.name}
                        </CardTitle>
                        {cardTask.ticketNote?.comment && (
                          <Separator orientation="horizontal" style={{ paddingTop: 1, paddingBottom: 1 }} />
                        )}
                        <div className="flex items-center justify-between">
                          {cardTask.ticketNote?.comment && (
                            <p className="text-xs text-muted-foreground">
                              {cardTask.ticketNote.comment}
                            </p>
                          )}
                          {cardTask.ticketNote?.name_user && (
                            <Avatar className="h-8 w-8 bg-none">
                              <AvatarImage src={cardTask.ticketNote.name_user} alt={cardTask.ticketNote.name_user} />
                              <AvatarFallback className="rounded-full bg-primary text-white">
                                {cardTask.ticketNote.name_user[0]}
                                {cardTask.ticketNote.name_user[1]}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}

                {columnTasks.length === 0 && isOverColumn && (
                  <div className="flex min-h-16 items-center justify-center rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 text-sm text-muted-foreground">
                    Solte a tarefa aqui
                  </div>
                )}
              </div>
            </div>
          )
        }) : (
          <p>Não há nada</p>
        )}
      </div>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!task) return
              void updateData(task)
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Informações do Cliente</DialogTitle>
              <DialogDescription>
                Acesse os dados do cliente e edite conforme a necessidade.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="flex max-h-120 flex-col overflow-hidden overflow-y-scroll p-2">
              <Field>
                <Label htmlFor="name" className="font-bold">Nome</Label>
                <Input id="name" value={task?.name ?? ''} onChange={(e) => setTask({ ...task!, name: e.target.value })} />
              </Field>
              <Field>
                <Label htmlFor="email" className="font-semibold">Email</Label>
                <Input id="email" value={task?.email ?? ''} onChange={(e) => setTask({ ...task!, email: e.target.value })} />
              </Field>
              <Field>
                <Label htmlFor="phone" className="font-semibold">Telefone</Label>
                <Input id="phone" value={task?.phone ?? ''} onChange={(e) => setTask({ ...task!, phone: e.target.value })} />
              </Field>
              <Field>
                <Label htmlFor="address" className="font-semibold">Endereço</Label>
                <Input id="address" value={task?.address ?? ''} onChange={(e) => setTask({ ...task!, address: e.target.value })} />
              </Field>
              <Field>
                <Label htmlFor="degree" className="font-semibold">Grau de instrução</Label>
                <Input id="degree" value={task?.degree ?? ''} onChange={(e) => setTask({ ...task!, degree: e.target.value })} />
              </Field>
              <Field>
                <Label htmlFor="bundle" className="font-semibold">Pacote</Label>
                <Input id="bundle" value={task?.bundle ?? ''} onChange={(e) => setTask({ ...task!, bundle: e.target.value })} />
              </Field>
              <Field>
                <Label htmlFor="amount" className="font-semibold">Valor</Label>
                <Input id="amount" value={formatCentsToBRL(task?.amount || 0)} onChange={(e) => setTask({ ...task!, amount: parseInt(e.target.value) || 0 })} />
              </Field>
              <Field>
                <Label htmlFor="comment" className="font-semibold">Comentário</Label>
                <textarea
                  id="comment"
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={task?.ticketNote?.comment ?? ''}
                  onChange={(e) => {
                    if (!task) return
                    setTask({
                      ...task,
                      ticketNote: {
                        ...task.ticketNote,
                        name_user: task.ticketNote?.name_user ?? '',
                        comment: e.target.value,
                      },
                    })
                  }}
                />
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">Atualizar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
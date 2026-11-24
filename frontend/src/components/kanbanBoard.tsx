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
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
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
  const [tasks, setTasks] = useState<TaskBasic[]>();
  const [task, setTask] = useState<TaskAll | null>(null)
  
  // No mobile, todas as colunas começam abertas.
  // No desktop, o estado não interfere: todas ficam abertas.
  const [expandedColumns, setExpandedColumns] = useState<Record<ColumnId, boolean>>({
    TO_DO: true,
    IN_PROGRESS: true,
    DONE: true,
  })
  
  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await getAllTasks();
        setTasks(response);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    }
    loadTasks();
  }, []);

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

  const handleDrop = async (
    e: React.DragEvent<HTMLElement>,
    targetStatus: ColumnId,
    targetTaskId?: string,
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const taskId = e.dataTransfer.getData('taskId') || draggedTaskId
    clearDragState()

    if (!taskId || !tasks) return

    const previousTasks = tasks
    const draggedTask = tasks.find((t) => t.id === taskId)
    if (!draggedTask) return

    // Remove a tarefa arrastada da lista atual
    const remainingTasks = tasks.filter((t) => t.id !== taskId)

    const updatedTask: TaskBasic = {
      ...draggedTask,
      status: targetStatus,
    }

    let newTasks: TaskBasic[]

    // Se soltou em cima de outro card, insere antes dele
    if (targetTaskId && targetTaskId !== taskId) {
      const targetIndex = remainingTasks.findIndex((t) => t.id === targetTaskId)

      if (targetIndex !== -1) {
        newTasks = [...remainingTasks]
        newTasks.splice(targetIndex, 0, updatedTask)
      } else {
        newTasks = [...remainingTasks, updatedTask]
      }
    } else {
      // Se soltou na coluna, insere no final das tarefas daquela coluna
      let lastTargetIndex = -1
      remainingTasks.forEach((t, index) => {
        if (t.status === targetStatus) {
          lastTargetIndex = index
        }
      })

      newTasks = [...remainingTasks]
      newTasks.splice(lastTargetIndex + 1, 0, updatedTask)
    }

    // Calcula a posição do card dentro da coluna de destino
    const columnTasksAfterDrop = newTasks.filter((t) => t.status === targetStatus)
    const newPosition = columnTasksAfterDrop.findIndex((t) => t.id === taskId)

    // 1. Efeito visual imediato na tela
    setTasks(newTasks)

    // 2. Envia para o back-end
    try {
      await updatePositionTask(taskId, {
        status: targetStatus,
        position: newPosition,
      })
    } catch (error) {
      console.error('Erro ao atualizar posição:', error)
      // 3. Se der erro no back, volta a lista como estava
      setTasks(previousTasks)
    }
  }

  async function updateData(task: TaskAll){
    try{
        const response  = await updateTask(task.id, task);
        console.log(response);
        setOpenModal(false);
    }catch(error){
        console.error('Erro ao atualizar dados:', error);
    }
  }

  async function loadTask(taskId: string) {
    const response = await getTaskById(taskId);
    if (response) {
      setTask(response);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {tasks ? COLUMNS.map((column)=> {
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
                onClick={() =>toggleColumn(column.id)}
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
                        onClick={() => { loadTask(task.id); setOpenModal(true); }}
                        className={`cursor-grab transition-all hover:border-primary/50 py-0 active:cursor-grabbing ${
                          isBeingDragged
                            ? 'border-dashed opacity-30'
                            : ''
                        }`}
                      >
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm font-medium">
                            {task.name}
                          </CardTitle>
                          {task.ticketNote?.comment && (
                            <Separator orientation='horizontal' style={{paddingTop:1,paddingBottom:1}}/>
                          )}
                          <div className="flex justify-between items-center">
                            {task.ticketNote?.comment && (
                              <p className="text-xs text-muted-foreground">
                                {task.ticketNote.comment}
                              </p>
                            )}
                            {task.ticketNote?.name_user && (
                              <Avatar className="h-8 w-8 bg-none">
                                <AvatarImage src={task.ticketNote.name_user} alt={task.ticketNote.name_user} />
                                <AvatarFallback className="rounded-full bg-primary text-white">{task.ticketNote.name_user[0]}{task.ticketNote.name_user[1]}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </CardHeader>
                      </Card>
                    </React.Fragment>
                  )
                })}
                <Dialog open={openModal} onOpenChange={setOpenModal}>
                  <DialogContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!task) return;
                        updateData(task);
                      }}
                    >
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Informações do Cliente</DialogTitle>
                        <DialogDescription>
                          Acesse os dados do cliente e edite conforme a necessidade.
                        </DialogDescription>
                      </DialogHeader>
                      <FieldGroup className="flex p-2 flex-col max-h-120 overflow-hidden overflow-y-scroll">
                        <Field>
                          <Label htmlFor="name" className="font-bold">Nome</Label>
                          <Input id="name" value={task?.name ?? ''} onChange={(e)=>setTask({...task!, name: e.target.value})} />
                        </Field>
                        <Field>
                          <Label htmlFor="email" className="font-semibold">Email</Label>
                          <Input id="email" value={task?.email ?? '' } onChange={(e)=>setTask({...task!, email: e.target.value})}  />
                        </Field>
                        <Field>
                          <Label htmlFor="phone" className="font-semibold">Telefone</Label>
                          <Input id="phone" value={task?.phone ?? ''} onChange={(e)=>setTask({...task!, phone: e.target.value})} />
                        </Field>
                        <Field>
                          <Label htmlFor="address" className="font-semibold">Endereço</Label>
                          <Input id="address" value={task?.address ?? ''} onChange={(e)=>setTask({...task!, address: e.target.value})} />
                        </Field>
                        <Field>
                          <Label htmlFor="degree" className="font-semibold">Grau de instrução</Label>
                          <Input id="degree" value={task?.degree ?? ''} onChange={(e)=>setTask({...task!, degree: e.target.value})} />
                        </Field>
                        <Field>
                          <Label htmlFor="bundle" className="font-semibold">Pacote</Label>
                          <Input id="bundle" value={task?.bundle ?? ''} onChange={(e)=>setTask({...task!, bundle: e.target.value})} />
                        </Field>
                        <Field>
                          <Label htmlFor="amount" className="font-semibold">Valor</Label>
                          <Input id="amount" value={formatCentsToBRL(task?.amount || 0)} onChange={(e)=>setTask({...task!, amount: parseInt(e.target.value)})} />
                        </Field>
                        <Field>
                          <Label htmlFor="comment" className="font-semibold">Comentário</Label>
                          <textarea id="comment" className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={task?.ticketNote?.comment ?? ''} onChange={(e) => { if (!task) return; setTask({ ...task, ticketNote: { ...task.ticketNote, name_user: task.ticketNote?.name_user ?? '', comment: e.target.value } }); }} />                        
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
        }):(
          <p>Não há nada</p>
        )}
      </div>
    </div>
  )
}
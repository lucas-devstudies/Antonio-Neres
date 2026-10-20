import { KanbanBoard } from "@/components/kanbanBoard";

export default function Dashboard() {
    return <div className="flex flex-col w-full h-full bg-kanban p-4 rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-foreground/80">Registro de Alunos</h1>
        <KanbanBoard />
    </div>
}
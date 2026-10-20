import { KanbanBoard } from "@/components/kanbanBoard";

export default function Dashboard() {
    return <div className="flex flex-col w-full h-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Registro de Alunos</h1>
        <KanbanBoard />
    </div>
}
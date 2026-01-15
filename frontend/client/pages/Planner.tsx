import { MainLayout } from "../components/layout/MainLayout";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { mockTasks } from "../mock-data";

export default function Planner() {
  return (
    <MainLayout>
      <KanbanBoard initialTasks={mockTasks} />
    </MainLayout>
  );
}

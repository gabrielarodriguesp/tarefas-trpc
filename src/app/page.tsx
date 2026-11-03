import Link from "next/link";
import { ListaTarefas } from "@/components/ListaTarefas";
import { serverCaller } from "@/server/caller";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sucesso?: string }>;
}) {
  const { sucesso } = await searchParams;
  const inicial = await serverCaller().tarefa.listar({ limit: 10 });

  return (
    <main>
      <header>
        <h1>Tarefas</h1>
        <Link href="/tarefas/nova">Nova tarefa</Link>
      </header>
      <ListaTarefas
        inicial={inicial}
        sucesso={sucesso === "criada" || sucesso === "atualizada" ? sucesso : undefined}
      />
    </main>
  );
}

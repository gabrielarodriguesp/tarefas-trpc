import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { TarefaForm } from "@/components/TarefaForm";
import { serverCaller } from "@/server/caller";

export const dynamic = "force-dynamic";

export default async function EditarTarefa({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tarefa = await serverCaller()
    .tarefa.buscarPorId({ id })
    .catch((e: unknown) => {
      if (e instanceof TRPCError && e.code === "NOT_FOUND") notFound();
      throw e;
    });

  return (
    <main>
      <h1>Editar tarefa</h1>
      <TarefaForm tarefa={tarefa} />
    </main>
  );
}

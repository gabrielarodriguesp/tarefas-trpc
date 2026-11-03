import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { tarefaInput } from "../tarefas/schema";
import { getStore } from "../tarefas/store";

const naoEncontrada = () =>
  new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada" });

export const tarefaRouter = router({
  criar: publicProcedure
    .input(tarefaInput)
    .mutation(({ input }) => getStore().criar(input)),

  listar: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
        cursor: z.object({ dataCriacao: z.number(), id: z.string() }).nullish(),
      }),
    )
    .query(({ input }) => getStore().listar(input)),

  buscarPorId: publicProcedure.input(z.object({ id: z.string() })).query(({ input }) => {
    const tarefa = getStore().buscar(input.id);
    if (!tarefa) throw naoEncontrada();
    return tarefa;
  }),

  atualizar: publicProcedure
    .input(tarefaInput.partial().extend({ id: z.string() }))
    .mutation(({ input: { id, ...campos } }) => {
      const tarefa = getStore().atualizar(id, campos);
      if (!tarefa) throw naoEncontrada();
      return tarefa;
    }),

  deletar: publicProcedure.input(z.object({ id: z.string() })).mutation(({ input }) => {
    if (!getStore().deletar(input.id)) throw naoEncontrada();
    return { id: input.id };
  }),
});

import { afterEach, expect, it, vi } from "vitest";
import { createCaller } from "@/server/routers/_app";
import { criarStore } from "@/server/tarefas/store";
import type { Cursor, Tarefa } from "@/server/tarefas/schema";

afterEach(() => vi.restoreAllMocks());

const caller = createCaller({});

it("rejeita título vazio ou em branco", async () => {
  const { id } = await caller.tarefa.criar({ titulo: "Existente" });
  for (const titulo of ["", "   "]) {
    const esperado = { code: "BAD_REQUEST", message: expect.stringContaining("O título é obrigatório") };
    await expect(caller.tarefa.criar({ titulo })).rejects.toMatchObject(esperado);
    await expect(caller.tarefa.atualizar({ id, titulo })).rejects.toMatchObject(esperado);
  }
});

it("atualizar e deletar inexistentes", async () => {
  const esperado = { code: "NOT_FOUND", message: "Tarefa não encontrada" };
  await expect(caller.tarefa.atualizar({ id: "nao-existe", titulo: "x" })).rejects.toMatchObject(esperado);
  await expect(caller.tarefa.deletar({ id: "nao-existe" })).rejects.toMatchObject(esperado);
});

it("paginação sobrevive à exclusão", async () => {
  const store = criarStore();
  const criadas = Array.from({ length: 25 }, (_, i) => store.criar({ titulo: `Tarefa ${i}` }));
  let excluida = "";
  const vistos: Tarefa[] = [];
  let cursor: Cursor | undefined;
  do {
    const pagina = store.listar({ limit: 10, cursor });
    vistos.push(...pagina.itens);
    cursor = pagina.proximoCursor ?? undefined;
    if (vistos.length === 10 && cursor) store.deletar((excluida = cursor.id));
  } while (cursor);
  const ids = vistos.map((t) => t.id);
  expect(new Set(ids).size).toBe(ids.length);
  const restantes = criadas.map((t) => t.id).filter((id) => id !== excluida);
  expect(ids.filter((id) => id !== excluida).sort()).toEqual(restantes.sort());
});

it("empate de dataCriacao não perde tarefas", () => {
  vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
  const store = criarStore();
  const criadas = [1, 2, 3].map((n) => store.criar({ titulo: `Empatada ${n}` }));
  const ids: string[] = [];
  let cursor: Cursor | undefined;
  do {
    const pagina = store.listar({ limit: 1, cursor });
    ids.push(...pagina.itens.map((t) => t.id));
    cursor = pagina.proximoCursor ?? undefined;
  } while (cursor);
  expect(ids.sort()).toEqual(criadas.map((t) => t.id).sort());
});

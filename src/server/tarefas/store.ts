import type { Cursor, Tarefa } from "./schema";
import { seed } from "./seed";

type Campos = { titulo?: string; descricao?: string };

type TarefaStore = ReturnType<typeof criarStore>;

const maisRecentePrimeiro = (a: Cursor, b: Cursor) =>
  b.dataCriacao - a.dataCriacao || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0);

export function criarStore() {
  const tarefas = new Map<string, Tarefa>();

  return {
    criar(input: { titulo: string; descricao?: string }): Tarefa {
      const tarefa: Tarefa = {
        id: crypto.randomUUID(),
        titulo: input.titulo,
        descricao: input.descricao || undefined,
        dataCriacao: Date.now(),
      };
      tarefas.set(tarefa.id, tarefa);
      return tarefa;
    },

    listar({ limit, cursor }: { limit: number; cursor?: Cursor | null }) {
      // Cursor por chave, não offset: exclusões não deslocam a página
      const restantes = [...tarefas.values()]
        .sort(maisRecentePrimeiro)
        .filter((t) => !cursor || maisRecentePrimeiro(cursor, t) < 0);
      const itens = restantes.slice(0, limit);
      const ultimo = itens[itens.length - 1];
      const proximoCursor =
        restantes.length > limit
          ? { dataCriacao: ultimo.dataCriacao, id: ultimo.id }
          : null;
      return { itens, proximoCursor };
    },

    buscar(id: string): Tarefa | undefined {
      return tarefas.get(id);
    },

    atualizar(id: string, input: Campos): Tarefa | undefined {
      const atual = tarefas.get(id);
      if (!atual) return undefined;
      const nova: Tarefa = {
        ...atual,
        titulo: input.titulo ?? atual.titulo,
        descricao:
          input.descricao === undefined
            ? atual.descricao
            : input.descricao || undefined,
      };
      tarefas.set(id, nova);
      return nova;
    },

    deletar(id: string): boolean {
      return tarefas.delete(id);
    },
  };
}

// globalThis: o Next pode carregar este módulo mais de uma vez
const compartilhado = globalThis as { __tarefaStore?: TarefaStore };

export function getStore(): TarefaStore {
  if (!compartilhado.__tarefaStore) {
    const store = criarStore();
    const quantidade = Math.min(Number(process.env.SEED_TAREFAS) || 0, seed.length);
    const base = Date.now() - quantidade * 3_600_000;
    // Mais antiga primeiro, com 1h de intervalo
    seed.slice(0, quantidade).reverse().forEach((item, i) => {
      const tarefa = store.criar(item);
      tarefa.dataCriacao = base + i * 3_600_000;
    });
    compartilhado.__tarefaStore = store;
  }
  return compartilhado.__tarefaStore;
}

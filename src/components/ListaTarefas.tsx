"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import type { Cursor, Tarefa } from "@/server/tarefas/schema";

type Pagina = { itens: Tarefa[]; proximoCursor: Cursor | null };

const formatarData = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

const mensagens = { criada: "Tarefa criada", atualizada: "Tarefa atualizada" };

export function ListaTarefas({
  inicial,
  sucesso,
}: {
  inicial: Pagina;
  sucesso?: keyof typeof mensagens;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const sentinela = useRef<HTMLDivElement>(null);

  const lista = useInfiniteQuery({
    ...trpc.tarefa.listar.infiniteQueryOptions(
      { limit: 10 },
      { getNextPageParam: (ultima) => ultima.proximoCursor ?? undefined },
    ),
    initialData: { pages: [inicial], pageParams: [null] },
    staleTime: 5000,
  });

  const excluir = useMutation(
    trpc.tarefa.deletar.mutationOptions({
      onSettled: () => queryClient.invalidateQueries(trpc.tarefa.listar.pathFilter()),
    }),
  );

  useEffect(() => {
    if (sucesso) window.history.replaceState(null, "", "/");
  }, [sucesso]);

  const { hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = lista;
  const podeCarregar = hasNextPage && !isFetchingNextPage && !isFetchNextPageError;

  useEffect(() => {
    const alvo = sentinela.current;
    if (!alvo || !podeCarregar) return;
    const observer = new IntersectionObserver((entradas) => {
      if (entradas[0].isIntersecting) fetchNextPage();
    });
    observer.observe(alvo);
    return () => observer.disconnect();
  }, [podeCarregar, fetchNextPage]);

  const itens = lista.data.pages.flatMap((pagina) => pagina.itens);

  return (
    <>
      {sucesso && excluir.isIdle && <p role="status">{mensagens[sucesso]}</p>}
      {excluir.isSuccess && <p role="status">Tarefa excluída</p>}
      {excluir.isError && <p role="alert">{excluir.error.message}</p>}

      {itens.length === 0 && !hasNextPage ? (
        <p>Nenhuma tarefa cadastrada</p>
      ) : (
        <ul>
          {itens.map((tarefa) => (
            <li key={tarefa.id} data-testid="tarefa-item">
              <div>
                <h2>{tarefa.titulo}</h2>
                {tarefa.descricao && <p>{tarefa.descricao}</p>}
                <time className="data">{formatarData.format(tarefa.dataCriacao)}</time>
              </div>
              <div className="acoes">
                <Link href={`/tarefas/${tarefa.id}/editar`}>Editar</Link>
                <button
                  type="button"
                  onClick={() => excluir.mutate({ id: tarefa.id })}
                  disabled={excluir.isPending && excluir.variables?.id === tarefa.id}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isFetchNextPageError && (
        <div role="alert">
          <p>Não foi possível carregar mais tarefas</p>
          <button type="button" onClick={() => fetchNextPage()}>
            Tentar novamente
          </button>
        </div>
      )}
      <div ref={sentinela} />
      {isFetchingNextPage && <p className="muted">Carregando...</p>}
      {!hasNextPage && itens.length > 0 && <p className="muted">Fim da lista</p>}
    </>
  );
}

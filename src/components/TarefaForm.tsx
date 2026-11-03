"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { tarefaInput, type Tarefa } from "@/server/tarefas/schema";

export function TarefaForm({ tarefa }: { tarefa?: Tarefa }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [titulo, setTitulo] = useState(tarefa?.titulo ?? "");
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? "");
  const [erro, setErro] = useState<string | null>(null);

  const aoSalvar = async () => {
    await queryClient.invalidateQueries(trpc.tarefa.listar.pathFilter());
    router.push(tarefa ? "/?sucesso=atualizada" : "/?sucesso=criada");
    router.refresh();
  };
  const criar = useMutation(trpc.tarefa.criar.mutationOptions({ onSuccess: aoSalvar }));
  const atualizar = useMutation(
    trpc.tarefa.atualizar.mutationOptions({ onSuccess: aoSalvar }),
  );
  const salvar = tarefa ? atualizar : criar;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const resultado = tarefaInput.safeParse({ titulo, descricao });
    if (!resultado.success) {
      setErro(resultado.error.issues[0].message);
      return;
    }
    setErro(null);
    // descricao vai mesmo vazia, para poder apagá-la
    if (tarefa) atualizar.mutate({ id: tarefa.id, ...resultado.data });
    else criar.mutate(resultado.data);
  }

  const mensagem = erro ?? salvar.error?.message;

  return (
    <form onSubmit={enviar} noValidate>
      <div>
        <label htmlFor="titulo">Título</label>
        <input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          rows={5}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>
      {mensagem && <p role="alert">{mensagem}</p>}
      <div className="botoes">
        <button type="submit" className="primario" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando..." : "Salvar"}
        </button>
        <Link href="/">Cancelar</Link>
      </div>
    </form>
  );
}

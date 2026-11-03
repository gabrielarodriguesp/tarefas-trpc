import { z } from "zod";

export type Tarefa = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: number;
};

export type Cursor = { dataCriacao: number; id: string };

export const tarefaInput = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "O título é obrigatório")
    .max(120, "O título deve ter no máximo 120 caracteres"),
  descricao: z.string().trim().max(1000).optional(),
});

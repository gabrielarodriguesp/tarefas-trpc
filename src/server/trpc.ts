import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";

const t = initTRPC.create({
  errorFormatter({ shape, error }) {
    if (error.cause instanceof ZodError) {
      return { ...shape, message: error.cause.issues[0].message };
    }
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

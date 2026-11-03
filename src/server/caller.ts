import "server-only";
import { createCaller } from "@/server/routers/_app";

export const serverCaller = () => createCaller({});

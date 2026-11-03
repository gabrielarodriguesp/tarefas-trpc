import Link from "next/link";

export default function NaoEncontrada() {
  return (
    <main>
      <h1>Página não encontrada</h1>
      <p>
        <Link href="/">Voltar para a lista</Link>
      </p>
    </main>
  );
}

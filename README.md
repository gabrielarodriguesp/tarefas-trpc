# Tarefas

Gerenciador de tarefas em Next.js com tRPC: lista com rolagem infinita, criação, edição e exclusão.

## Como rodar a aplicação

Através do Docker:

    sh iniciar.sh

Obs: É preciso utilizar a primeira porta livre a partir da 3000. O endereço aparece no final.

No Windows use `iniciar.cmd`. 
Para sair da aplicação, basta digitar o comando `docker compose down`.

Sem Docker, com Node 24:

    npm install && npm run dev

Comando para testes:

    npm test

A app vem com 30 tarefas de exemplo.

## Outras informações

- Versão do NextJS: 15.5.28;
- Versão do TypeScript: 5.9.3;
- As tarefas ficam em memória e se perdem ao reiniciar. 
- Excluir uma tarefa não desloca a página seguinte.
- A primeira página vem renderizada no servidor e as seguintes são carregadas ao rolar.
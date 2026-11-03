#!/bin/sh

cd "$(dirname "$0")" || exit 1

if ! docker info >/dev/null 2>&1; then
  echo "O Docker não está rodando." >&2
  exit 1
fi

porta=3000
until saida=$(env UID="$(id -u)" GID="$(id -g)" PORT="$porta" docker compose up -d dev 2>&1); do
  case "$saida" in
    *"already allocated"* | *"in use"* | *"not available"*) ;;
    *)
      echo "$saida" >&2
      exit 1
      ;;
  esac
  porta=$((porta + 1))
  if [ "$porta" -gt 3100 ]; then
    echo "Nenhuma porta livre entre 3000 e 3100." >&2
    exit 1
  fi
done

echo "Iniciando na porta $porta."
tentativas=0
until docker compose exec -T dev node -e "fetch('http://127.0.0.1:3000').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))" >/dev/null 2>&1; do
  tentativas=$((tentativas + 1))
  if [ "$tentativas" -ge 300 ]; then
    echo "O app não respondeu. Veja: docker compose logs dev" >&2
    exit 1
  fi
  sleep 2
done

echo "Pronto: http://127.0.0.1:$porta"

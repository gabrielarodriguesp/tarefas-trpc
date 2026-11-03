@echo off
rem Sobe o app na primeira porta livre a partir da 3000
setlocal
cd /d "%~dp0"
set "log=%TEMP%\tarefas-iniciar.log"

docker info >nul 2>&1
if errorlevel 1 (
  echo O Docker nao esta rodando.
  exit /b 1
)

set porta=3000
:tentar
set PORT=%porta%
docker compose up -d dev >"%log%" 2>&1
if not errorlevel 1 goto esperar
findstr /i /c:"already allocated" /c:"in use" /c:"not available" /c:"access permissions" /c:"socket" "%log%" >nul
if errorlevel 1 (
  type "%log%"
  exit /b 1
)
set /a porta+=1
if %porta% gtr 3100 (
  echo Nenhuma porta livre entre 3000 e 3100.
  exit /b 1
)
goto tentar

:esperar
echo Iniciando na porta %porta%. A primeira vez instala as dependencias e leva alguns minutos...
set tentativas=0
:verificar
docker compose exec -T dev node -e "fetch('http://127.0.0.1:3000').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))" >nul 2>&1
if not errorlevel 1 goto pronto
set /a tentativas+=1
if %tentativas% geq 300 (
  echo O app nao respondeu. Veja: docker compose logs dev
  exit /b 1
)
timeout /t 2 /nobreak >nul
goto verificar

:pronto
echo Pronto: http://127.0.0.1:%porta%
echo Para parar: docker compose down

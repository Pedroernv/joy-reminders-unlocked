# Build nativo (Capacitor) — SmartSchoolPro

O app web continua funcionando normalmente no navegador/PWA. No build nativo,
as notificações passam a ser agendadas pelo sistema operativo (funcionam com o
app fechado), sempre **1 hora antes do início de cada aula**, com repetição semanal.

## Primeira configuração (na sua máquina, fora do Lovable)

```bash
bun install
bunx cap add android      # requer Android Studio + JDK 17
bunx cap add ios          # requer macOS + Xcode

bun run cap:sync          # gera capacitor-www/ e sincroniza os projetos nativos
bun run cap:android       # abre no Android Studio
bun run cap:ios           # abre no Xcode
```

`capacitor-www/` é gerado a partir de `public/`, usando `public/app.html`
como `index.html` do app nativo.

## Android — permissões necessárias

Em `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
<uses-permission android:name="android.permission.USE_EXACT_ALARM"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<uses-permission android:name="android.permission.VIBRATE"/>
```

Ícone da barra de status: adicione `ic_stat_icon.png` em
`android/app/src/main/res/drawable/`. Som personalizado: `beep.wav` em
`android/app/src/main/res/raw/`.

## iOS

Sons personalizados devem ser adicionados ao target no Xcode (`beep.wav`).
A permissão é pedida na primeira ativação de notificações dentro do app.

## Como funciona no app

- Canal Android `ssp-aulas` com importância máxima (pop-up heads-up + som).
- Um agendamento semanal recorrente por sessão (`schedule.on` + `repeats`),
  reagendado automaticamente ao salvar disciplinas e ao voltar ao primeiro plano.
- Toque na notificação abre o modal de alerta da aula correspondente.

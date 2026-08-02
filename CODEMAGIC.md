# Build no Codemagic — SmartSchoolPro

A pasta `android/` **não** é versionada. O Codemagic a cria no build com
`npx cap add android` e depois assina o AAB/APK com a keystore configurada na
plataforma.

## 1. Keystore

Uma keystore de release já foi gerada para este app:

- Arquivo: `smartschoolpro.keystore`
- Alias: `smartschoolpro`
- Senha do keystore e da chave: **a mesma** (ver `password.txt` entregue junto)
- Algoritmo: RSA 2048, validade ~30 anos

> Guarde este arquivo e a senha num local seguro (gestor de senhas). Se perder,
> não será possível publicar atualizações do app no Google Play.

## 2. Configurar no Codemagic

1. **Teams/App settings → Code signing identities → Android keystores**
2. Faça upload de `smartschoolpro.keystore` com:
   - Reference name: `smartschoolpro_keystore` (usado no `codemagic.yaml`)
   - Keystore password: a senha fornecida
   - Key alias: `smartschoolpro`
   - Key password: a mesma senha
3. (Opcional) Crie o grupo de variáveis `google_play` com
   `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS` para publicação automática e descomente
   o bloco `google_play` no `codemagic.yaml`.

## 3. Workflows disponíveis

| Workflow | O que faz | Artefactos |
| --- | --- | --- |
| `android-release` | Build assinado de produção | `.aab` + `.apk` |
| `android-debug` | APK de teste rápido | `.apk` debug |

Etapas de cada build: `npm ci` → `npm run cap:build` (gera `capacitor-www/` a
partir de `public/app.html`) → `cap add/sync android` →
`node scripts/android-prepare.mjs` (permissões de notificação + versionCode) →
`gradlew bundleRelease assembleRelease`.

## 4. Notificações

`scripts/android-prepare.mjs` injecta no manifest:
`POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`,
`RECEIVE_BOOT_COMPLETED`, `VIBRATE`, `INTERNET` — necessárias para os alertas
de aula 1 hora antes, com o app fechado.

Opcional (adicione manualmente se quiser personalizar):
`android/app/src/main/res/drawable/ic_stat_icon.png` (ícone da barra) e
`android/app/src/main/res/raw/beep.wav` (som).

## 5. iOS (quando quiser)

Adicione um workflow `ios-release` com `instance_type: mac_mini_m2`,
`npx cap add ios`, `xcode-project use-profiles` e `xcode-project build-ipa`,
depois de configurar o certificado/perfil de distribuição no Codemagic.
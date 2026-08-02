// Prepara o projeto Android gerado pelo Capacitor para o build no Codemagic:
// 1. Garante as permissões necessárias para notificações locais exatas.
// 2. Define versionCode/versionName a partir das variáveis do CI (opcional).
import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'android/app/src/main/AndroidManifest.xml');
const gradlePath = path.join(root, 'android/app/build.gradle');

const PERMISSIONS = [
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.SCHEDULE_EXACT_ALARM',
  'android.permission.USE_EXACT_ALARM',
  'android.permission.RECEIVE_BOOT_COMPLETED',
  'android.permission.VIBRATE',
  'android.permission.INTERNET',
];

const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

async function patchManifest() {
  if (!(await exists(manifestPath))) {
    console.warn('AndroidManifest.xml não encontrado — rode `npx cap add android` primeiro.');
    return;
  }
  let xml = await readFile(manifestPath, 'utf8');
  const missing = PERMISSIONS.filter((p) => !xml.includes(`"${p}"`));
  if (missing.length) {
    const block = missing.map((p) => `    <uses-permission android:name="${p}"/>`).join('\n');
    xml = xml.replace('</manifest>', `${block}\n</manifest>`);
    await writeFile(manifestPath, xml, 'utf8');
  }
  console.log(
    missing.length
      ? `Permissões adicionadas: ${missing.join(', ')}`
      : 'Permissões já presentes no manifest.',
  );
}

async function patchVersion() {
  const buildNumber = process.env.BUILD_NUMBER || process.env.PROJECT_BUILD_NUMBER;
  if (!buildNumber || !(await exists(gradlePath))) return;
  let gradle = await readFile(gradlePath, 'utf8');
  gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${Number(buildNumber)}`);
  gradle = gradle.replace(/versionName\s+"[^"]*"/, `versionName "1.0.${Number(buildNumber)}"`);
  await writeFile(gradlePath, gradle, 'utf8');
  console.log(`versionCode definido para ${buildNumber}`);
}

await patchManifest();
await patchVersion();
#!/usr/bin/env node

/**
 * Script para testar deeplinks no Timely App
 * 
 * Uso:
 *   npm run deeplink:entry
 *   npm run deeplink:exit
 *   npm run deeplink:custom "2024-01-01T10:00:00Z"
 *   npm run deeplink:expo-go  (para testar no Expo Go)
 */

const { execSync } = require('child_process');
const os = require('os');

const type = process.argv[2] || 'entry';
const customTime = process.argv[3];
const isExpoGo = process.argv[2] === 'expo-go' || process.argv[3] === 'expo-go';

// Gera a hora atual em formato ISO se não fornecida
const getTime = () => {
  if (customTime && customTime !== 'expo-go') {
    return customTime;
  }
  return new Date().toISOString();
};

// Monta a URL do deeplink
const time = getTime();
let url;

if (isExpoGo) {
  // Para Expo Go, usa o formato exp://
  // Você pode ajustar o IP e porta conforme necessário
  const expoUrl = process.env.EXPO_URL || 'exp://127.0.0.1:8081';
  url = `${expoUrl}/--/timely?time=${encodeURIComponent(time)}&type=${type}`;
} else {
  // Para build nativo, usa o scheme customizado
  url = `timely://?time=${encodeURIComponent(time)}&type=${type}`;
}

console.log(`🔗 Testando deeplink: ${url}\n`);

const platform = os.platform();

try {
  if (isExpoGo) {
    // Expo Go - usa uri-scheme
    console.log('📱 Abrindo no Expo Go...');
    if (platform === 'darwin') {
      execSync(`npx uri-scheme open "${url}" --ios`, { stdio: 'inherit' });
    } else {
      execSync(`npx uri-scheme open "${url}" --android`, { stdio: 'inherit' });
    }
    console.log('✅ Deeplink enviado para o Expo Go');
  } else if (platform === 'darwin') {
    // macOS - iOS Simulator
    console.log('📱 Abrindo no iOS Simulator...');
    execSync(`xcrun simctl openurl booted "${url}"`, { stdio: 'inherit' });
    console.log('✅ Deeplink enviado para o simulador iOS');
  } else if (platform === 'linux' || platform === 'win32') {
    // Linux/Windows - Android Emulator
    console.log('📱 Abrindo no Android Emulator...');
    execSync(
      `adb shell am start -W -a android.intent.action.VIEW -d "${url}" com.timelyapp`,
      { stdio: 'inherit' }
    );
    console.log('✅ Deeplink enviado para o emulador Android');
  } else {
    console.log('⚠️  Plataforma não suportada. Use manualmente:');
    console.log(`   ${url}`);
  }
} catch (error) {
  console.error('❌ Erro ao enviar deeplink:', error.message);
  console.log('\n📋 Tente manualmente:');
  if (isExpoGo) {
    console.log(`   iOS: npx uri-scheme open "${url}" --ios`);
    console.log(`   Android: npx uri-scheme open "${url}" --android`);
  } else {
    console.log(`   iOS: xcrun simctl openurl booted "${url}"`);
    console.log(`   Android: adb shell am start -W -a android.intent.action.VIEW -d "${url}" com.timelyapp`);
  }
  console.log(`\n   Ou cole no navegador: ${url}`);
  process.exit(1);
}



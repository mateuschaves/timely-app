#!/usr/bin/env node

/**
 * Script para testar Quick Actions do Timely App
 * 
 * Uso:
 *   npm run test:quick-action
 */

const { execSync } = require('child_process');
const os = require('os');

const platform = os.platform();

// Gera a hora atual em formato ISO
const getCurrentTime = () => {
  return new Date().toISOString();
};

// Monta a URL do deeplink para quick action
const time = getCurrentTime();
const url = `timely://?time=${encodeURIComponent(time)}&quick-action=true`;

console.log(`🔗 Testando Quick Action: ${url}\n`);

try {
  if (platform === 'darwin') {
    // macOS - iOS Simulator
    console.log('📱 Abrindo Quick Action no iOS Simulator...');
    execSync(`xcrun simctl openurl booted "${url}"`, { stdio: 'inherit' });
    console.log('✅ Quick Action enviado para o simulador iOS');
    console.log('\n📝 Observações:');
    console.log('   - O app deve abrir automaticamente');
    console.log('   - Deve navegar para a tela Home');
    console.log('   - Deve registrar o ponto com a hora atual');
  } else {
    console.log('⚠️  Este script funciona apenas no macOS com iOS Simulator');
    console.log('\n📋 Para testar manualmente:');
    console.log(`   iOS: xcrun simctl openurl booted "${url}"`);
    console.log(`\n   Ou cole no navegador do simulador: ${url}`);
  }
} catch (error) {
  console.error('❌ Erro ao enviar Quick Action:', error.message);
  console.log('\n📋 Tente manualmente:');
  if (platform === 'darwin') {
    console.log(`   iOS: xcrun simctl openurl booted "${url}"`);
  }
  console.log(`\n   Ou cole no navegador: ${url}`);
  process.exit(1);
}


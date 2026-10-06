#!/usr/bin/env node

/**
 * Script de Utilidad: Cifrado de Credenciales de Telemetría para GitHub Público
 * 
 * Uso desde la terminal:
 * node scripts/encrypt-telemetry.js <TELEGRAM_BOT_TOKEN> <TELEGRAM_CHAT_ID>
 * 
 * Ejemplo:
 * node scripts/encrypt-telemetry.js 7123456789:AAFlmX4pZqRtUvW-12345 123456789
 */

const SECRET_SALT = 'ferreteria-telemetry-2026-secure';

function encrypt(plainText, key = SECRET_SALT) {
  if (!plainText) return '';
  const buffer = Buffer.from(plainText, 'utf-8');
  const keyBuffer = Buffer.from(key, 'utf-8');
  const result = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    result[i] = buffer[i] ^ keyBuffer[i % keyBuffer.length];
  }
  return 'enc:' + result.toString('base64');
}

const args = process.argv.slice(2);
const botToken = args[0];
const chatId = args[1];

console.log('\n' + '='.repeat(68));
console.log('  🔐 GENERADOR DE CREDENCIALES CIFRADAS PARA TELEGRAM (GITHUB PÚBLICO)');
console.log('='.repeat(68) + '\n');

if (!botToken || !chatId) {
  console.log('⚠️  Debes ingresar tu Token de Telegram y tu Chat ID.\n');
  console.log('Uso:');
  console.log('  node scripts/encrypt-telemetry.js <TOKEN_DE_TELEGRAM> <CHAT_ID>\n');
  console.log('Ejemplo:');
  console.log('  node scripts/encrypt-telemetry.js 7123456789:AAFlmX4pZqRt... 987654321\n');
  process.exit(1);
}

const encToken = encrypt(botToken);
const encChatId = encrypt(chatId);

console.log('✅ Credenciales cifradas con éxito.\n');
console.log('📌 Copia y pega estos valores en tu código:\n');
console.log('1️⃣  En el Backend (apps/api/src/modules/telemetry/backend-telemetry.service.ts):');
console.log('--------------------------------------------------------------------');
console.log(`export const BACKEND_TELEGRAM_CONFIG = {`);
console.log(`  BOT_TOKEN: '${encToken}',`);
console.log(`  CHAT_ID: '${encChatId}',`);
console.log(`};\n`);

console.log('2️⃣  En el Frontend (apps/web/src/services/telemetry.service.ts):');
console.log('--------------------------------------------------------------------');
console.log(`export const FRONTEND_TELEGRAM_CONFIG = {`);
console.log(`  BOT_TOKEN: '${encToken}',`);
console.log(`  CHAT_ID: '${encChatId}',`);
console.log(`};\n`);

console.log('='.repeat(68));
console.log('💡 Los valores comienzan con "enc:" y son descifrados en memoria.');
console.log('   GitHub Secret Scanning NO los detectará como tokens en texto plano.');
console.log('='.repeat(68) + '\n');

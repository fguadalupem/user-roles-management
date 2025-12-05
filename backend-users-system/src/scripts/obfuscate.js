const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const obfuscatedPath = path.join(__dirname, '../dist-obfuscated');

// Configuración de ofuscación (nivel medio para balance rendimiento/seguridad)
const obfuscationOptions = {
  compact: true,
  controlFlowFlattening: false, // Reducir impacto en rendimiento
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: true,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: false, // Mejor rendimiento
  renameGlobals: false,
  selfDefending: false, // Para SQLite mejor desactivado
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 5,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

function obfuscateFile(filePath, outputPath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, obfuscationOptions).getObfuscatedCode();
    
    // Crear directorio si no existe
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, obfuscatedCode);
    console.log(`✅ Ofuscado: ${path.relative(distPath, filePath)}`);
  } catch (error) {
    console.error(`❌ Error ofuscando ${filePath}:`, error.message);
  }
}

function processDirectory(dir, outputDir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const relativePath = path.relative(distPath, filePath);
    const outputPath = path.join(outputDir, relativePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath, outputDir);
    } else if (file.endsWith('.js')) {
      obfuscateFile(filePath, outputPath);
    } else {
      // Copiar archivos no-JS sin modificar
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.copyFileSync(filePath, outputPath);
    }
  });
}

console.log('🔒 Iniciando ofuscación del código...\n');

// Limpiar directorio de salida
if (fs.existsSync(obfuscatedPath)) {
  fs.rmSync(obfuscatedPath, { recursive: true });
}

// Procesar archivos
processDirectory(distPath, obfuscatedPath);

console.log('\n✨ Ofuscación completada!');
console.log(`📁 Código ofuscado en: ${obfuscatedPath}`);

# 3. Agregar scripts en package.json

{
  "scripts": {
    "build": "nest build",
    "build:prod": "nest build && npm run obfuscate",
    "obfuscate": "node scripts/obfuscate.js",
    "start:obfuscated": "node dist-obfuscated/main.js"
  }
}


import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
// const fs = require('fs');
// const path = require('path');
// const archiver = require('archiver');

const pluginName = 'cotizador-interiores';
const outputFile = `${pluginName}.zip`;

// Eliminar ZIP anterior si existe
if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
  console.log('🗑️  ZIP anterior eliminado');
}

// Crear el stream de escritura
const output = fs.createWriteStream(outputFile);
const archive = archiver('zip', {
  zlib: { level: 9 } // Máxima compresión
});

// Listeners
output.on('close', function() {
  console.log('✅ Plugin empaquetado exitosamente!');
  console.log(`📦 Tamaño: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📁 Archivo: ${outputFile}`);
  console.log('\n🚀 Listo para subir a WordPress!');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

console.log('📦 Creando ZIP del plugin...\n');

// Archivos y carpetas a incluir
const filesToInclude = [
  'cotizador-interiores.php',
  'README.md',
  'includes/',
  'admin/',
  'public/',
  'build/'
];

// Archivos y carpetas a EXCLUIR
const filesToExclude = [
  'node_modules',
  'src',
  'dist',
  'index.html',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'build-plugin.js',
  '.git',
  '.gitignore',
  '*.zip'
];

// Función para verificar si un archivo debe ser excluido
function shouldExclude(filePath) {
  return filesToExclude.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(filePath);
    }
    return filePath.includes(pattern);
  });
}

// Agregar archivos al ZIP
filesToInclude.forEach(item => {
  const itemPath = path.resolve(item);
  
  if (!fs.existsSync(itemPath)) {
    console.log(`⚠️  ${item} no existe, saltando...`);
    return;
  }
  
  const stats = fs.statSync(itemPath);
  
  if (stats.isDirectory()) {
    archive.directory(itemPath, `${pluginName}/${item}`, (entry) => {
      if (shouldExclude(entry.name)) {
        return false;
      }
      return entry;
    });
    console.log(`📁 Agregando carpeta: ${item}`);
  } else {
    archive.file(itemPath, { name: `${pluginName}/${item}` });
    console.log(`📄 Agregando archivo: ${item}`);
  }
});

// Finalizar el archivo
archive.finalize();
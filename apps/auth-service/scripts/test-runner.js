// Importamos módulos nativos de Node.js
const { execSync } = require('child_process'); // Para ejecutar comandos de terminal
const path = require('path'); // Para construir rutas de archivos

// 1. Obtenemos el nombre del test de los argumentos de la línea de comandos.
// process.argv es un array con los argumentos. El nuestro será el tercero.
// Ejemplo: ['node', 'scripts/test-runner.js', 'db']
const testName = process.argv[2];

// 2. Si no se proporciona un nombre, mostramos un error y salimos.
if (!testName) {
  console.error('❌ Error: Debes especificar el nombre del test a ejecutar.');
  console.log('✅ Ejemplo: npm run test -- db');
  process.exit(1); // Termina el script con un código de error
}

// 3. Construimos la ruta completa al archivo de test.
const testFilePath = path.join(__dirname, '..', 'tests', `${testName}.test.js`);

try {
  // 4. Ejecutamos el test usando 'node' y mostramos su salida en la consola.
  console.log(`🚀 Ejecutando test: ${testName}...`);
  execSync(`node ${testFilePath}`, { stdio: 'inherit' });
} catch (error) {
  // 5. Si el comando falla (p. ej., el archivo no existe), lo notificamos.
  console.error(`\n❌ Error al ejecutar el test '${testName}'.`);
  console.error(`Asegúrate de que el archivo existe en: ${testFilePath}`);
  process.exit(1);
}
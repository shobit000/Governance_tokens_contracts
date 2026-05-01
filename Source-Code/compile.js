import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import solc from 'solc';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the Solidity file
const filePath = path.resolve(__dirname, 'MyGovernance.sol');

// Check if the file exists
if (!fs.existsSync(filePath)) {
  throw new Error(`File not found: ${filePath}`);
}

// Read Solidity source
const source = fs.readFileSync(filePath, 'utf8');

// Define a function to handle imports
function findImports(importPath) {
  try {
    if (importPath.startsWith('@openzeppelin/')) {
      const fullPath = path.resolve(__dirname, 'node_modules', importPath);
      return { contents: fs.readFileSync(fullPath, 'utf8') };
    } else {
      const fullPath = path.resolve(__dirname, importPath);
      return { contents: fs.readFileSync(fullPath, 'utf8') };
    }
  } catch (e) {
    console.error(`Error importing file ${importPath}:`, e);
    return { error: 'File not found' };
  }
}

// Prepare the input for Solidity compiler
const input = {
  language: 'Solidity',
  sources: {
    'MyGovernance.sol': {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  },
};

// Compile the Solidity code
console.log('Compiling contract...');
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

// Check if the compilation was successful
if (output.errors) {
  console.error('Compilation errors:');
  output.errors.forEach(error => {
    console.error(error.formattedMessage);
  });
  throw new Error('Compilation failed');
}

// Extract the compiled contract
const contractFile = output.contracts['MyGovernance.sol']['MyGovernance'];

// Check if the contract was found
if (!contractFile) {
  throw new Error('Contract not found in the compiled output');
}

// Log a success message
console.log('Compilation successful');

// Export the compiled contract
export { contractFile };

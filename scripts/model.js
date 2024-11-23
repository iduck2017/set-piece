const fs = require('fs/promises');
const path = require('path');

const modelFileName = process.argv[2];
const superPathName = process.argv[3];
const superFileName = superPathName?.split('/').pop()

const superName = 
    superFileName ? 
    'I' + 
    superFileName.charAt(0).toUpperCase() +
    superFileName.slice(1).replace(/-([a-z])/g, (match) => match[1].toUpperCase()) :
    'Model'
const superImport = 
    superFileName ? 
    `import { ${superName} } from '.';` :
    ''
const modelCode = 
    modelFileName.charAt(0).toLowerCase() + 
    modelFileName.slice(1).replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)
const modelName = 
    modelFileName.charAt(0).toUpperCase() +
    modelFileName.slice(1).replace(/-([a-z])/g, (match) => match[1].toUpperCase())


async function newModel() {
    const implement = await fs.readFile(
        path.resolve(__dirname, './tmpl.txt')
    )
    if (!modelFileName) throw new Error()
    await fs.writeFile(
        path.resolve(__dirname, '../client/model', superPathName || '', `${modelFileName}.ts`),
        implement.toString()
            .replace(/\{\{MODEL_NAME\}\}/g, modelName)
            .replace(/\{\{MODEL_TYPE\}\}/g, modelCode)
            .replace(/\{\{SUPER_NAME\}\}/g, superName)
            .replace(/\{\{SUPER_IMPORT\}\}/g, superImport)
    )
}

newModel();
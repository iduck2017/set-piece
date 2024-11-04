const fs = require('fs/promises');
const path = require('path');

const modelName = process.argv[2];
const superPathName = process.argv[3];
const superFileName = superPathName.split('/').pop()

const superName = 
    superFileName.charAt(0).toUpperCase() +
    superFileName.slice(1).replace(/-([a-z])/g, (match) => match[1].toUpperCase())
const modelCode = 
    modelName.charAt(0).toLowerCase() + 
    modelName.slice(1).replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)
const fileName = 
    modelName.charAt(0).toLowerCase() +
    modelName.slice(1).replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)

async function newModel() {
    const implement = await fs.readFile(
        path.resolve(__dirname, './model-tmpl.txt')
    )
    if (!modelName) throw new Error()
    await fs.writeFile(
        path.resolve(__dirname, `../client/model/${superPathName}/${fileName}.ts`),
        implement.toString()
            .replace(/\{\{MODEL_NAME\}\}/g, modelName)
            .replace(/\{\{MODEL_CODE\}\}/g, modelCode)
            // .replace(/\{\{SUPER_NAME\}\}/g, superName)
    )
}

newModel();
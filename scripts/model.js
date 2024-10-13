const fs = require('fs/promises');
const path = require('path');
const modelName = process.argv[2];

// camelCase to snake_case
function formatSnakeCase(str) {
    return formatLowerCase(str).replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
}

function formatKebabCase(str) {
    return formatLowerCase(str).replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function formatLowerCase(str) {
    return `${str.charAt(0).toLowerCase()}${str.slice(1)}`
}

const PATH = {
    template: path.resolve(__dirname, './model-tmpl.txt'),
    implement: path.resolve(__dirname, `../client/models/${formatKebabCase(modelName)}.ts`),
    code: path.resolve(__dirname, '../client/configs/model-code.ts'),
    registry: path.resolve(__dirname, '../client/configs/model-registry.ts')
}

const MACRO = {
    name: /\{\{MODEL_NAME\}\}/g,
    code: "@model-code",
    registry: "@model-registry"
}

async function newModel() {
    const implement = await fs.readFile(PATH.template)
    if (!modelName) throw new Error()
    await fs.writeFile(
        PATH.implement,
        implement.toString().replace(MACRO.name, modelName)
    )

    const code = await fs.readFile(PATH.code)
    await fs.writeFile(
        PATH.code,
        code.toString().replace(
            MACRO.code, 
            `${MACRO.code}\n    ${modelName} = '${formatSnakeCase(modelName)}',`
        )
    )

    const registry = await fs.readFile(PATH.registry)
    await fs.writeFile(
        PATH.registry,
        `import { ${modelName}Model } from '../models/${formatKebabCase(modelName)}';\n` +
        registry.toString().replace(
            MACRO.registry.toString(), 
            `${MACRO.registry}\n    [ModelCode.${modelName}]: ${modelName}Model,`
        )
    )
}

newModel();
const fs = require('fs/promises');
const path = require('path');

// camelCase to snake_case
function formatSnakeCase(str) {
    return str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
}

async function newModel() {
    const implementContent = await fs.readFile(path.resolve(__dirname, './model-tmpl.txt'))
    const modelName = process.argv[2];
    if (!modelName) throw new Error()
    await fs.writeFile(
        path.resolve(__dirname, `../client/models/${formatSnakeCase(modelName)}.ts`),
        implementContent.toString().replace(/\{\{MODEL_NAME\}\}/g, modelName)
    )

    const codeDeclaration = await fs.readFile(path.resolve(__dirname, '../client/type.txt'))
}

newModel();
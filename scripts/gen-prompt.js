const fs = require('fs');
const path = require('path');

const markdown = (content, filePath) => `
\`\`\`typescript
\/**
* filePath: ${filePath}
*\/

${content}
\`\`\`
`

/**
* @param {Record<string, string>} options
* @param {string} output
*/
function genPrompt(options, output) {
   try {
       let combinedContent = '';
       Object.keys(options).forEach(key => {
           const filePath = options[key];
           const absolutePath = path.resolve(__dirname, filePath);
           if (fs.existsSync(absolutePath)) {
               const content = markdown(fs.readFileSync(absolutePath, 'utf-8'), filePath);
               combinedContent += content;
           } 
       });
       fs.writeFileSync(path.resolve(__dirname, output), `
# Generate Hearthstone Card

### You can refer to the following code to implement similar functionality

${combinedContent}
       `);
   } catch (error) {
       throw error;
   }
}

genPrompt({
    wisp: '../client/hearthstone-extension-classic/minions/wisp.ts',
    battlecry: '../client/hearthstone-extension-classic/battlecry/abusive-sergeant.ts',
    buff: '../client/hearthstone-extension-classic/buffs/abusive-sergeant.ts',
    spell: '../client/hearthstone-extension-classic/spells/blessing-of-kings.ts',
}, '../client/hearthstone/docs/example.md');


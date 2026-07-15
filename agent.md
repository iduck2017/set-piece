## Agent Operating Rules

- Do not install dependencies unless the user explicitly asks for it.
- Do not deploy the project unless the user explicitly asks for it.
- Do not start development servers or runtime processes unless the user explicitly asks for it.
- When dependencies, deployment, or server startup may be needed, explain the required commands and wait for the user to run or approve them.

## Code Style Rules

- Write all source code, identifiers, comments, and user-facing program text in English. Communicate with the user in Chinese.
- Add necessary comments, preferably using block comment style.
- Keep lines reasonably short. Prefer declaring values before using them when it improves readability and avoids long lines.
- Prefer concise names. Use a single-word name when the scope is unambiguous; use camelCase only when additional clarity is necessary.
- Prefer single-line return statements when they fit clearly in a conditional branch.
- Prefer single-line block comments when the comment fits on one line.
- Keep a property adjacent to its getter when they represent the same state.
- Do not add a blank line between a property and its corresponding getter.
- Keep each line focused on one responsibility. Read values into local variables before using them in control flow or other logic.
- Keep function bodies compact. Add blank lines only when they separate distinct logical sections.
- Encapsulate mutable model state in private `_property` fields. Use public getters and setters for externally readable and writable state.
- Write simple getters and setters on one line.

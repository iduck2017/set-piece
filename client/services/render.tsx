import { Root, createRoot } from 'react-dom/client';
import React from 'react';
import { AppDebugger } from '../debuggers/app';
import type { App } from '../app';

export class RenderService {
    private $root?: Root;
    public readonly app: App;

    constructor(app: App) {
        this.app = app;
    }

    public initialize() {
        this.$root = createRoot(
            document.getElementById('root')!
        );
        this.$root.render(<AppDebugger app={this.app} />);
    }
}
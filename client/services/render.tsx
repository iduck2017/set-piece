import { Root, createRoot } from 'react-dom/client';
import React from 'react';
import { AppComp } from '../debug/app';
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
        this.$root.render(<AppComp app={this.app} />);
    }
}
import { Root, createRoot } from 'react-dom/client';
import React from 'react';
import { AppComp } from '../debug/app';
import type { App } from '../app';

export class RenderService {
    private _root?: Root;
    public readonly app: App;

    constructor(app: App) {
        this.app = app;
    }

    public initialize() {
        const element = document.getElementById('root');
        if (!element) throw new Error();
        this._root = createRoot(element);
        this._root.render(<AppComp app={this.app} />);
    }
}
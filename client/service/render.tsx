import { Root, createRoot } from 'react-dom/client';
import React from 'react';
import { AppComp } from '../debug/app';
import { App } from '../app';
import { Global } from '../utils/global';

@Global.useSingleton
export class RenderService {
    private _root?: Root;

    readonly app: App;

    constructor(app: App) {
        this.app = app;
    }

    init() {
        const element = document.getElementById('root');
        if (!element) throw new Error();
        this._root = createRoot(element);
        this._root.render(<AppComp app={this.app} />);
    }
}
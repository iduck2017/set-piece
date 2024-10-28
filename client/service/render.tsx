import { Root, createRoot } from 'react-dom/client';
import React from 'react';
import { AppComp } from '../debug/app';
import { App } from '../app';
import { Service } from '.';

@Service.useSingleton
export class RenderService extends Service {
    #root?: Root;

    constructor(app: App) {
        super(app);
    }

    init() {
        const element = document.getElementById('root');
        if (!element) throw new Error();
        this.#root = createRoot(element);
        this.#root.render(<AppComp app={this.app} />);
    }
}
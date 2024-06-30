import { createRoot } from 'react-dom/client';
import type { RootModel } from "../models/root";
import { Service } from "./base";
import { AppRender } from '../views/app';
import React from 'react';

export class RenderService extends Service {
    public init() {
        const container = document.getElementById('root');
        const root = createRoot(container!);
        root.render(<AppRender app={this.app} />);
    }

    public mount(root: RootModel) {

    }
}
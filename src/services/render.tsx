import { Root, createRoot } from 'react-dom/client';
import { Service } from "./base";
import { AppDebugger } from '../utils/app';
import React from 'react';
import { appStatus } from '../utils/status';
import { AppStatus } from '../types/status';
import { ModelDebugger } from '../utils/model';
import { Exception } from '../utils/exceptions';

export class RenderService extends Service {
    private _root?: Root;

    @appStatus(AppStatus.INITED)
    public init() {
        this._root = createRoot(
            document.getElementById('root')!
        );
        this._root.render(<AppDebugger app={this.app} />);
    }

    @appStatus(AppStatus.MOUNTING)
    public mount() {
        if (!this.app.root) throw new Exception();

        this._root?.unmount();
        
        this._root = createRoot(
            document.getElementById('root')!
        );
        this._root?.render(
            <ModelDebugger 
                target={this.app.root} 
                app={this.app}
            />
        );
    }
}
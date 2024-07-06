import { Root, createRoot } from 'react-dom/client';
import { Service } from "./base";
import React from 'react';
import { appStatus } from '../utils/status';
import { AppStatus } from '../types/status';
import { AppDebugger } from '../debuggers/app';

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
        
    }
}
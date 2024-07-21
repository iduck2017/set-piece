import { Root, createRoot } from 'react-dom/client';
import { Service } from "./base";
import React from 'react';
import { appStatus } from '../utils/status';
import { AppStatus } from '../types/status';
import { AppDebugger } from '../debuggers/app';

export class RenderService extends Service {
    private $root?: Root;

    @appStatus(AppStatus.INITED)
    public init() {
        this.$root = createRoot(
            document.getElementById('root')!
        );
        this.$root.render(<AppDebugger app={this.app} />);
    }

    @appStatus(AppStatus.MOUNTING)
    public mount() {
        
    }
}
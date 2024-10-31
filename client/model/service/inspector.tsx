import { Root, createRoot } from 'react-dom/client';
import React from 'react';
import { Model } from '..';
import { Service } from '.';
import { ModelComp } from '../../util/model';
import { App } from '../app';
import { RawModelDefine } from '../../type/define';

export type InspectorDefine =
    RawModelDefine<{
        type: 'inspector';
    }>

@Model.useProduct('inspector')
export class Inspector extends Model<
    InspectorDefine
> {
    private _root?: Root;

    constructor(
        config: Inspector['config'], 
        parent: Service
    ) {
        super({
            ...config,
            stateMap: {},
            childMap: {}
        }, parent);
    }

    @Model.useActivate()
    _onActivate() {
        const element = document.getElementById('root');
        if (!element) throw new Error();
        this._root = createRoot(element);
        this._root.render(<ModelComp model={App.main} />);
    }
}
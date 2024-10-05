import React, { useEffect, useState } from "react";
import type { App } from "../app";
import type { Model } from "../models";
import "./index.css";
import { IModel } from "../type/model";
import { ISignal } from "../type/signal";
import { IEffect } from "../type/effect";
import { ModelDef } from "../type/model-def";

export type ModelProps<M extends ModelDef> = {
    target: Model<M>,
    app: App
}

export type ModelState<M extends ModelDef> = {
    childList: IModel.List<M>,
    childDict: IModel.Dict<M>,
    signalDict: ISignal.Dict<M>,
    effectDict: IEffect.Dict<M>,
    info: ModelDef.Info<M>
}

export function ModelComp<
    M extends ModelDef
>(props: ModelProps<M>) {
    const { target, app } = props;
    const [ state, setState ] = useState<{
        childList: IModel.List<M>,
        childDict: IModel.Dict<M>,
        signalDict: ISignal.Dict<M>,
        effectDict: IEffect.Dict<M>,
        info: ModelDef.Info<M>
    }>(props.target.getState());

    useEffect(() => {
        setState(props.target.getState());
        return props.target.useState(setState);
    }, [ props.target ]);

    const {
        childDict,
        childList,
        info
    } = state;

    return (
        <div
            className="model" 
            id={target.id}
        >
            <div className="data">
                <div className="title">{target.constructor.name}</div>
                {Object.keys(info).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div className="value">{info[key]}</div>
                    </div>
                ))}
                {Object.keys(target.testcaseDict).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div 
                            className="function"
                            onClick={target.testcaseDict[key].bind(target)}
                        >
                            function
                        </div>
                    </div>
                ))}
            </div>
            <div className="children">
                {childList.map((item) => (
                    <ModelComp 
                        key={item.id}
                        target={item as any}
                        app={app}
                    />
                ))}
                {Object.values(childDict).map((item) => (
                    <ModelComp 
                        key={item.id}
                        target={item as any}
                        app={app}
                    />
                ))}
            </div>
        </div>
    );
}
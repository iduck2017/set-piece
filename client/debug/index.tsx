import React, { useEffect, useState } from "react";
import type { App } from "../app";
import type { Model } from "../models";
import "./index.css";
import { ModelType } from "../type/model";
import { EventDict, ModifyEventDict, ReactDict, UpdateEventDict } from "../type/event";
import { ModelDef } from "../type/model-def";

export type ModelProps<M extends ModelDef> = {
    model: Model<M>,
    app: App
}

export type ModelState<M extends ModelDef> = {
    childList: ModelType.ChildList<M>,
    childDict: ModelType.ChildDict<M>,
    eventDict: EventDict<M>,
    updateEventDict: UpdateEventDict<M>,
    modifyEventDict: ModifyEventDict<M>,
    reactDict: ReactDict<M>,
    info: ModelDef.Info<M>
}

export function ModelComp<
    M extends ModelDef
>(props: ModelProps<M>) {
    const { model, app } = props;
    const [ state, setState ] = useState<ModelState<M>>(model.getState);

    useEffect(() => {
        setState(model.getState());
        return model.useState(setState);
    }, [ model ]);

    const {
        childDict,
        childList,
        info
    } = state;

    return (
        <div className="model" id={model.id}>
            <div className="data">
                <div className="title">{model.constructor.name}</div>
                <div className="row">
                    <div className="field">Code</div>
                    <div className="value">{model.code}</div>
                </div>
                <div className="row">
                    <div className="field">ID</div>
                    <div className="value">{model.id}</div>
                </div>
                <div className="row">
                    <div className="field">Info</div>
                    <div className="value">
                        <div className="function">open</div>
                        <div className="function">fold</div>
                    </div>
                </div>
                {Object.keys(info).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div className="value">{info[key]}</div>
                    </div>
                ))}
                <div className="row">
                    <div className="field">Child</div>
                    <div className="value">
                        <div className="function">open</div>
                        <div className="function">fold</div>
                    </div>
                </div>
                {Object.keys(childDict).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div className="function">check</div>
                    </div>
                ))}
                {childList.map((item, index) => (
                    <div className="row" key={index}>
                        <div className="key">iterator[{index}]</div>
                        <div className="function">check</div>
                    </div>
                ))}
                <div className="row">
                    <div className="field">API</div>
                    <div className="value">
                        <div className="function">open</div>
                        <div className="function">fold</div>
                    </div>
                </div>
                {Object.keys(model.apiDict).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div 
                            className="function"
                            onClick={() => {
                                model.apiDict[key].call(model);
                            }}
                        >
                            call
                        </div>
                    </div>
                ))}
            </div>
            <div className="children">
                {childList.map(item => (
                    <ModelComp 
                        key={item.id}
                        model={item as any}
                        app={app}
                    />
                ))}
                {Object.values(childDict).map(item => (
                    <ModelComp 
                        key={item.id}
                        model={item as any}
                        app={app}
                    />
                ))}
            </div>
        </div>
    );
}
import React, { useEffect, useState } from "react";
import type { App } from "../app";
import type { Model } from "../models";
import "./index.css";
import { ModelType } from "../type/model";
import { EventDict } from "../type/event";
import { ReactDict } from "../type/react";
import { ModelTmpl } from "../type/model-tmpl";

export type ModelProps<M extends ModelTmpl> = {
    model: Model<M>,
    app: App
}

export type ModelState<M extends ModelTmpl> = {
    childList: ModelType.ChildList<M>,
    childDict: ModelType.ChildDict<M>,
    eventDict: EventDict<M>,
    reactDict: ReactDict<M>,
    info: ModelTmpl.Info<M>
}

export function ModelComp<
    M extends ModelTmpl
>(props: ModelProps<M>) {
    const { model, app } = props;
    const [ state, setState ] = useState<ModelState<M>>(model.getState());

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
        <div
            className="model" 
            id={model.id}
        >
            <div className="data">
                <div className="title">{model.constructor.name}</div>
                {Object.keys(info).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div className="value">{info[key]}</div>
                    </div>
                ))}
                {Object.keys(model.testcaseDict).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div 
                            className="function"
                            onClick={() => {
                                model.testcaseDict[key].call(model);
                            }}
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
                        model={item as any}
                        app={app}
                    />
                ))}
                {Object.values(childDict).map((item) => (
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
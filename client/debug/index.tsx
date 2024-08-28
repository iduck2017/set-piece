import React from "react";
import type { App } from "../app";
import { useModel } from "./use-model";
import "./index.css";
import { Model } from "../models";

export type ModelCompProps = {
    target: Model,
    app: App
}

export function ModelComp(props: ModelCompProps) {
    const { target, app } = props;
    const { children, state } = useModel(props);

    return (
        <div
            className="model" 
            id={target.id}
        >
            <div className="data">
                <div className="title">{target.constructor.name}</div>
                {Object.keys(state).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div className="value">{target.currentState[key]}</div>
                    </div>
                ))}
                {Object.keys(target.debugIntf).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div 
                            className="function"
                            onClick={target.debugIntf[key].bind(target)}
                        >
                            function
                        </div>
                    </div>
                ))}
            </div>
            <div className="children">
                {children.map(item => (
                    <ModelComp 
                        key={item.id}
                        target={item}
                        app={app}
                    />
                ))}
            </div>
        </div>
    );
}
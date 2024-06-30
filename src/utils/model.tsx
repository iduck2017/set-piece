import React from "react";
import { BaseModel } from "../types/model";
import type { App } from "../app";

export function ModelDebugger(props: {
    target: BaseModel,
    app: App
}) {
    const { target, app } = props;

    return (
        <div id={target.referId}>
            <span>{target.constructor.name}</span>
            {Object.keys(target.data).map(key => (
                <span>{key}: {target.data[key]}</span>
            ))}
            {target.children.map(item => (
                <ModelDebugger 
                    key={item.referId}
                    target={item}
                    app={app}
                />
            ))}
        </div>
    );
}
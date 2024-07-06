import React, { useEffect, useRef, useState } from "react";
import { BaseModel } from "../types/model";
import type { App } from "../app";
import { DebugRenderer } from "../renders/debug";
import "./index.css";

export function ModelDebugger(props: {
    target: BaseModel,
    app: App
}) {
    const { target, app } = props;

    const [data, setData] = useState(target.data.calc);
    const render = useRef(new DebugRenderer({ 
        setData 
    }, app));

    useEffect(() => {
        render.current.active(target);
        return render.current.deactive.bind(render);
    }, []);

    return (
        <div
            className="model" 
            id={target.referId}
        >
            <div className="data">
                <div className="title">{target.constructor.name}</div>
                {Object.keys(data).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div className="value">{target.data.calc[key]}</div>
                    </div>
                ))}
                {Object.keys(target.debugger).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div 
                            className="function"
                            onClick={target.debugger[key]}
                        >
                            function
                        </div>
                    </div>
                ))}
            </div>
            <div className="children">
                {target.node.children.map(item => (
                    <ModelDebugger 
                        key={item.referId}
                        target={item}
                        app={app}
                    />
                ))}
            </div>
        </div>
    );
}
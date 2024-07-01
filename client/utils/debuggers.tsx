import React, { useEffect, useState } from "react";
import { BaseModel } from "../types/model";
import type { App } from "../app";
import { SlotData } from "../types/app";
import "./debuggers.css";

function AppDebugger(props: {
    app: App
}) {
    const { app } = props;

    const [slots, setSlots] = useState<SlotData[]>(app.slots.data);
  
    const create = async () => {
        await app.slots.new({
            difficulty: 0,
            name: 'iduck'
        });
        setSlots([...app.slots.data]);
    };

    useEffect(() => {
        // app.mount(0);
    }, []);

    return <div>
        <button onClick={create}>
            new
        </button>
        {slots.map((slot, index) => (
            <button 
                key={slot.slotId} 
                onClick={() => app.mount(index)}
            >
                slot_{slot.slotId}
            </button>
        ))}
    </div>;
}

function ModelDebugger(props: {
    target: BaseModel,
    app: App
}) {
    const { target, app } = props;

    return (
        <div
            className="model" 
            id={target.referId}
        >
            <div className="data">
                <div className="title">{target.constructor.name}</div>
                {Object.keys(target.data).map(key => (
                    <div className="attribute">
                        <div className="key">{key}</div>
                        <div className="value">{target.data[key]}</div>
                    </div>
                ))}
            </div>
            <div className="children">
                {target.children.map(item => (
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

export {
    AppDebugger,
    ModelDebugger
};
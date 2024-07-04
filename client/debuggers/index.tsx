import React, { useEffect, useRef, useState } from "react";
import { BaseModel } from "../types/model";
import type { App } from "../app";
import { SlotData } from "../types/app";
import { AppStatus } from "../types/status";
import { DebugRenderer } from "../renders/debug";
import "./index.css";

function AppDebugger(props: {
    app: App
}) {
    const { app } = props;

    const [status, setStatus] = useState<AppStatus>(app.status);
    const [slots, setSlots] = useState<SlotData[]>(app.slots.data);
  
    const create = async () => {
        await app.slots.new({
            difficulty: 0,
            name: 'iduck'
        });
        setSlots([...app.slots.data]);
    };

    const start = async (index: number) => {
        await app.mount(index);
        setStatus(app.status);
    };

    useEffect(() => {
        start(0);
    }, []);

    return <div>
        <button onClick={create}>
            new
        </button>
        {status === AppStatus.UNMOUNTED && 
            slots.map((slot, index) => (
                <button 
                    key={slot.slotId} 
                    onClick={() => start(index)}
                >
                    slot_{slot.slotId}
                </button>
            ))
        }
        {status === AppStatus.MOUNTED && 
            <button >save</button>
        }
        {status === AppStatus.MOUNTED && app.root && 
            <ModelDebugger 
                target={app.root}
                app={app}
            />
        }
    </div>;
}

function ModelDebugger(props: {
    target: BaseModel,
    app: App
}) {
    const { target, app } = props;

    const [data, setData] = useState(target.data);
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
                        <div className="value">{target.data[key]}</div>
                    </div>
                ))}
                {Object.keys(target.debuggers).map(key => (
                    <div className="row" key={key}>
                        <div className="key">{key}</div>
                        <div 
                            className="function"
                            onClick={target.debuggers[key]}
                        >
                            function
                        </div>
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
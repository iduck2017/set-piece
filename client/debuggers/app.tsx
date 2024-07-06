import React, { useEffect, useState } from "react";
import { AppStatus } from "../types/status";
import { SlotData } from "../types/app";
import type { App } from "../app";
import { ModelDebugger } from "./model";

export function AppDebugger(props: {
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
        // start(0);
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
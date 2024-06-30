import React, { useState } from "react";
import type { App } from "../app";
import { SlotData } from "../types/app";
import { AppStatus } from "../types/status";

export function AppDebugger(props: {
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
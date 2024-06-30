import React, { useEffect, useState } from "react";
import type { App } from "../app";
import { MetaData, SlotData } from "../types/app";

export function AppRender(props: {
    app: App
}) {
    const { app } = props;

    const [slots, setSlots] = useState<SlotData[]>(app.slots.data);
    useEffect(() => {
        app.slots.view(setSlots);
        return () => {
            app.slots.unview(setSlots);
        };
    }, []);

    return <div>
        <button onClick={() => {
            app.slots.new({
                difficulty: 0,
                name: 'iduck'
            });
        }}>
            new
        </button>
        {slots.map(slot => (
            <button key={slot.slotId}>
                slot_{slot.slotId}
            </button>
        ))}
    </div>;
}
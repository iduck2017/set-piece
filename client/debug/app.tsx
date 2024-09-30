import React, { useState } from "react";
import type { App } from "../app";
import { ModelComp } from ".";
import { ArchieveData } from "../services/archieve";
import { AppStatus } from "../type/status";

export function AppComp(props: {
    app: App
}) {
    const { app } = props;
    const [ status, setStatus ] = useState<AppStatus>(app.status);
    const [ archieves, setArchieves ] = useState<ArchieveData[]>(app.archieve.data);
  
    const createArchieve = async () => {
        await app.archieve.createArchieve();
        setArchieves([ ...app.archieve.data ]);
    };

    const startGame = async (index: number) => {
        await app.startGame(index);
        setStatus(app.status);
    };

    const saveArchieve = () => {
        app.archieve.saveArchieve();
    };

    const quitGame = async () => {
        await app.quitGame();
        setStatus(app.status);
    };

    if (status === AppStatus.UNMOUNTED) {
        return <div>
            <button onClick={createArchieve}>
                new
            </button>
            {archieves.map((archieve, index) => (
                <button 
                    key={archieve.id} 
                    onClick={() => startGame(index)}
                >
                    slot_{archieve.id}
                </button>
            ))}
        </div>;
    }

    if (status === AppStatus.MOUNTED && app.root) {
        return <div>
            <button onClick={saveArchieve}>
                save
            </button>
            <button onClick={quitGame}>
                quit
            </button>
            <ModelComp
                target={app.root}
                app={app}
            />
        </div>;
    }
}
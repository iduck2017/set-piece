import React, { useState } from "react";
import type { App } from "../app";
import { ModelDebugger } from ".";
import { AppInfo } from "../type/app";
import { AppStatus } from "../type/status";

export function AppDebugger(props: {
    app: App
}) {
    const { app } = props;

    const [ status, setStatus ] = useState<AppStatus>(app.status);
    const [ archieves, setArchieves ] = useState<AppInfo.Archieve[]>(app.archieveService.data);
  
    const createArchieve = async () => {
        await app.archieveService.createArchieve();
        setArchieves([ ...app.archieveService.data ]);
    };

    const startGame = async (index: number) => {
        await app.startGame(index);
        setStatus(app.status);
    };

    const saveArchieve = () => {
        app.archieveService.saveArchieve();
    };

    return <div>
        <button onClick={createArchieve}>
            new
        </button>
        {status === AppStatus.UNMOUNTED && 
            archieves.map((archieve, index) => (
                <button 
                    key={archieve.id} 
                    onClick={() => startGame(index)}
                >
                    slot_{archieve.id}
                </button>
            ))
        }
        {status === AppStatus.MOUNTED && 
            <button onClick={saveArchieve}>save</button>
        }
        {status === AppStatus.MOUNTED && app.root && 
            <ModelDebugger
                target={app.root}
                app={app}
            />
        }
    </div>;
}
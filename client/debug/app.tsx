import React, { useEffect, useState } from "react";
import { App, AppStatus } from "../app";
import { ModelComp } from ".";
import { ArchieveData } from "../service/file";

export function AppComp(props: {
    app: App
}) {
    const { app } = props;
    const [ status, setStatus ] = useState<AppStatus>(app.status);
    const [ archieves, setArchieves ] = useState<
        Readonly<ArchieveData[]>
    >(app.fileService.data);
  
    const createArchieve = async () => {
        await app.fileService.create();
        setArchieves([ ...app.fileService.data ]);
    };

    const startGame = async (index: number) => {
        await app.start(index);
        setStatus(app.status);
    };

    const saveArchieve = () => {
        app.fileService.save();
    };

    const quitGame = async () => {
        await app.quit();
        setStatus(app.status);
    };

    useEffect(() => {
        // (async () => {
        //     for (let i = 0; i < 100; i++) {
        //         console.log(i);
        //         await startGame(0),
        //         await quitGame();
        //     }
        // })();
    }, []);

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
            <ModelComp model={app.root} />
        </div>;
    }
}
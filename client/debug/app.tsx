import React, { useEffect, useState } from "react";
import { App } from "../app";
import { ModelComp } from ".";
import { FileInfo } from "../service/file";
import { RootModel } from "../model/root";

export function AppComp(props: {
    app: App
}) {
    const { app } = props;
    const [ root, setRoot ] = useState<RootModel>();
    const [ archieves, setArchieves ] = useState<
        Readonly<FileInfo[]>
    >(app.fileService.data);
  
    const createArchieve = async () => {
        await app.fileService.new();
        setArchieves([ ...app.fileService.data ]);
    };

    const startGame = async (index: number) => {
        await app.start(index);
        setRoot(app.root);
    };

    const saveArchieve = () => {
        app.fileService.save();
    };

    const quitGame = async () => {
        await app.quit();
        setRoot(undefined);
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

    if (!root) {
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
    } else {
        return <div>
            <button onClick={saveArchieve}>
                save
            </button>
            <button onClick={quitGame}>
                quit
            </button>
            <ModelComp model={root} />
        </div>;
    }
}
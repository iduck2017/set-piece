import React, { useEffect } from "react";
import './index.css';
import { App } from "@/model/app";
import { useNode } from "./use-node";

export function AppComp(props: {
    app: App
}) {
    const { app } = props;
    const [ state, child ] = useNode(app);
    console.log(state, child);

    useEffect(() => {
        // app.init();
    }, []);

    return <div className="menu">
        <div className="form">
            <div className="title">{app.type}</div>
            <div>init: {state.isInited.toString()}</div>
            <div>count: {state.count.toString()}</div>
            {!state.isInited && <div className="link" onClick={() => app.init()}>init</div>}
            {state.isInited && <> 
                <div className="link" onClick={() => app.count()}>count</div>
                <div className="link" onClick={() => app.quit()}>quit</div>
            </>}
        </div>
        <div className="menu">
        </div>
    </div>;
}
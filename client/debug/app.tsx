import React, { useEffect } from "react";
import { App } from "@/model/app";
import './index.css';
import { BunnyComp } from "./bunny";
import { useModel } from "./useModel";

export function AppComp(props: {
    app: App
}) {
    const { app } = props;
    const [ state, child ] = useModel(app);

    useEffect(() => {
        app.init();
    }, []);

    console.log({ ...child });

    return <div className="panel">
        <div className="form">
            <div className="title">{app.type}</div>
            <div>isInit: {state.isInit.toString()}</div>
            <div>count: {state.count.toString()}</div>
            {!state.isInit && <div className="link" onClick={() => app.init()}>init</div>}
            {state.isInit && <> 
                <div className="link" onClick={() => app.count()}>count</div>
                <div className="link" onClick={() => app.save()}>save</div>
                <div className="link" onClick={() => app.quit()}>quit</div>
            </>}
        </div>
        <div className="panel">
            {child.bunny && <BunnyComp bunny={child.bunny} />}
        </div>
    </div>;
}
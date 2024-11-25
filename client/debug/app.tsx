import React, { useEffect } from "react";
import './index.css';
import { App } from "@/model/app";

export function AppComp(props: {
    app: App
}) {
    const { app } = props;
    const [ state, child ] = useModel(app);

    useEffect(() => {
        app.init();
    }, []);

    return <div className="menu">
        <div className="form">
            <div className="title">{app.type}</div>
            <div>isInit: {state.isInit.toString()}</div>
            <div>count: {state.count.toString()}</div>
            {!state.isInit && <div className="link" onClick={() => app.init()}>init</div>}
            {state.isInit && <> 
                <div className="link" onClick={() => app.count()}>count</div>
                <div className="link" onClick={() => app.quit()}>quit</div>
            </>}
        </div>
        <div className="menu">
        </div>
    </div>;
}
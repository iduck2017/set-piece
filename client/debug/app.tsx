import React, { useEffect } from "react";
import { App } from "@/model/app";
import './index.css';
import { useModel } from "./useModel";
import { GameComp } from "./game";

export function AppComp(props: {
    model: App
}) {
    const { model: app } = props;
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
                <div className="link" onClick={() => app.save()}>save</div>
                <div className="link" onClick={() => app.quit()}>quit</div>
            </>}
        </div>
        <div className="menu">
            {/* {child.bunny && <BunnyComp bunny={child.bunny} />} */}
            {child.game && <GameComp model={child.game} />}
        </div>
    </div>;
}
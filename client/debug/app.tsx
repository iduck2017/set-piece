import React, { useEffect } from "react";
import './index.css';
import { App } from "@/model.bk/app";
import { useModel } from "./use-model";
import { ModelComp } from ".";
import { Link } from "./common";
import { DemoComp } from "./demo";
import { GameComp } from "./game";

export function AppComp(props: {
    app: App
}) {
    const { app } = props;
    const [ state, child ] = useModel(app);
    console.log({ ...state }, { ...child }, child.demo);

    useEffect(() => {
        app.start();
    }, []);

    return <ModelComp 
        model={app}
        form={
            <>
                <Link model={app} action="start" />
                <Link model={app} action="test" />
                <Link model={app} action="quit" />
                <Link model={app} action="save" />
            </>
        }
        menu={
            <>
                {child.demo && <DemoComp demo={child.demo} />}
                {child.game && <GameComp game={child.game} />}
            </>
        }
    />;
}
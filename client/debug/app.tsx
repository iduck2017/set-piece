import React, { useEffect } from "react";
import './index.css';
import { App } from "@/model/app";
import { useModel } from "./use-model";
import { ModelComp } from ".";
import { Link } from "./common";
import { DemoComp } from "./demo";

export function AppComp(props: {
    app: App
}) {
    const { app } = props;
    const [ state, child ] = useModel(app);

    useEffect(() => {
        app.start();
    }, []);

    return <ModelComp 
        model={app}
        form={
            <>
                <Link model={app} name="start" />
                <Link model={app} name="quit" />
                <Link model={app} name="save" />
            </>
        }
        menu={
            <>
                {child.demo && <DemoComp demo={child.demo} />}
            </>
        }
    />;
}
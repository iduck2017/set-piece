import React, { useEffect } from "react";
import './index.css';
import { App } from "@/model/app";
import { useModel } from "./use-model";
import { ModelComp } from ".";
import { Link } from "./common";

export function AppComp(props: {
    app: App
}) {
    const { app } = props;
    const [ state, child ] = useModel(app);

    useEffect(() => {
        // app.init();
    }, []);

    return <ModelComp 
        model={app}
        form={
            <>
                <Link model={app} name="start" />
            </>
        }
    />;
}
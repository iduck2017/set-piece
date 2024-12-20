import React, { useEffect } from "react";
import './index.css';
import { useModel } from "./use-model";
import { ModelComp } from ".";
import { Link } from "./common";
import { GameComp } from "./game";
import { AppModel } from "../models/app";

export function AppComp(props: {
    model: AppModel
}) {
    const { model } = props;
    const { childDict } = useModel(model);

    useEffect(() => {
        model.start();
    }, []);

    return <ModelComp 
        model={model}
        options={{
            isList: true
        }}
        form={
            <>
                <Link model={model} action="save" />
                <Link model={model} action="quit" />
                <Link model={model} action="start" />
            </>
        }
        menu={
            <>
                {childDict.game && <GameComp model={childDict.game} />}
            </>
        }
    />;
}
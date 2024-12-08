import React, { useEffect } from "react";
import './index.css';
import { useModel } from "./use-model";
import { ModelComp } from ".";
import { Link } from "./common";
import { AppModel } from "@/model/app";
import { DemoComp } from "./demo";
import { GameComp } from "./game";

export function AppComp(props: {
    model: AppModel
}) {
    const { model } = props;
    const [ state, child ] = useModel(model);
    console.log({ ...state }, { ...child }, child.demo);

    useEffect(() => {
        // model.start();
    }, []);

    return <ModelComp 
        model={model}
        form={
            <>
                <Link model={model} action="count" />
                <Link model={model} action="test" />
                <Link model={model} action="save" />
                <Link model={model} action="quit" />
                <Link model={model} action="start" />
            </>
        }
        menu={
            <>
                {child.demo && <DemoComp model={child.demo} />}
                {child.game && <GameComp model={child.game} />}
            </>
        }
    />;
}
import React, { useEffect } from "react";
import './index.css';
import { useModel } from "./use-model";
import { ModelComp } from ".";
import { Link } from "./common";
import { AppModel } from "@/model/app";

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
                {/* <Link model={model} action="start" />
                <Link model={model} action="test" />
                <Link model={model} action="quit" />
                <Link model={model} action="save" /> */}
                <Link model={model} action="count" />
            </>
        }
        menu={
            <>
                {/* {child.demo && <DemoComp demo={child.demo} />}
                {child.game && <GameComp game={child.game} />} */}
            </>
        }
    />;
}
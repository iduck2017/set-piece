import React, { useEffect } from "react";
import { useModel } from "./use-model";
import { ModelComp } from ".";
import { Link } from "./common";
import { AppModel } from "../models/app";
import './index.css';
import { PingPongComp } from "./ping-pong";
import { BunnyComp } from "./bunny";

export function AppComp(props: {
    model: AppModel
}) {
    const model = useModel(props.model);
    const demo = useModel(model.childDict.demo);
    console.log(model.childDict, demo.childDict);

    useEffect(() => {
        props.model.start();
    }, []);

    return <ModelComp 
        model={props.model}
        form={
            <>
                <Link model={props.model} action="count" />
                <Link model={props.model} action="save" />
                <Link model={props.model} action="quit" />
                <Link model={props.model} action="start" />
                <Link model={props.model} action="checkFactory" />
            </>
        }
        menu={
            <>
                {demo.childDict.bunny && <BunnyComp model={demo.childDict.bunny} />}
                {demo.childDict.pingPong && <PingPongComp model={demo.childDict.pingPong} />}
            </>
        }
    />;
}
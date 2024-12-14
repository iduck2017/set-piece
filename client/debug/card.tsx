import React from "react";
import { ModelComp } from ".";
import { CardModel } from "@/model/card";
import { useModel } from "./use-model";
import { Link, State } from "./common";

export function CardComp(props: {
    model: CardModel
}) {
    const model = useModel(props.model);

    return <ModelComp 
        model={props.model} 
        form={
            <>
                <Link model={props.model} action='play' />
                {model.childDict.combatable && 
                    <Link model={model.childDict.combatable} action='attack' />}
                {model.childDict.castable && <State model={model.childDict.castable} />}
                {model.childDict.combatable && 
                    <State model={model.childDict.combatable} />}
            </>
        }    
    />;
}


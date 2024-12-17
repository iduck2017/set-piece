import React from "react";
import { ModelComp } from ".";
import { CardModel } from "@/hearthstone/model/card/card";
import { useModel } from "./use-model";
import { Link, State } from "./common";
import { useContext } from "./use-context";

export function CardComp(props: {
    model: CardModel
}) {
    const model = useModel(props.model);
    const { 
        handleTargetCollect, 
        isTargetCollectable,
        setTargetCollectorInfo,
        targetCollector
    } = useContext();

    return <ModelComp 
        model={props.model} 
        form={
            <>
                {!targetCollector && <>
                    <Link 
                        model={props.model} 
                        action='prepare' 
                        then={(result) => {
                            if (result) setTargetCollectorInfo(result);
                        }}
                    />
                    <Link model={props.model} action='draw' />
                </>}
                {isTargetCollectable(props.model) && 
                    <div 
                        className="link mark"
                        onClick={() => handleTargetCollect(props.model)}    
                    >select</div>}
                {model.childDict.castable && <State model={model.childDict.castable} />}
                {model.childDict.combatable && 
                    <State model={model.childDict.combatable} />}
            </>
        }    
    />;
}


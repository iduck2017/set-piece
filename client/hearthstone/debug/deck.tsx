import React, { useMemo } from "react";
import { ModelComp } from ".";
import { useModel } from "./use-model";
import { CardComp } from "./card";
import { Link } from "./common";
import { DeckModel } from "../models/deck";
import { Select } from "./select";
import { DataBase } from "../services/database";
import { Factory } from "@/set-piece";


export function DeckComp(props: {
    model: DeckModel
}) {
    const model = useModel(props.model);   

    const options = useMemo(() => {
        return DataBase.cardProductInfo.selectAll.map(card => ({
            label: Factory.productMap.get(card) || '',
            value: Factory.productMap.get(card) || ''
        }));
    }, []);

    return <ModelComp 
        model={props.model} 
        form={
            <>
                <Select 
                    options={options}
                    onChange={(value) => {
                        console.log(value);
                        props.model.setTemplateCode(value);
                    }}
                />
                <Link model={props.model} action="generateCard" />
                <Link model={props.model} action='discardCard' />
                <Link model={props.model} action="drawCard" />
            </>
        }
        menu={
            <>
                {model.childList.map(child => (
                    <CardComp key={child.uuid} model={child} />
                ))}
            </>
        }    
    />;
}

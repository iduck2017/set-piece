/* eslint-disable max-len */
import React, { ReactNode, useEffect, useState } from "react";
import "./model.css";
import { IModel } from "../model";
import { Base } from "../type/base";
import { ModelDefine } from "../type/define";

export type VisibleInfo = {
    model: boolean;
    child: boolean;
    state: boolean;
    debug: boolean;
    refer: boolean;
}

const FolderComp = (props: {
    title: keyof VisibleInfo;
    length: number;
    visible: VisibleInfo,
    setVisible: React.Dispatch<React.SetStateAction<VisibleInfo>>
    children?: ReactNode[];
}) => {
    const {
        title,
        length,
        visible: visible,
        children,
        setVisible: setVisible
    } = props;

    if (!length) return null;

    return <>
        <div className={`row ${visible[title] ? '' : 'fold'}`}>
            <div className="title key">{title}</div>
            <div className="value">({length})</div>
            <div 
                className="icon" 
                onClick={() => {
                    setVisible(prev => ({
                        ...prev,
                        [title]: !prev[title]
                    }));
                }}
            >
                {visible[title] ? '▴' : '▾'}
            </div>
        </div>
        {visible[title] && children}
    </>;
};

export function ModelComp<
    D extends ModelDefine
>(props: {
    model: Readonly<IModel<D>>,
}) {
    const { model } = props;

    const [ info, setInfo ] = useState<Model.Info<D>>();
    const [ visible, setVisible ] = useState<VisibleInfo>({
        model: true,
        state: true,
        child: true,
        debug: true,
        refer: true
    });
    
    const [ refer, setRefer ] = useState<Readonly<IModel>>();

    const formatValue = (
        value: Base.Value | Base.Value[]
    ): string => {
        if (value instanceof Array) {
            return value.map(formatValue).join(', ');
        }
        const _value: any = value;
        if (_value instanceof IModel) {
            return `"${_value.code}"`;
        }
        if (typeof value === 'string') return `"${value}"`;
        return `(${value})`;
    };

    useEffect(() => {
        if (!refer) return;
        const elem = document.getElementById(refer.code);
        if (elem) {
            elem.classList.add('actived');
            return () => elem.classList.remove('actived');
        }
    }, [ refer ]);

    useEffect(() => {
        return model.useInfo(setInfo);
    }, [ model ]);

    if (!info) return null;

    const {
        childSet,
        childMap,
        curStateMap,
        debugMap,
        referSet
    } = info;

    return (
        <div className="model">
            <div className="body" id={model.code}>
                <div 
                    className={`head ${visible.model ? '' : 'fold'}`}
                    onClick={() => {
                        setVisible(prev => ({
                            ...prev,
                            model: !visible.model
                        }));
                    }}
                >
                    {model.type}
                </div>
                <div className={`row ${visible.model ? '' : 'fold'}`}>
                    <div className="title key">id</div>
                    <div className="value">
                        {formatValue(model.code)}
                    </div>
                </div>
                {visible.model && <>
                    <FolderComp
                        visible={visible}
                        setVisible={setVisible}
                        title="debug"
                        length={Object.keys(debugMap).length}
                    >
                        {Object.keys(debugMap).map(key => (
                            <div className="row" key={key}>
                                <div 
                                    className="key action"
                                    onClick={() => {
                                        debugMap[key].call(model);
                                    }}
                                >
                                    {key}
                                </div>
                            </div>
                        ))}
                    </FolderComp>
                    <FolderComp 
                        visible={visible}
                        setVisible={setVisible}
                        title="state"
                        length={Object.keys(curStateMap).length}
                    >
                        {Object.keys(curStateMap).map(key => (
                            <div 
                                className="row" 
                                key={key} 
                            >
                                <div className={`key link`}>
                                    {key}
                                </div>
                                <div className="value">
                                    {formatValue(curStateMap[key])}
                                </div>
                            </div>
                        ))}
                    </FolderComp>
                    <FolderComp
                        visible={visible}
                        setVisible={setVisible}
                        title="child"
                        length={
                            Object.keys(childSet).length + 
                            childSet.length}
                    >
                        {childSet.map((item, index) => (
                            <div 
                                className='row' 
                                key={index}
                            >
                                <div 
                                    className={`key link ${refer === item ? 'hover' : ''}`}
                                    onMouseEnter={() => setRefer(item)}
                                    onMouseLeave={() => setRefer(undefined)}
                                >
                                [{index}]
                                </div>
                            </div>
                        ))}
                        {Object.keys(childMap).map(key => (
                            <div 
                                className='row'
                                key={key}
                            > 
                                <div 
                                    className={`key link ${refer === childMap[key] ? 'hover' : ''}`}
                                    onMouseEnter={() => setRefer(childMap[key])}
                                    onMouseLeave={() => setRefer(undefined)}
                                >
                                    {key}
                                </div>
                            </div>
                        ))}
                    </FolderComp>
                    <FolderComp
                        visible={visible}
                        setVisible={setVisible}
                        title="refer"
                        length={Object.keys(referSet).length}
                    >
                        {referSet.map((item, index) => (
                            <div 
                                className='row' 
                                key={index}
                            >
                                <div 
                                    className={`key link ${refer === item ? 'hover' : ''}`}
                                    onMouseEnter={() => setRefer(item)}
                                    onMouseLeave={() => setRefer(undefined)}
                                >
                                [{index}]
                                </div>
                            </div>
                        ))}
                    </FolderComp>
                </>}
            </div>
            {visible.model && <div className="children">
                {childSet.map(item => (
                    <ModelComp 
                        key={item.code}
                        model={item}
                    />
                ))}
                {Object.values(childMap).map(item => (
                    item ? <ModelComp 
                        key={item.code}
                        model={item}
                    /> : null
                ))}
            </div>}
        </div>
    );
}


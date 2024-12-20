export type TargetCollector<T = any>  = {
    hint: string;
    uuid: string;
    result?: T;
    candidateList?: T[];
}

export type TargetCollectorInfo = {
    list: TargetCollector[];
    index: number;
    runner: (list: TargetCollector[]) => void;
}

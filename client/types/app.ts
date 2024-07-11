export type SlotData = {
    slotId  : string;
    name    : string;
    progress: number;
}

export type ConfData = {
    fullscreen: boolean;
    mute      : boolean;
}

export type MetaData = {
    version   : string;
    slots     : SlotData[];
    perference: ConfData;
}

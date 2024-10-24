export enum ModelCode {
    Wisp = "wisp",
    DeathWing = "death_wing",
}

export type MinionModelCode = 
    ModelCode.Wisp |
    ModelCode.DeathWing;

export type CardModelCode = 
    MinionModelCode
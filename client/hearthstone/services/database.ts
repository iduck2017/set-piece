import { Base, Random, Chunk, Def, Factory } from "@/set-piece";
import { MinionRule } from "../models/minion";
import { CombatableRule } from "../models/combatable";
import { CardModel } from "../models/card";
import { CastableRule } from "../models/castable";

export enum KeywordType {
    Battlecry = 'battlecry',
    Deathrattle = 'deathrattle',
    Taunt = 'taunt',
    DivineShield = 'divineShield',
    Rush = 'rush',
    Windfury = 'windfury',
    Charge = 'charge',
}

export enum RaceType {
    Murloc = 'murloc',
    Beast = 'beast',
    Demon = 'demon',
}

export class DataBase {
    private constructor() {}

    private static _cardProductInfo: {
        selectAll: Base.List<Base.Class>,
        sortByRace: Partial<Record<RaceType, Base.List<Base.Class>>>,
        sortByManaCost: Record<string, Base.List<Base.Class>>,
        sortByAttack: Record<string, Base.List<Base.Class>>,
        sortByHealth: Record<string, Base.List<Base.Class>>,
        sortByKeyword: Partial<Record<KeywordType, Base.List<Base.Class>>>,
    } = {   
            selectAll: [],
            sortByRace: {},
            sortByManaCost: {},
            sortByAttack: {},
            sortByHealth: {},
            sortByKeyword: {}
        };
    static get cardProductInfo() {
        const result = { ...DataBase._cardProductInfo };
        return result;
    }

    static randomSelect<T extends Def>(list: Base.List<Base.Class>): Chunk<T> {
        const number = Random.number(0, list.length - 1);
        const Type = list[number];
        const code = Factory.productMap.get(Type);
        if (!code) {
            console.error('[model-not-found]');
            throw new Error();
        }
        return { code };
    }
    
    private static _register(
        Type: Base.Class,
        dict: Record<Base.Key, Base.List<Base.Class>> | Base.List<Base.Class>,
        key: Base.Key = ''
    ) {
        if (!(dict instanceof Array)) {
            if (!dict[key]) dict[key] = [];
            DataBase._register(Type, dict[key]);
        } else {
            if (!dict.includes(Type)) {
                dict.push(Type);
            }
        }
    }
    
    static useCard(config: 
        Partial<
            MinionRule & 
            CombatableRule & 
            CastableRule
        >) {
        return function (Type: Base.Class<CardModel>) {
  
            const { 
                races = [],
                manaCost, 
                attack, 
                health,
                isCharge,
                isRush,
                isWindfury,
                isTaunt,
                isDivineShield
            } = config;
            const {
                _register: register,
                _cardProductInfo: cardProductInfo
            } = DataBase;
            const {
                selectAll,
                sortByAttack,
                sortByHealth,
                sortByManaCost,
                sortByRace
            } = cardProductInfo;

            const keywordList = [];
            if (isCharge) keywordList.push(KeywordType.Charge);
            if (isRush) keywordList.push(KeywordType.Rush);
            if (isWindfury) keywordList.push(KeywordType.Windfury);
            if (isTaunt) keywordList.push(KeywordType.Taunt);
            if (isDivineShield) keywordList.push(KeywordType.DivineShield);

            register(Type, selectAll);
            for (const race of races) register(Type, sortByRace, race);
            if (manaCost !== undefined) register(Type, sortByManaCost, manaCost);
            if (attack !== undefined) register(Type, sortByAttack, attack);
            if (health !== undefined) register(Type, sortByHealth, health);
        };
    }
}
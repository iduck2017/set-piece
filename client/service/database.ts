import { CardModel } from "@/model/hearth/card/card";
import { Base } from "@/type/base";
import { Chunk } from "@/type/chunk";
import { Def } from "@/type/define";
import { Random } from "@/util/random";
import { Factory } from "./factory";
import { MinionRule } from "@/model/hearth/card/minion";
import { CombatableRule } from "@/model/hearth/combatable";
import { CastableRule } from "@/model/hearth/castable";

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
    } = {
            selectAll: [],
            sortByRace: {},
            sortByManaCost: {},
            sortByAttack: {},
            sortByHealth: {}
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
                health 
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

            register(Type, selectAll);
            for (const race of races) register(Type, sortByRace, race);
            if (manaCost !== undefined) register(Type, sortByManaCost, manaCost);
            if (attack !== undefined) register(Type, sortByAttack, attack);
            if (health !== undefined) register(Type, sortByHealth, health);
        };
    }
}
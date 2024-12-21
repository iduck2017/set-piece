import { Base, Random, Chunk, Def, FactoryService } from "@/set-piece";
import { CombativeRule } from "../models/combative";
import { CardModel, CardRule, CardType } from "../models/card";
import { CastableRule } from "../models/castable";
import { DivineShieldRule } from "../models/devine-shield";

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

export class DataBaseService {
    private constructor() {}

    private static _cardProductInfo: {
        selectAll: Base.List<Base.Class>,
        sortByRace: Partial<Record<RaceType, Base.List<Base.Class>>>,
        sortByManaCost: Record<string, Base.List<Base.Class>>,
        sortByAttack: Record<string, Base.List<Base.Class>>,
        sortByHealth: Record<string, Base.List<Base.Class>>,
        sortByKeyword: Partial<Record<KeywordType, Base.List<Base.Class>>>,
        sortByType: Partial<Record<CardType, Base.List<Base.Class>>>,
    } = {   
            selectAll: [],
            sortByRace: {},
            sortByManaCost: {},
            sortByAttack: {},
            sortByHealth: {},
            sortByKeyword: {},
            sortByType: {}
        };
    static get cardProductInfo() {
        const result = { ...DataBaseService._cardProductInfo };
        return result;
    }

    static randomSelect<T extends Def>(list: Base.List<Base.Class>): Chunk<T> {
        const number = Random.number(0, list.length - 1);
        const Type = list[number];
        const code = FactoryService.productMap.get(Type);
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
            DataBaseService._register(Type, dict[key]);
        } else {
            if (!dict.includes(Type)) {
                dict.push(Type);
            }
        }
    }
    
    static useCard(config: 
        Partial<{
            type: CardType,
            combative: CombativeRule,
            castable: CastableRule,
            divineShield: DivineShieldRule
        }> & 
        CardRule) {
        return function (Type: Base.Class<CardModel>) {
            const { 
                combative,
                castable,
                divineShield,
                type
            } = config;
            const {
                health,
                attack
            } = combative || {};
            const {
                manaCost
            } = castable || {};

            const {
                _register: register,
                _cardProductInfo: cardProductInfo
            } = DataBaseService;
            const {
                selectAll,
                sortByAttack,
                sortByHealth,
                sortByManaCost,
                sortByType
            } = cardProductInfo;

            const keywordList = [];
            if (divineShield?.isActived) keywordList.push(KeywordType.DivineShield);

            register(Type, selectAll);
            if (manaCost !== undefined) register(Type, sortByManaCost, manaCost);
            if (attack !== undefined) register(Type, sortByAttack, attack);
            if (health !== undefined) register(Type, sortByHealth, health);
            if (type !== undefined) register(Type, sortByType, type);
        };
    }
}
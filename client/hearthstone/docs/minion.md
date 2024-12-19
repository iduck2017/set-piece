# 创建随从

你是一位炉石传说的开发者，请遵从如下规则生成一个随从类，随从的属性、效果、描述等已经给出

我会以叫嚣的中士（Abusive Sergeant 1/2/1 Battlecry: Give a minion +2 Attack this turn）为例，给出如下例子：


- 创建一个文件，用于描述随从的基本属性：

    - 文件应被放置在models/minions路径下，命名规范：随从名.ts，kebab-case 
    - 将此次对话的提示词复制在@prompt注释中
    - 你需要实现实体的类型声明，命名规范：随从名+Def，UpperCase
    - 你需要实现实体的类声明，命名规范：随从名+Model，UpperCase

```typescript
import { CardDef } from "../card";
import { BattlecryAbusiveSergeantModel } from "../features/battlecry-abusive-sergeant";
import { MinionModel, MinionDef } from "../minion";

/**
 * @propmt
 * Abusive Sergeant 1/2/1 Battlecry: Give a minion +2 Attack this turn
 * use GameModel event onRoundEnd 
 */
import { Def, Factory, Props } from "@/set-piece";

export type AbusiveSergeantDef = MinionDef<
    CustomDef<{
        code: 'abusive-sergeant',
        childDict: {
            battlecry: BattlecryAbusiveSergeantModel
        }
    }>
>

@MinionModel.useRule({
    manaCost: 1,
    health: 1,
    attack: 2,
    races: []
}) 
@Factory.useProduct('abusive-sergeant')
export class AbusiveSergeantModel extends MinionModel<AbusiveSergeantDef> {
    constructor(props: Props<AbusiveSergeantDef & CardDef & MinionDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            stateDict: {},
            paramDict: {
                name: 'Abusive Sergeant',
                desc: 'Battlecry: Give a minion +2 Attack this turn.'
            },
            childDict: {
                battlecry: { code: 'battlecry-abusive-sergeant' },
                ...superProps.childDict
            }
        });
    }

    debug() {
        super.debug();
        this.childDict.battlecry.debug();
    }
}

    
```

2. 创建一个文件，用于描述随从的特殊效果，以叫嚣的中士为例：

    - 你需要根据这个效果的关键词寻找合适的前缀，例如battlecry-，deathwisp-，默认使用feture-
    - 文件应被放置在models/features路径下，命名规范：前缀+随从名.ts，kebab-case 
    - 你需要实现实体的类型声明，命名规范：前缀+随从名+Def，UpperCase
    - 你需要实现实体的类声明，命名规范： 前缀+随从名+Model，UpperCase

```typescript

import { Def, Factory, Lifecycle, Props } from "@/set-piece";
import { FeatureDef, FeatureModel } from "../feature";
import { CardModel, TargetCollector } from "../card";
import { AbusiveSergeantModel } from "../minions/abusive-sergeant";
import { BuffAbusiveSergeantModel } from "../effects/buff-abusive-sergeant";

export type BattlecryAbusiveSergeantDef = FeatureDef<
    CustomDef<{
        code: 'battlecry-abusive-sergeant',
        parent: AbusiveSergeantModel
    }>
>

@Factory.useProduct('battlecry-abusive-sergeant')
export class BattlecryAbusiveSergeantModel extends FeatureModel<BattlecryAbusiveSergeantDef> {
    constructor(props: Props<BattlecryAbusiveSergeantDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Abusive Sergeant\'s Battlecry',
                desc: 'Give a minion +2 Attack this turn.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    @Lifecycle.useLoader()
    private _handleBattlecry() {
        const minion = this.refer.minion;
        if (!minion) return;
        this.bindEvent(
            minion.eventEmitterDict.onBattlecry,
            (target, targetCollectorList) => {
                const targetCollector:
                    TargetCollector<CardModel> | undefined = 
                    targetCollectorList.find(
                        item => item.uuid === this.uuid
                    );
                if (targetCollector?.result) {
                    targetCollector.result.childDict.featureList.accessFeature<
                        BuffAbusiveSergeantModel
                    >({
                        code: 'buff-abusive-sergeant'
                    });
                }
            }
        );
    }

    @Lifecycle.useLoader()
    private _handleTargetCheck() {
        const card = this.refer.card;
        if (!card) return;
        this.bindEvent(
            card.eventEmitterDict.onTargetCheck,
            (targetCollectorList: TargetCollector[]) => {
                const minionList = this.refer.queryMinionList({});
                if (minionList.length) {
                    targetCollectorList.push({
                        uuid: this.uuid,
                        hint: 'Choose a minion.',
                        validator: (model) => CardModel.validate(
                            model,
                            { isMinionOnBoard: true }
                        )
                    });
                }
            }
        );
    }
}

```

3. 如果该随从对外部施加了副作用（例如光环，buff），你应当创建一个文件，用于描述随从的作用效果，以叫嚣的中士为例：

    - 你需要根据这个效果的关键词寻找合适的前缀，例如buff-，debuff-，默认使用effect-
    - 文件应被放置在models/effects路径下，命名规范：前缀+随从名.ts，kebab-case 
    - 你需要实现实体的类型声明，命名规范：前缀+随从名+Def，UpperCase
    - 你需要实现实体的类声明，命名规范： 前缀+随从名+Model，UpperCase

```typescript

import { Factory } from "@/set-piece/services/factory";
import { Props } from "@/set-piece/types/props";
import { Def } from "@/set-piece";
import { BuffModel, BuffDef } from "../buff";

export type BuffAbusiveSergeantDef = BuffDef<
    CustomDef<{
        code: 'buff-abusive-sergeant',
    }>
>

@Factory.useProduct('buff-abusive-sergeant')
export class BuffAbusiveSergeantModel extends BuffModel<BuffAbusiveSergeantDef> {
    constructor(props: Props<BuffAbusiveSergeantDef>) {
        const buffProps = BuffModel.buffProps(props);
        super({
            ...buffProps,
            paramDict: {
                name: 'Abusive Sergeant\'s Buff',
                desc: 'Give a minion +2 Attack this turn.',
                modAttack: 2,
                modHealth: 0,
                shouldDisposedOnRoundEnd: true
            },
            stateDict: {},
            childDict: {}
        });
    }
}

```

此外，你还需要注意以下几点：

1. 代码中不要出现中文
2. 不要修改set-piece文件夹下的代码
3. 衍生物需要将useRule的参数2设置为true Minion.useRule({}, true)
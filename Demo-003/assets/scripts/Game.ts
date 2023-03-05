import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    @property({ type: Node })
    private enemyAttackNode: Node = null!;

    private enemyAttackType = 0;// 0: 弓箭, 1: 流星锤, 2: 盾牌
    private timer = null;
    start() {

    }

    update(deltaTime: number) {
        
    }
}



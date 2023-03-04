import { _decorator, Component, Node, Prefab, Input, input, Director, Vec3, instantiate, Collider, RigidBody, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    @property({ type: Node })
    private ballNode: Node = null; // 绑定ball节点
    @property({ type: Prefab })
    private blockPrefab: Prefab = null; // 绑定block预制体
    @property({ type: Node })
    private blocksNode: Node = null; // 绑定blocks节点

    @property({type:Label})
    private scoreLabel: Label = null; // 绑定score节点

    private bounceSpeed: number = 0; // 小球第一次落地时的速度
    private gameState: number = 0; // 0: 等待开始 1：游戏开始 2：游戏结束
    private blockGap: number = 2.4; // 两块跳板的间距
    private score: number = 0; // 游戏得分

    start() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.collisionHandler();
        this.initBlock(); // 初始化跳板
    }

    update(dt) {
        if (this.gameState == 1) {
            let speed = -2 * dt; // 移动速度

            for (let blockNode of this.blocksNode.children) {
                let pos = blockNode.position.clone();
                pos.x += speed;
                blockNode.position = pos;

                this.checkBlockOut(blockNode); // 跳板出界处理
            }
        }

        // 小球掉出屏幕外
        if (this.ballNode.position.y < -4) {
            this.gameState = 2;
            Director.instance.loadScene('Game'); // 重新加载game场景
        }
    }

    // 跳板出界处理
    checkBlockOut(blockNode) {
        if (blockNode.position.x < -3) {
            // 将出界跳板的坐标修改到下一个要出现的位置
            let nextBlockPosX = this.getLastBlockPosX() + this.blockGap;
            let nextBlockPosY = 0;
            blockNode.position = new Vec3(nextBlockPosX, nextBlockPosY, 0);
            this.incrScore(); // 增加得分
        }
    }

    // 获取最后一块跳板的位置
    getLastBlockPosX() {
        let lastBlockPosX = 0;
        for (let blockNode of this.blocksNode.children) {
            if (blockNode.position.x > lastBlockPosX) {
                lastBlockPosX = blockNode.position.x;
            }
        }
        return lastBlockPosX;
    }

    // 创建新跳板
    createNewBlock(pos) {
        let blockNode = instantiate(this.blockPrefab); // 创建预制节点
        blockNode.position = pos; // 设置节点生成位置
        this.blocksNode.addChild(blockNode); // 将节点添加到blocks节点下
    }

    // 初始化跳板
    initBlock() {
        let posX;

        for (let i = 0; i < 8; i++) {
            if (i == 0) {
                posX = this.ballNode.position.x; // 第一块跳板生成在小球下方
            } else {
                posX = posX + this.blockGap; // 根据间隔获取下一块跳板位置
            }

            this.createNewBlock(new Vec3(posX, 0, 0));
        }
    }

    collisionHandler() {
        let collider = this.ballNode.getComponent(Collider);
        let rigidbody = this.ballNode.getComponent(RigidBody);

        collider.on('onCollisionEnter', () => {
            // 首次落地前bounceSpeed值为0，此时会将小球落地速度的绝对值进行赋值
            let vc = new Vec3(0, 0, 0);
            rigidbody.getLinearVelocity(vc);

            if (this.bounceSpeed == 0) {
                this.bounceSpeed = Math.abs(vc.y);
            } else {
                // 此后落地反弹的速度锁定为第一次落地的速度
                rigidbody.setLinearVelocity(new Vec3(0, this.bounceSpeed, 0));
            }
        }, this);
    }

    onTouchStart() {
        // 只有小球落地后才可以进行操作
        if (this.bounceSpeed == 0) return;

        let rigidbody = this.ballNode.getComponent(RigidBody);
        // 将小球的下落速度变成反弹速度的1.5倍，实现加速逻辑
        rigidbody.setLinearVelocity(new Vec3(0, -this.bounceSpeed * 1.5, 0));

        this.gameState = 1; // 游戏开始
    }

    // 得分增加
    incrScore() {
        this.score = this.score + 1;
        this.scoreLabel.string = String(this.score);
    }
}
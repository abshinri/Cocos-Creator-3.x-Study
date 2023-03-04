import { _decorator, Component, Input, input, Node, tween, Vec3, Tween, Director, Label, ParticleSystem2D, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    @property(Node)
    private bulletNode: Node = null!; // 绑定bullet节点
    @property(Node)
    private enemyNode: Node = null!; // 绑定enemy节点
    @property(Label)
    private scoreLabel: Label = null!; // 绑定score节点
    @property(Node)
    private boomNode: Node = null!; // 绑定boom节点


    private score: number = 0; // 游戏得分
    private gameState: number = 0; // 0: 子弹未发射 1：子弹已发射 2：游戏结束
    private bulletTween: Tween<Node> = null!;
    private enemyTween: Tween<Node> = null!;

    start() {
        input.on(Input.EventType.TOUCH_START, this.fire, this);

        this.newLevel();
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.fire, this);
    }

    update() {
        this.checkHit();
    }

    // 游戏初始化
    newLevel() {
        this.enemyInit();
        this.bulletInit();

        this.gameState = 0; // 重置游戏状态
    }

    // 子弹初始化
    bulletInit() {
        let st_pos = new Vec3(0, -340, 0); // 子弹初始化时的位置

        this.bulletNode.setPosition(st_pos); // 设置敌人到初始位置
        this.bulletNode.active = true; // 显示子弹节点
    }

    // 敌人初始化
    enemyInit() {
        let st_pos = new Vec3(300, 260, 0); // 敌人初始化时的位置
        let dua; // 从屏幕右边移动到左边所需的时间

        dua = 1.5 - Math.random() * 0.5; // 移动时间随机范围 1-1.5
        st_pos.y = st_pos.y - Math.random() * 40; // 初始y坐标随机范围220-260  
        
        // 50%几率改变初始位置到对侧
        if (Math.random() > 0.5) {
          st_pos.x = -st_pos.x;
        }

        this.enemyNode.setPosition(st_pos.x, st_pos.y); // 设置敌人到初始位置

        this.enemyNode.active = true; // 显示敌人节点

        this.enemyTween = tween(this.enemyNode) // 指定缓动对象
            .to(dua, { position: new Vec3(-st_pos.x, st_pos.y, 0) }) // 移动到另一侧
            .to(dua, { position: new Vec3(st_pos.x, st_pos.y, 0) }) // 回到初始位置
            .union()  // 将上下文的缓动动作打包成一个
            .repeatForever() // 重复执行打包的动作
            .start();  // 启动缓动
    }

    // 得分增加
    incrScore() {
        this.score = this.score + 1;
        this.scoreLabel.string = String(this.score);
    }

    // 子弹发射
    fire() {
        if (this.gameState != 0) return; // 子弹已经发射

        this.gameState = 1; // 修改子弹发射标记变量

        this.bulletTween = tween(this.bulletNode) // 指定缓动对象
            .to(0.6, { position: new Vec3(0, 600, 0) }) // 将对象坐标移动到目标位置
            .call(() => {
                this.gameOver();
            })
            .start(); // 启动缓动
    }

    // 播放爆破粒子效果
    boom(pos, color) {
        this.boomNode.setPosition(pos);
        let particle = this.boomNode.getComponent(ParticleSystem2D);
        if (color !== undefined) {
            particle.startColor = particle.endColor = color;
        }
        particle.resetSystem();
    }


    // 撞击检测
    checkHit() {
        if (this.gameState != 1) return; // 子弹处于发射状态时才执行后续逻辑

        // 获取两个坐标点的距离
        let dis = Vec3.distance(this.bulletNode.position, this.enemyNode.position);

        if (dis <= 50) {
            this.bulletTween.stop(); // 关闭子弹发射的缓动动画
            this.enemyTween.stop(); // 关闭敌人移动的缓动动画
            this.gameState = 2; // 游戏结束

            this.bulletNode.active = false; // 隐藏子弹对象
            this.enemyNode.active = false; // 隐藏敌人对象

            // 播放爆破粒子效果
            let enemyColor = this.enemyNode.getComponent(Sprite).color; // 敌人的颜色
            this.boom(this.bulletNode.position, enemyColor);

            this.incrScore(); // 增加得分
            this.newLevel(); // 设置新一轮的游戏
        }
    }

    // 游戏结束
    gameOver() {
        this.gameState = 2;

        // 播放爆破粒子效果
        let bulletColor = this.bulletNode.getComponent(Sprite).color; // 子弹的颜色
        this.boom(this.bulletNode.position, bulletColor);

        // 死亡后延时1s，用于显示爆破粒子
        setTimeout(() => {
            Director.instance.loadScene('Game');
        }, 1000);
    }
}
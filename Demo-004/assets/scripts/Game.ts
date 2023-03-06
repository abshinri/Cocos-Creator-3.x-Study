import {
  _decorator,
  Component,
  Node,
  EventTarget,
  input,
  Input,
  tween,
  Vec3,
  Tween,
  Director,
  Label,
  ParticleSystem2D,
  Sprite,
  Color,
} from "cc";
const { ccclass, property } = _decorator;
const eventTarget = new EventTarget();

@ccclass("Game")
export class Game extends Component {
  @property({ type: Node })
  private bulletNode: Node = null;
  @property({ type: Node })
  private enemyNode: Node = null;
  @property({ type: Label })
  private scoreLabel: Label = null;
  @property({ type: Node })
  private boomNode: Node = null;

  private gameState: number = 0; // 0: 子弹待发射, 1: 发射中, 2: 游戏结束
  private enemyTween: Tween<Node> = null;
  private bulletTween: Tween<Node> = null;
  private score: number = 0;

  clickHandle() {
    // 如果游戏结束,点击屏幕重新开始游戏
    if (this.gameState === 2) {
      this.scoreLabel.string = "分数: " + 0;
      this.score = 0;
      this.resetGame();
      return;
    } else if (this.gameState === 0) {
      console.log("fire");
      this.gameState = 1;

      this.bulletTween = tween(this.bulletNode)
        .to(0.6, { position: new Vec3(0, 600, 0) })
        .call(() => {
          // 如果让动画执行完,则等于游戏结束
          this.gameOver();
        })
        .start();
    }
  }

  checkHit() {
    if (this.gameState !== 1) return;
    // 检测子弹和和敌人的距离,小于50则命中
    const dis = Vec3.distance(
      this.bulletNode.position,
      this.enemyNode.position
    );

    if (dis <= 50) {
      this.bulletTween.stop();
      this.gameState = 2;
      console.log("hit");

      this.bulletNode.active = false;
      this.enemyNode.active = false;

      const enemyColor = this.enemyNode.getComponent(Sprite).color;
      this.handleBoomPlay(this.bulletNode.position, enemyColor);

      this.score += 1;
      this.scoreLabel.string = "分数: " + this.score;
      this.resetGame();
    }
  }

  // 重置游戏
  resetGame() {
    // 创建一个-320到-360的随机数
    const randomY = Math.random() * 40 - 60;

    this.gameState = 0;
    this.bulletNode.active = true;
    this.bulletNode.setPosition(new Vec3(0, randomY, 0));
    this.enemyInit();
  }

  // 初始化敌人
  enemyInit() {
    // 取-260到260的随机数
    const randomX = Math.random() * 520 - 260;

    const start_pos = new Vec3(randomX, 260, 0);

    // 取0.5到3的随机数
    const randomTime = Math.random() * 2.5 + 0.5;

    const duartion = randomTime;

    this.enemyNode.setPosition(start_pos);

    // 给敌人配置随机颜色
    this.enemyNode.getComponent(Sprite).color = new Color(
      Math.random() * 255,
      Math.random() * 255,
      Math.random() * 255
    );

    this.enemyNode.active = true;

    this.enemyTween = tween(this.enemyNode)
      .to(duartion, { position: new Vec3(-300, start_pos.y, 0) })
      .to(duartion, { position: new Vec3(300, start_pos.y, 0) })
      .union() // 打包这组动作
      .repeatForever() // 重复这组动作
      .start();
  }

  gameOver() {
    console.log("game over");

    this.scoreLabel.string = "游戏结束,分数为: " + this.score;
    this.gameState = 2;
  }
  // 控制爆炸动画
  handleBoomPlay(pos, color) {
    this.boomNode.setPosition(pos);
    // 获取节点上的2D粒子组件
    const particle = this.boomNode.getComponent(ParticleSystem2D);
    if (color !== undefined) {
      particle.startColor = particle.endColor = color;
    }
    // 杀死所有存在的粒子，然后重新启动粒子发射器
    particle.resetSystem();
  }

  onLoad() {
    input.on(Input.EventType.TOUCH_START, this.clickHandle, this);
  }

  start() {
    this.enemyInit();
  }

  update(deltaTime: number) {
    this.checkHit();
  }
  onDestroy() {
    eventTarget.off(Input.EventType.TOUCH_START, this.clickHandle, this);
  }
}

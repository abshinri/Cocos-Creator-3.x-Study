import {
  _decorator,
  Component,
  Node,
  input,
  Input,
  RigidBody2D,
  Vec2,
  Vec3,
  instantiate,
  Collider2D,
  Contact2DType,
  Prefab,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Game")
export class Game extends Component {
  @property({ type: Node })
  private ballNode: Node = null;
  @property({ type: Prefab })
  private blockPrefab: Prefab = null;
  @property({ type: Node })
  private blocksNode: Node = null;
  private blockGap: number = 250; // 每个方块之间的间隔

  private bounceSpeed: number = 0; // 记录球第一次的起跳速度,以后每次起跳都是这个速度
  private gameState: number = 0; // 0:未开始 1:进行中 2:结束
  // 点击屏幕
  onTouchStart() {
    // 球至少需要一次落地才能开始操作
    if (this.bounceSpeed == 0) return;

    // 2D的物理效果用RigidBody2D组件来实现
    const ballRigidBody = this.ballNode.getComponent(RigidBody2D);
    ballRigidBody.linearVelocity = new Vec2(0, -this.bounceSpeed * 1.5);
    this.gameState = 1;
  }

  // 控制碰撞事件
  collisionHandler() {
    // 2D的碰撞效果用Collider2D组件来实现
    const ballCollider = this.ballNode.getComponent(Collider2D);
    const ballRigidBody = this.ballNode.getComponent(RigidBody2D);

    // 需要节点上开启Enabled Contact Listener后才能触发
    ballCollider.on(
      Contact2DType.BEGIN_CONTACT,
      () => {
        if (this.bounceSpeed == 0) {
          this.bounceSpeed = Math.abs(ballRigidBody.linearVelocity.y);
        } else {
          ballRigidBody.linearVelocity = new Vec2(0, this.bounceSpeed);
        }
      },
      this
    );
  }
  // 先初始化五个方块
  initBlock() {
    let posX;
    for (let i = 0; i < 5; i++) {
      if (i == 0) {
        posX = this.ballNode.position.x;
      } else {
        posX = posX + this.blockGap;
      }
      console.log(posX);
      this.createNewBlock(new Vec3(posX, 0, 0));
    }
  }

  // 创建新砖块
  createNewBlock(pos) {
    let blockNode = instantiate(this.blockPrefab);
    blockNode.position = pos;
    this.blocksNode.addChild(blockNode);
  }

  // 检查最后一块转的位置
  getLastBlockPosX() {
    let lastBlockPosX = 0;
    for (const blockNode of this.blocksNode.children) {
      if (blockNode.position.x > lastBlockPosX) {
        lastBlockPosX = blockNode.position.x;
      }
    }
    return lastBlockPosX;
  }

  // 检查砖块是否超出屏幕
  checkBlockOut(blockNode) {
    if (blockNode.position.x < -400) {
      const nextPosX = this.getLastBlockPosX() + this.blockGap;
      this.createNewBlock(new Vec3(nextPosX, 0, 0));
      blockNode.destroy();
    }
  }

  // 检查球是否超出屏幕
  checkBallOut() {
    if (this.ballNode.position.y < -640) {
      this.ballNode.position = new Vec3(-250, 200, 0);
    }
  }

  // 移动所有的砖块
  moveAllBlock(dt) {
    const speed = -300 * dt;

    for (const blockNode of this.blocksNode.children) {
      const pos = blockNode.position.clone();
      pos.x += speed;
      blockNode.position = pos;

      this.checkBlockOut(blockNode);
    }
  }

  start() {
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    this.collisionHandler();
    this.ballNode.position = new Vec3(-250, 200, 0);
    this.initBlock();
  }

  update(deltaTime: number) {
    if (this.gameState == 1) {
      this.moveAllBlock(deltaTime);
      this.checkBallOut()
    }
  }
}

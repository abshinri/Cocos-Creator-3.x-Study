import {
  _decorator,
  Component,
  Node,
  Prefab,
  resources,
  Texture2D,
  instantiate,
  Vec2,
  Vec3,
  director,
} from "cc";
const { ccclass, property } = _decorator;

// 获取预制体绑定的脚本
import { Block } from "./Block";
import { Audio } from "./Audio";

@ccclass("Game")
export class Game extends Component {
  @property({ type: Prefab })
  private blockPrefab: Prefab = null; // 绑定block预制体
  @property({ type: Node })
  private bgNode: Node = null; // 绑定bg节点
  @property({ type: Node })
  private audioNode: Node = null; // 绑定audio节点
  private audioScript: any = null; // 绑定audio脚本

  private blockRowNum: number = 3; // 每行的砖块数量
  private picNodeArr: Array<Node[]> = []; // 存储所有的砖块节点

  private holeNode: Node;
  // 加载图片
  loadPicture() {
    // 取一个1和2之间的随机数
    const randomNum = Math.floor(Math.random() * 2) + 1;

    resources.load(`pic_${randomNum}/texture`, Texture2D, (err, texture) => {
      if (err) {
        console.error(err);
        return;
      }
      this.initGame(texture);
      this.digHole();
      this.disorganize(20);
    });
  }

  // 挖空右下的砖块方便移动
  digHole() {
    const holePosition = new Vec2(this.blockRowNum - 1, this.blockRowNum - 1);
    const holeNode = this.picNodeArr[holePosition.x][holePosition.y];
    holeNode.active = false;
    this.holeNode = holeNode;
  }
  // 方向数组
  private dirs = [
    new Vec2(0, 1), // 上
    new Vec2(0, -1), // 下
    new Vec2(1, 0), // 右
    new Vec2(-1, 0), // 左
  ];

  /**
   * 打乱砖块的位置
   * @param swapTimes 交换的次数
   */
  disorganize(swapTimes: number) {
    for (let i = 0; i < swapTimes; i++) {
      const randomDir = this.dirs[Math.floor(Math.random() * 4)]; // 随机取一个方向
      // 获取被隐藏的砖块的的脚本
      const holeBlockScript = this.holeNode.getComponent("Block") as Block;
      // 获取被隐藏的砖块的随机的临近位置
      // -通过clone方法复制一个新的Vec2对象，否则会改变原来的nowPosition
      // -通过add方法叠加一个随机的方向,得出随机的临近位置
      const nextPosition = holeBlockScript.nowPosition.clone().add(randomDir);
      // 越界检测,检测这个随机的临近位置是否在砖块数组的范围内
      if (
        nextPosition.x < 0 ||
        nextPosition.x >= this.blockRowNum ||
        nextPosition.y < 0 ||
        nextPosition.y >= this.blockRowNum
      ) {
        // 越界了，直接到下一个循环
        continue;
      }
      // 交换两个砖块的位置
      this.swapBlockByPosition(holeBlockScript.nowPosition, nextPosition);
    }
  }

  /**
   * 交换两个砖块的位置
   * @param nowPosition
   * @param nextPosition
   */
  swapBlockByPosition(nowPosition: Vec2, nextPosition: Vec2) {
    // 获取两个砖块的节点
    const nowNode = this.picNodeArr[nowPosition.x][nowPosition.y];
    const nextNode = this.picNodeArr[nextPosition.x][nextPosition.y];

    // 交换两个砖块的位置
    const tempPosition = nowNode.position.clone();
    nowNode.setPosition(nextNode.getPosition());
    nextNode.setPosition(tempPosition);

    // 调整两个砖块脚本内的nowPosition属性
    const nowBlockScript = nowNode.getComponent("Block") as Block;
    const nextBlockScript = nextNode.getComponent("Block") as Block;
    nowBlockScript.nowPosition = nextPosition;
    nextBlockScript.nowPosition = nowPosition;

    // 交换两个砖块在数组中的位置
    this.picNodeArr[nowPosition.x][nowPosition.y] = nextNode;
    this.picNodeArr[nextPosition.x][nextPosition.y] = nowNode;
  }

  /**
   * 处理砖块的点击事件
   * @param blockPosition 传入被点击的砖块的位置
   */
  handleBlockClick(blockPosition: Vec2) {
    // 检测传入的砖块的上下左右是否有可移动的空间
    for (let i = 0; i < this.dirs.length; i++) {
      // 获取被点击的砖块的随机的临近位置
      const nextPosition = blockPosition.clone().add(this.dirs[i]);
      // 越界检测,检测这个随机的临近位置是否在砖块数组的范围内
      if (
        nextPosition.x < 0 ||
        nextPosition.x >= this.blockRowNum ||
        nextPosition.y < 0 ||
        nextPosition.y >= this.blockRowNum
      ) {
        // 越界了，直接到下一个循环
        continue;
      }
      // 判断这个随机的临近位置是否是空的
      if (this.picNodeArr[nextPosition.x][nextPosition.y] === this.holeNode) {
        this.audioScript.playAudio();
        // 交换两个砖块的位置
        this.swapBlockByPosition(blockPosition, nextPosition);

        // 检测游戏是否胜利
        if (this.checkGameWin()) {
          console.log("游戏胜利");
          this.gameWin();
        }

        break;
      }
    }
  }

  /**
   * 检测游戏是否胜利
   */
  checkGameWin() {
    for (let i = 0; i < this.blockRowNum; i++) {
      for (let j = 0; j < this.blockRowNum; j++) {
        const blockNode = this.picNodeArr[i][j];
        const blockScript = blockNode.getComponent("Block") as Block;
        // 检测每个砖块的位置是否和初始位置一致
        if (
          blockScript.nowPosition.x !== blockScript.startPosition.x ||
          blockScript.nowPosition.y !== blockScript.startPosition.y
        ) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 游戏胜利后执行的操作
   */
  gameWin() {
    // 游戏胜利后, 恢复隐藏的砖块
    this.holeNode.active = true;
    // 注销点击事件
    director.off("clickPicBlock");
  }

  // 初始化游戏
  initGame(texture: Texture2D) {
    this.picNodeArr = [];

    const blockSideSize = texture.image.width / this.blockRowNum; // 计算每个砖块的边长

    // 生成blockRowNum x blockRowNum砖块
    // i对应x轴
    for (let i = 0; i < this.blockRowNum; i++) {
      this.picNodeArr[i] = [];
      for (let j = 0; j < this.blockRowNum; j++) {
        // 因为生成的操作在对应y轴的j循环中,
        // 所以在游戏中砖块实际的生成顺序是从上到下，从左到右
        const blockNode = instantiate(this.blockPrefab); // 实例化预制体
        const blockScript = blockNode.getComponent("Block") as Block; // 获取预制体绑定的脚本

        // 节点的setPosition接收{x?,y?,z?}，或者一个Vec3对象
        // 预制体block的锚点在左上角
        // 对于y轴来说锚点上方为正数，下方为负数
        // 所以这里的y轴坐标需要取反, 让每列砖块的位置都是从上到下放置
        blockNode.setPosition(
          new Vec3(i * blockSideSize, -j * blockSideSize, 0)
        ); // 设置预制体的位置(相对于bg节点）

        console.log(blockNode.getPosition());

        blockScript.initBlock(texture, blockSideSize, new Vec2(i, j)); // 初始化预制体
        this.picNodeArr[i][j] = blockNode;
        this.bgNode.addChild(blockNode); // 将预制体添加到bg节点下(作为bg节点的子节点)
      }
    }
  }

  start() {
    // 加载图片
    this.loadPicture();
    //  绑定音乐控制器脚本
    this.audioScript = this.audioNode.getComponent("Audio") as Audio;
    director.on("clickPicBlock", this.handleBlockClick, this);
  }

  update(deltaTime: number) {}
}

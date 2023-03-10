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
} from "cc";
const { ccclass, property } = _decorator;

// 获取预制体绑定的脚本
import { Block } from "./Block";

@ccclass("Game")
export class Game extends Component {
  @property({ type: Prefab })
  private blockPrefab: Prefab = null; // 绑定block预制体
  @property({ type: Node })
  private bgNode: Node = null; // 绑定bg节点

  private blocRowkNum: number = 3; // 每行的砖块数量
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
      //   this.digHole();
    });
  }

  // 挖空右下的砖块方便移动
  digHole() {
    const holePosition = new Vec2(this.blocRowkNum - 1, this.blocRowkNum - 1);
    const holeNode = this.picNodeArr[holePosition.y][holePosition.x];
    holeNode.active = false;
    this.holeNode = holeNode;
  }

  // 打乱砖块
  disorganize() {}

  // 初始化游戏
  initGame(texture: Texture2D) {
    this.picNodeArr = [];

    const blockSideSize = texture.image.width / this.blocRowkNum; // 计算每个砖块的边长

    // 生成blocRowkNum x blocRowkNum砖块
    for (let i = 0; i < this.blocRowkNum; i++) {
      this.picNodeArr[i] = [];
      for (let j = 0; j < this.blocRowkNum; j++) {
        const blockNode = instantiate(this.blockPrefab); // 实例化预制体
        const blockScript = blockNode.getComponent("Block") as Block; // 获取预制体绑定的脚本

        // 节点的setPosition接收{x?,y?,z?}，或者一个Vec3对象
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
    this.loadPicture();
  }

  update(deltaTime: number) {}
}

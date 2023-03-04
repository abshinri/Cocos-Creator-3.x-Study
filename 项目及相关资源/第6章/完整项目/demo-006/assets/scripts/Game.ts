import { _decorator, Component, Node, EventTarget, Prefab, Texture2D, resources, instantiate, Vec3, Vec2, director } from 'cc';
const { ccclass, property } = _decorator;

import { Block } from './Block';
import { AudioManager } from './AudioManager';

@ccclass('Game')
export class Game extends Component {
    @property({ type: Prefab })
    private blockPrefab: Prefab = null; // 绑定block预制体
    @property({ type: Node })
    private bgNode: Node = null; // 绑定bg节点

    @property({ type: AudioManager })
    private audioManager: AudioManager = null;

    private blockNum: number = 3;  // 拼图规模
    private picNodeArr = [];

    private hideBlockNode: Node;

    start() {
        this.loadPicture();
 
        director.on('click_pic', this.onClickPic, this);
    }

    loadPicture() {
        // 随机读取一个拼图素材
        let pic_num = Math.floor(Math.random() * 2) + 1;

        resources.load(`pic_${pic_num}/texture`, Texture2D, (err, texture) => {
            if (err) {
                console.error(err);
                return;
            }

            this.initGame(texture);
            this.removeOnePic();
            this.randPic();
        });
    }

    initGame(texture) {
        this.picNodeArr = [];

        // 计算拼图块的边宽
        let blockSide = texture.image.width / this.blockNum;

        // 生成NxN块数的拼图块，其中N为blockNum
        for (let i = 0; i < this.blockNum; i++) {
            this.picNodeArr[i] = [];
            for (let j = 0; j < this.blockNum; j++) {
                const blockNode = instantiate(this.blockPrefab);
                const blockScript = blockNode.getComponent('Block') as Block;

                blockNode.setPosition(new Vec3(j * blockSide, -i * blockSide, 0));
                blockScript.init(texture, blockSide, new Vec2(j, i));
                this.picNodeArr[i][j] = blockNode;
                this.bgNode.addChild(blockNode);
            }
        }
    }

    // 挖空右下角拼图块
    removeOnePic() {
        let pos = new Vec2(this.blockNum - 1, this.blockNum - 1);
        let picNode = this.picNodeArr[pos.y][pos.x];
        picNode.active = false;
        this.hideBlockNode = picNode;
    }

    // 打乱拼图块
    randPic() {
        let swapTimes = 100; // 随机次数

        for (let i = 0; i < swapTimes; i++) {
            let dirs = [
                new Vec2(0, 1),
                new Vec2(0, -1),
                new Vec2(1, 0),
                new Vec2(-1, 0)
            ];

            let randDir = dirs[Math.floor(Math.random() * dirs.length)];
            let hideBlockNodeScript = this.hideBlockNode.getComponent('Block') as Block;
            let nearIndex = hideBlockNodeScript.nowIndex.clone().add(randDir);

            // 越界检测
            if (nearIndex.x < 0 ||
                nearIndex.x >= this.blockNum ||
                nearIndex.y < 0 ||
                nearIndex.y >= this.blockNum) {
                continue;
            }

            this.swapPicByPos(hideBlockNodeScript.nowIndex, nearIndex);
        }
    }

    // 交换两个位置的拼图块
    swapPicByPos(nowPos, desPos) {
        let nowPicNode = this.picNodeArr[nowPos.y][nowPos.x];
        let desPicNode = this.picNodeArr[desPos.y][desPos.x];

        // 交换位置
        let tempPos = nowPicNode.position.clone();
        nowPicNode.position = desPicNode.position;
        desPicNode.position = tempPos;

        // 交互标记
        let nowPicNodeScript = nowPicNode.getComponent('Block') as Block;
        let desPicNodeScript = desPicNode.getComponent('Block') as Block;
        let tempIndex = nowPicNodeScript.nowIndex.clone();
        nowPicNodeScript.nowIndex = desPicNodeScript.nowIndex;
        desPicNodeScript.nowIndex = tempIndex;

        // 交换数组标记位置
        let tempNode = nowPicNode;
        this.picNodeArr[nowPos.y][nowPos.x] = desPicNode;
        this.picNodeArr[desPos.y][desPos.x] = tempNode;
    }

    // 点击处理
    onClickPic(nowIndex) {
        let dirs = [
            new Vec2(0, 1),
            new Vec2(0, -1),
            new Vec2(1, 0),
            new Vec2(-1, 0)
        ];
        let nearBlockNode;

        // 检查上下左右是否有位置可以移动
        for (let dir of dirs) {
            let nearIndex = nowIndex.clone().add(dir);

            // 越界检测
            if (nearIndex.x < 0 ||
                nearIndex.x >= this.blockNum ||
                nearIndex.y < 0 ||
                nearIndex.y >= this.blockNum) {
                continue;
            }

            let blockNode = this.picNodeArr[nearIndex.y][nearIndex.x];
            if (!blockNode || blockNode.active) continue;

            nearBlockNode = blockNode;
        }

        // 如果存在合法位置，当前位置与空位交互
        if (nearBlockNode) {
            let nearBlockNodeScript = nearBlockNode.getComponent('Block') as Block;
            this.swapPicByPos(nowIndex, nearBlockNodeScript.nowIndex);
            this.completeCheck();
        }

        this.audioManager.playSound();
    }

    // 完成检测
    completeCheck() {
        let cnt = 0;
        for (let i = 0; i < this.blockNum; i++) {
            for (let j = 0; j < this.blockNum; j++) {
                const blockNode = this.picNodeArr[i][j];
                const blockNodeScript = blockNode.getComponent('Block') as Block;

                if (blockNodeScript.nowIndex.equals(blockNodeScript.stIndex)) {
                    cnt++;
                }
            }
        }

        // 拼图是否全部归位
        if (cnt == this.blockNum * this.blockNum) {
            this.hideBlockNode.active = true;
            console.log('游戏结束');
        }
    }
}
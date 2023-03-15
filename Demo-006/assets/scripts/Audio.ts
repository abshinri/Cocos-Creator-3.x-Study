/**
 * 本脚本用于点击砖块时播放音效
 */
import { _decorator, Component, Node, AudioClip, AudioSource } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Audio")
export class Audio extends Component {
  @property({ type: AudioClip })
  private clickAudio: AudioClip = null;
  
  private audioSource: AudioSource = null;

  public playAudio() {
    // 播放音效
    this.audioSource.playOneShot(this.clickAudio, 1);
  }

  onLoad() {
    // 获取AudioSource组件
    this.audioSource = this.getComponent(AudioSource);
  }

  start() {}

  update(deltaTime: number) {}
}

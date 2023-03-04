import { _decorator, Component, Node, AudioClip, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManger')
export class AudioManger extends Component {
    @property({ type: AudioClip })
    public clickClip: AudioClip = null;

    private audioSource: AudioSource;

    onLoad() {
        this.audioSource = this.getComponent(AudioSource);
    }

    // 播放点击音效
    playSound() {
        this.audioSource.playOneShot(this.clickClip, 1);
    }
}
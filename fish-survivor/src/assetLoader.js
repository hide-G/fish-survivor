// アセットローダークラス
export class AssetLoader {
    constructor(progressCallback) {
        this.progressCallback = progressCallback;
        this.images = {};
        this.sounds = {};
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }
    
    // アセット読み込み
    async loadAssets() {
        // 画像アセット定義
        const imageAssets = {
            // プレイヤー
            'player': 'assets/player.png',
            
            // 敵
            'fish': 'assets/fish.png',
            'crab': 'assets/crab.png',
            'octopus': 'assets/octopus.png',
            'jellyfish': 'assets/jellyfish.png',
            'shark': 'assets/shark.png',
            
            // 武器
            'bubble': 'assets/bubble.png',
            'bubbleTrap': 'assets/bubble_trap.png',
            'waterWave': 'assets/water_wave.png',
            'fishingNet': 'assets/fishing_net.png',
            
            // アイテム
            'exp': 'assets/exp.png',
            'health': 'assets/health.png',
            
            // UI
            'background': 'assets/background.png'
        };
        
        // 音声アセット定義
        const soundAssets = {
            'bubble': 'assets/sounds/bubble.mp3',
            'damage': 'assets/sounds/damage.mp3',
            'levelUp': 'assets/sounds/level_up.mp3',
            'pickup': 'assets/sounds/pickup.mp3',
            'gameOver': 'assets/sounds/game_over.mp3'
        };
        
        this.totalAssets = Object.keys(imageAssets).length + Object.keys(soundAssets).length;
        
        // 画像読み込み
        const imagePromises = Object.entries(imageAssets).map(([key, src]) => {
            return new Promise((resolve, reject) => {
                // 画像が存在しない場合はダミー画像を作成
                if (!this.assetExists(src)) {
                    this.images[key] = this.createDummyImage(key);
                    this.updateProgress();
                    resolve();
                    return;
                }
                
                const img = new Image();
                img.onload = () => {
                    this.images[key] = img;
                    this.updateProgress();
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Failed to load image: ${src}, using dummy image instead`);
                    this.images[key] = this.createDummyImage(key);
                    this.updateProgress();
                    resolve();
                };
                img.src = src;
            });
        });
        
        // 音声読み込み
        const soundPromises = Object.entries(soundAssets).map(([key, src]) => {
            return new Promise((resolve, reject) => {
                // 音声が存在しない場合はダミー音声を作成
                if (!this.assetExists(src)) {
                    this.sounds[key] = null;
                    this.updateProgress();
                    resolve();
                    return;
                }
                
                const audio = new Audio();
                audio.oncanplaythrough = () => {
                    this.sounds[key] = audio;
                    this.updateProgress();
                    resolve();
                };
                audio.onerror = () => {
                    console.warn(`Failed to load sound: ${src}`);
                    this.sounds[key] = null;
                    this.updateProgress();
                    resolve();
                };
                audio.src = src;
            });
        });
        
        // すべてのアセットが読み込まれるまで待機
        await Promise.all([...imagePromises, ...soundPromises]);
    }
    
    // アセットの存在確認（実際のプロジェクトでは必要に応じて実装）
    assetExists(src) {
        // 開発環境では常にfalseを返し、ダミーアセットを使用
        return false;
    }
    
    // ダミー画像作成
    createDummyImage(key) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let width, height, color;
        
        // アセットタイプに応じたサイズと色
        switch (key) {
            case 'player':
                width = 64;
                height = 64;
                color = '#4a90e2';
                break;
            case 'fish':
                width = 48;
                height = 48;
                color = '#ff6b6b';
                break;
            case 'crab':
                width = 56;
                height = 56;
                color = '#ff9e64';
                break;
            case 'octopus':
                width = 64;
                height = 64;
                color = '#9775fa';
                break;
            case 'jellyfish':
                width = 52;
                height = 52;
                color = '#5fb3ff';
                break;
            case 'shark':
                width = 80;
                height = 80;
                color = '#495057';
                break;
            case 'bubble':
            case 'bubbleTrap':
                width = 32;
                height = 32;
                color = 'rgba(100, 200, 255, 0.7)';
                break;
            case 'waterWave':
                width = 128;
                height = 128;
                color = 'rgba(100, 200, 255, 0.5)';
                break;
            case 'fishingNet':
                width = 64;
                height = 64;
                color = 'rgba(200, 200, 200, 0.7)';
                break;
            case 'exp':
                width = 24;
                height = 24;
                color = '#4caf50';
                break;
            case 'health':
                width = 24;
                height = 24;
                color = '#f44336';
                break;
            case 'background':
                width = 256;
                height = 256;
                color = '#0a1a2a';
                break;
            default:
                width = 32;
                height = 32;
                color = '#ffffff';
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 背景色
        ctx.fillStyle = color;
        
        // アセットタイプに応じた形状
        switch (key) {
            case 'player':
                // プレイヤー（三角形）
                ctx.beginPath();
                ctx.moveTo(width / 2, 0);
                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.closePath();
                ctx.fill();
                break;
            case 'fish':
                // 魚（楕円と三角形）
                ctx.beginPath();
                ctx.ellipse(width / 2, height / 2, width / 3, height / 4, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // 尾びれ
                ctx.beginPath();
                ctx.moveTo(width / 6, height / 2);
                ctx.lineTo(0, height / 4);
                ctx.lineTo(0, height * 3 / 4);
                ctx.closePath();
                ctx.fill();
                break;
            case 'crab':
                // カニ（円と足）
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, width / 3, 0, Math.PI * 2);
                ctx.fill();
                
                // 足
                for (let i = 0; i < 6; i++) {
                    const angle = Math.PI * i / 3;
                    ctx.beginPath();
                    ctx.moveTo(width / 2, height / 2);
                    ctx.lineTo(
                        width / 2 + Math.cos(angle) * width / 2,
                        height / 2 + Math.sin(angle) * height / 2
                    );
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = color;
                    ctx.stroke();
                }
                break;
            case 'octopus':
                // タコ（円と触手）
                ctx.beginPath();
                ctx.arc(width / 2, height / 3, width / 4, 0, Math.PI * 2);
                ctx.fill();
                
                // 触手
                for (let i = 0; i < 8; i++) {
                    const angle = Math.PI * i / 4 + Math.PI / 8;
                    ctx.beginPath();
                    ctx.moveTo(width / 2, height / 3);
                    
                    // 波線の触手
                    const length = height * 2 / 3;
                    const segments = 3;
                    let prevX = width / 2;
                    let prevY = height / 3;
                    
                    for (let j = 1; j <= segments; j++) {
                        const segmentLength = length / segments;
                        const offsetX = Math.sin(j * Math.PI) * 5;
                        const x = width / 2 + Math.cos(angle) * segmentLength * j + offsetX;
                        const y = height / 3 + Math.sin(angle) * segmentLength * j;
                        
                        ctx.quadraticCurveTo(
                            prevX + (x - prevX) / 2 + Math.cos(angle + Math.PI / 2) * 5,
                            prevY + (y - prevY) / 2 + Math.sin(angle + Math.PI / 2) * 5,
                            x, y
                        );
                        
                        prevX = x;
                        prevY = y;
                    }
                    
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = color;
                    ctx.stroke();
                }
                break;
            case 'jellyfish':
                // クラゲ（半円とひも）
                ctx.beginPath();
                ctx.arc(width / 2, height / 3, width / 3, 0, Math.PI, true);
                ctx.lineTo(width / 6, height * 2 / 3);
                ctx.lineTo(width / 3, height / 3);
                ctx.lineTo(width / 2, height);
                ctx.lineTo(width * 2 / 3, height / 3);
                ctx.lineTo(width * 5 / 6, height * 2 / 3);
                ctx.lineTo(width * 5 / 6, height / 3);
                ctx.closePath();
                ctx.fill();
                break;
            case 'shark':
                // サメ（三角形の頭と胴体）
                ctx.beginPath();
                ctx.moveTo(width * 3 / 4, height / 2);
                ctx.lineTo(width, height / 3);
                ctx.lineTo(width, height * 2 / 3);
                ctx.closePath();
                ctx.fill();
                
                // 胴体
                ctx.beginPath();
                ctx.ellipse(width / 2, height / 2, width / 3, height / 4, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // 背びれ
                ctx.beginPath();
                ctx.moveTo(width / 2, height / 2);
                ctx.lineTo(width / 2, height / 6);
                ctx.lineTo(width * 2 / 3, height / 2);
                ctx.closePath();
                ctx.fill();
                break;
            case 'bubble':
                // 泡（円）
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // ハイライト
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(width / 3, height / 3, width / 6, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'bubbleTrap':
                // 泡の罠（大きな円）
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // 内側の円
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, width / 3, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'waterWave':
                // 水の波動（同心円）
                for (let i = 3; i > 0; i--) {
                    const radius = width / 2 * (i / 3);
                    ctx.beginPath();
                    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = `rgba(100, 200, 255, ${i / 3})`;
                    ctx.stroke();
                }
                break;
            case 'fishingNet':
                // 漁網（格子模様）
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                
                // 横線
                for (let y = 0; y <= height; y += height / 5) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
                
                // 縦線
                for (let x = 0; x <= width; x += width / 5) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
                break;
            case 'exp':
                // 経験値（星）
                this.drawStar(ctx, width / 2, height / 2, 5, width / 2, width / 4);
                break;
            case 'health':
                // 体力（ハート）
                this.drawHeart(ctx, width / 2, height / 2, width / 2);
                break;
            case 'background':
                // 背景（グラデーション）
                const gradient = ctx.createLinearGradient(0, 0, width, height);
                gradient.addColorStop(0, '#0a1a2a');
                gradient.addColorStop(1, '#1a2a3a');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                
                // グリッド
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                
                for (let x = 0; x < width; x += width / 8) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
                
                for (let y = 0; y < height; y += height / 8) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
                break;
            default:
                // デフォルト（四角形）
                ctx.fillRect(0, 0, width, height);
        }
        
        return canvas;
    }
    
    // 星を描画
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
    
    // ハートを描画
    drawHeart(ctx, cx, cy, size) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + size / 4);
        
        // 左側の曲線
        ctx.bezierCurveTo(
            cx, cy, 
            cx - size / 2, cy, 
            cx - size / 2, cy - size / 4
        );
        
        ctx.bezierCurveTo(
            cx - size / 2, cy - size / 2, 
            cx, cy - size / 2, 
            cx, cy - size / 4
        );
        
        // 右側の曲線
        ctx.bezierCurveTo(
            cx, cy - size / 2, 
            cx + size / 2, cy - size / 2, 
            cx + size / 2, cy - size / 4
        );
        
        ctx.bezierCurveTo(
            cx + size / 2, cy, 
            cx, cy, 
            cx, cy + size / 4
        );
        
        ctx.fill();
    }
    
    // 進捗更新
    updateProgress() {
        this.loadedAssets++;
        const progress = this.loadedAssets / this.totalAssets;
        
        if (this.progressCallback) {
            this.progressCallback(progress);
        }
    }
    
    // 画像取得
    getImage(key) {
        return this.images[key];
    }
    
    // 音声取得
    getSound(key) {
        return this.sounds[key];
    }
    
    // 音声再生
    playSound(key, volume = 1.0) {
        const sound = this.sounds[key];
        if (sound) {
            const clone = sound.cloneNode();
            clone.volume = volume;
            clone.play();
        }
    }
}
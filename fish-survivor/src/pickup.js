// アイテムクラス
export class Pickup {
    constructor(x, y, type, sprite) {
        this.x = x;
        this.y = y;
        this.type = type; // 'exp', 'health' など
        this.sprite = sprite;
        this.width = 24;
        this.height = 24;
        this.pulseTimer = 0;
        this.pulseSpeed = 2; // パルスアニメーション速度
        this.attractionSpeed = 0; // プレイヤーへの引き寄せ速度
    }
    
    // 更新処理
    update(deltaTime, gameState) {
        // パルスアニメーション更新
        this.pulseTimer += deltaTime * this.pulseSpeed;
        
        // プレイヤーとの距離計算
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 収集範囲を計算（基本範囲 + アップグレードによる増加）
        const pickupRange = 100 * (1 + (gameState.playerUpgrades.pickup || 0) * 0.15);
        
        // 引き寄せ効果
        if (distance < pickupRange) {
            // 距離に応じて引き寄せ速度を調整
            this.attractionSpeed = Math.max(100, 500 * (1 - distance / pickupRange));
            
            // プレイヤーに向かって移動
            if (distance > 0) {
                const speedFactor = this.attractionSpeed * deltaTime / distance;
                this.x += dx * speedFactor;
                this.y += dy * speedFactor;
            }
        }
    }
    
    // 描画処理
    draw(ctx) {
        // パルス効果の計算
        const pulse = Math.sin(this.pulseTimer) * 0.2 + 1;
        const size = this.width * pulse;
        
        // アイテムスプライト描画
        if (this.sprite) {
            ctx.drawImage(
                this.sprite,
                this.x - size / 2,
                this.y - size / 2,
                size,
                size
            );
        } else {
            // スプライトがない場合は円を描画
            switch (this.type) {
                case 'exp':
                    ctx.fillStyle = '#4caf50';
                    break;
                case 'health':
                    ctx.fillStyle = '#f44336';
                    break;
                default:
                    ctx.fillStyle = '#ffffff';
            }
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // 輪郭
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
}
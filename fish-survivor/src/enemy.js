// 敵クラス
export class Enemy {
    constructor(x, y, type, sprite, level) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.sprite = sprite;
        this.level = level;
        
        // 敵タイプに応じたパラメータ設定
        switch (type) {
            case 'fish':
                this.width = 48;
                this.height = 48;
                this.speed = 60 + level * 1.5;  // 速度を下げる (80→60)
                this.health = 20 + level * 3;    // 体力を下げる (30→20, 5→3)
                this.maxHealth = this.health;
                this.damage = 3 + level * 0.7;   // ダメージを下げる (5→3)
                break;
            case 'crab':
                this.width = 56;
                this.height = 56;
                this.speed = 45 + level * 1.2;   // 速度を下げる (60→45)
                this.health = 35 + level * 5;    // 体力を下げる (50→35, 8→5)
                this.maxHealth = this.health;
                this.damage = 5 + level;         // ダメージを下げる (8→5)
                break;
            case 'octopus':
                this.width = 64;
                this.height = 64;
                this.speed = 40 + level * 0.8;   // 速度を下げる (50→40)
                this.health = 50 + level * 7;    // 体力を下げる (70→50, 10→7)
                this.maxHealth = this.health;
                this.damage = 7 + level * 1.5;   // ダメージを下げる (10→7)
                break;
            case 'jellyfish':
                this.width = 52;
                this.height = 52;
                this.speed = 55 + level * 2;     // 速度を下げる (70→55)
                this.health = 30 + level * 4;    // 体力を下げる (40→30, 6→4)
                this.maxHealth = this.health;
                this.damage = 8 + level * 1.3;   // ダメージを下げる (12→8)
                break;
            case 'shark':
                this.width = 80;
                this.height = 80;
                this.speed = 70 + level * 2;     // 速度を下げる (90→70)
                this.health = 70 + level * 10;   // 体力を下げる (100→70, 15→10)
                this.maxHealth = this.health;
                this.damage = 10 + level * 1.8;  // ダメージを下げる (15→10)
                break;
            default:
                this.width = 48;
                this.height = 48;
                this.speed = 60 + level * 1.5;   // 速度を下げる (80→60)
                this.health = 20 + level * 3;    // 体力を下げる (30→20, 5→3)
                this.maxHealth = this.health;
                this.damage = 3 + level * 0.7;   // ダメージを下げる (5→3)
        }
        
        this.facingDirection = 1; // 1: 右向き, -1: 左向き
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 0.15; // アニメーション速度（秒）
        this.stunned = false;
        this.stunnedTimer = 0;
        this.slowed = false;
        this.slowedTimer = 0;
        this.slowFactor = 1.0;
    }
    
    // 更新処理
    update(deltaTime, gameState) {
        // スタン中は動かない
        if (this.stunned) {
            this.stunnedTimer -= deltaTime;
            if (this.stunnedTimer <= 0) {
                this.stunned = false;
            }
            return;
        }
        
        // スロー効果の更新
        if (this.slowed) {
            this.slowedTimer -= deltaTime;
            if (this.slowedTimer <= 0) {
                this.slowed = false;
                this.slowFactor = 1.0;
            }
        }
        
        // プレイヤーへの方向計算
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 向きの更新
        if (dx > 0) {
            this.facingDirection = 1;
        } else {
            this.facingDirection = -1;
        }
        
        // プレイヤーに向かって移動
        if (distance > 0) {
            const speedFactor = this.speed * this.slowFactor * deltaTime / distance;
            this.x += dx * speedFactor;
            this.y += dy * speedFactor;
        }
        
        // アニメーション更新
        this.animationTimer += deltaTime;
        if (this.animationTimer >= this.animationSpeed) {
            this.animationFrame = (this.animationFrame + 1) % 4; // 4フレームアニメーション
            this.animationTimer = 0;
        }
    }
    
    // ダメージ処理
    takeDamage(amount) {
        this.health -= amount;
        
        // ダメージテキスト表示
        this.showDamageText(amount);
    }
    
    // スタン効果適用
    applyStun(duration) {
        this.stunned = true;
        this.stunnedTimer = duration;
    }
    
    // スロー効果適用
    applySlow(duration, factor) {
        this.slowed = true;
        this.slowedTimer = duration;
        this.slowFactor = factor;
    }
    
    // ダメージテキスト表示
    showDamageText(amount) {
        const damageText = document.createElement('div');
        damageText.textContent = amount;
        damageText.style.position = 'absolute';
        damageText.style.left = `${this.x}px`;
        damageText.style.top = `${this.y - 20}px`;
        damageText.style.color = 'white';
        damageText.style.textShadow = '0 0 3px red';
        damageText.style.fontWeight = 'bold';
        damageText.style.fontSize = '16px';
        damageText.style.pointerEvents = 'none';
        damageText.style.zIndex = '5';
        document.body.appendChild(damageText);
        
        // アニメーション
        let opacity = 1;
        let posY = this.y - 20;
        
        const animate = () => {
            opacity -= 0.02;
            posY -= 1;
            damageText.style.opacity = opacity;
            damageText.style.top = `${posY}px`;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                document.body.removeChild(damageText);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // 描画処理
    draw(ctx) {
        // 敵スプライト描画
        if (this.sprite) {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // 向きに応じて反転
            if (this.facingDirection < 0) {
                ctx.scale(-1, 1);
            }
            
            // スタン中は色を変える
            if (this.stunned) {
                ctx.filter = 'brightness(0.7) sepia(1) hue-rotate(180deg)';
            } else if (this.slowed) {
                ctx.filter = 'brightness(0.8) sepia(0.5) hue-rotate(240deg)';
            }
            
            // スプライトシートからフレーム切り出し
            const frameX = this.animationFrame * this.width;
            ctx.drawImage(
                this.sprite,
                frameX, 0, this.width, this.height,
                -this.width / 2, -this.height / 2, this.width, this.height
            );
            
            ctx.restore();
        } else {
            // スプライトがない場合は円を描画
            ctx.fillStyle = this.stunned ? '#888888' : 
                           (this.type === 'fish' ? '#ff6b6b' : 
                            this.type === 'crab' ? '#ff9e64' : 
                            this.type === 'octopus' ? '#9775fa' : 
                            this.type === 'jellyfish' ? '#5fb3ff' : 
                            this.type === 'shark' ? '#495057' : '#ff6b6b');
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 体力バー描画
        this.drawHealthBar(ctx);
    }
    
    // 体力バー描画
    drawHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 6;
        const x = this.x - barWidth / 2;
        const y = this.y - this.height / 2 - 10;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // 体力
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#4caf50' : healthPercent > 0.25 ? '#ff9800' : '#f44336';
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        
        // 枠線
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }
}
// プレイヤークラス
export class Player {
    constructor(x, y, sprite) {
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 64;
        this.sprite = sprite;
        this.speed = 220; // 移動速度を上げる (200→220)
        this.health = 120; // 初期体力を増やす (100→120)
        this.maxHealth = 120; // 最大体力も増やす (100→120)
        this.moveDirection = { x: 0, y: 0 };
        this.facingDirection = 1; // 1: 右向き, -1: 左向き
        this.isMoving = false;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 0.1; // アニメーション速度（秒）
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.invulnerableDuration = 0.8; // 無敵時間を延長 (0.5→0.8秒)
    }
    
    // キー押下処理
    handleKeyDown(key) {
        switch (key) {
            case 'ArrowUp':
            case 'w':
                this.moveDirection.y = -1;
                break;
            case 'ArrowDown':
            case 's':
                this.moveDirection.y = 1;
                break;
            case 'ArrowLeft':
            case 'a':
                this.moveDirection.x = -1;
                this.facingDirection = -1;
                break;
            case 'ArrowRight':
            case 'd':
                this.moveDirection.x = 1;
                this.facingDirection = 1;
                break;
        }
        
        // 移動方向を正規化
        this.normalizeDirection();
    }
    
    // キー解放処理
    handleKeyUp(key) {
        switch (key) {
            case 'ArrowUp':
            case 'w':
                if (this.moveDirection.y < 0) this.moveDirection.y = 0;
                break;
            case 'ArrowDown':
            case 's':
                if (this.moveDirection.y > 0) this.moveDirection.y = 0;
                break;
            case 'ArrowLeft':
            case 'a':
                if (this.moveDirection.x < 0) this.moveDirection.x = 0;
                break;
            case 'ArrowRight':
            case 'd':
                if (this.moveDirection.x > 0) this.moveDirection.x = 0;
                break;
        }
        
        // 移動方向を正規化
        this.normalizeDirection();
    }
    
    // 移動方向の正規化
    normalizeDirection() {
        const length = Math.sqrt(
            this.moveDirection.x * this.moveDirection.x + 
            this.moveDirection.y * this.moveDirection.y
        );
        
        if (length > 0) {
            this.moveDirection.x /= length;
            this.moveDirection.y /= length;
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
    }
    
    // 更新処理
    update(deltaTime, gameState) {
        // 移動処理
        this.x += this.moveDirection.x * this.speed * deltaTime;
        this.y += this.moveDirection.y * this.speed * deltaTime;
        
        // 画面外に出ないように制限
        this.x = Math.max(this.width / 2, Math.min(gameState.canvas.width - this.width / 2, this.x));
        this.y = Math.max(this.height / 2, Math.min(gameState.canvas.height - this.height / 2, this.y));
        
        // アニメーション更新
        if (this.isMoving) {
            this.animationTimer += deltaTime;
            if (this.animationTimer >= this.animationSpeed) {
                this.animationFrame = (this.animationFrame + 1) % 4; // 4フレームアニメーション
                this.animationTimer = 0;
            }
        } else {
            this.animationFrame = 0;
        }
        
        // 無敵時間更新
        if (this.invulnerable) {
            this.invulnerableTimer += deltaTime;
            if (this.invulnerableTimer >= this.invulnerableDuration) {
                this.invulnerable = false;
                this.invulnerableTimer = 0;
            }
        }
        
        // 敵との当たり判定
        if (!this.invulnerable) {
            for (const enemy of gameState.enemies) {
                const dx = this.x - enemy.x;
                const dy = this.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < (this.width / 3 + enemy.width / 3)) {
                    this.takeDamage(enemy.damage);
                    break;
                }
            }
        }
    }
    
    // ダメージ処理
    takeDamage(amount) {
        if (!this.invulnerable) {
            this.health -= amount;
            this.invulnerable = true;
            
            // 画面を一瞬赤く点滅させる
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            overlay.style.pointerEvents = 'none';
            overlay.style.zIndex = '10';
            document.body.appendChild(overlay);
            
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 100);
        }
    }
    
    // 描画処理
    draw(ctx) {
        // 無敵時間中は点滅表示
        if (this.invulnerable && Math.floor(this.invulnerableTimer * 10) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // プレイヤースプライト描画
        if (this.sprite) {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // 向きに応じて反転
            if (this.facingDirection < 0) {
                ctx.scale(-1, 1);
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
            ctx.fillStyle = '#4a90e2';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1.0;
        
        // 体力バー描画
        this.drawHealthBar(ctx);
    }
    
    // 体力バー描画
    drawHealthBar(ctx) {
        const barWidth = 60;
        const barHeight = 8;
        const x = this.x - barWidth / 2;
        const y = this.y - this.height / 2 - 15;
        
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
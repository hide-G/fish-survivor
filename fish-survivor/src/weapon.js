// 武器クラス
export class Weapon {
    constructor(type, player, assetLoader) {
        this.type = type;
        this.player = player;
        this.assetLoader = assetLoader;
        this.projectiles = [];
        this.cooldownTimer = 0;
        
        // 武器タイプに応じたパラメータ設定
        switch (type) {
            case 'bubble':
                this.damage = 20; // ダメージを増加 (15→20)
                this.cooldown = 0.4; // 発射間隔を短縮 (0.5→0.4秒)
                this.projectileSpeed = 350; // 弾速を上げる (300→350)
                this.projectileLifetime = 2.0; // 弾の寿命（秒）
                this.projectileSize = 20;
                this.projectileSprite = assetLoader.getImage('bubble');
                break;
            case 'bubbleTrap':
                this.damage = 5;
                this.cooldown = 3.0;
                this.trapDuration = 5.0; // 罠の持続時間（秒）
                this.trapRadius = 80;
                this.trapSprite = assetLoader.getImage('bubbleTrap');
                break;
            case 'waterWave':
                this.damage = 20;
                this.cooldown = 5.0;
                this.waveRadius = 150;
                this.waveDuration = 0.5;
                this.waveSprite = assetLoader.getImage('waterWave');
                break;
            case 'fishingNet':
                this.damage = 10;
                this.cooldown = 4.0;
                this.netRadius = 100;
                this.netDuration = 3.0;
                this.slowFactor = 0.5; // 50%の速度低下
                this.netSprite = assetLoader.getImage('fishingNet');
                break;
            default:
                this.damage = 15;
                this.cooldown = 0.5;
                this.projectileSpeed = 300;
                this.projectileLifetime = 2.0;
                this.projectileSize = 20;
                this.projectileSprite = assetLoader.getImage('bubble');
        }
    }
    
    // 更新処理
    update(deltaTime, gameState) {
        // クールダウン更新
        this.cooldownTimer -= deltaTime;
        
        // 武器タイプに応じた処理
        switch (this.type) {
            case 'bubble':
                this.updateBubble(deltaTime, gameState);
                break;
            case 'bubbleTrap':
                this.updateBubbleTrap(deltaTime, gameState);
                break;
            case 'waterWave':
                this.updateWaterWave(deltaTime, gameState);
                break;
            case 'fishingNet':
                this.updateFishingNet(deltaTime, gameState);
                break;
        }
        
        // プロジェクタイル更新
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.lifetime -= deltaTime;
            
            // 寿命切れ
            if (projectile.lifetime <= 0) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            // 移動処理（バブルのみ）
            if (this.type === 'bubble') {
                projectile.x += projectile.vx * deltaTime;
                projectile.y += projectile.vy * deltaTime;
                
                // 敵との当たり判定
                for (let j = 0; j < gameState.enemies.length; j++) {
                    const enemy = gameState.enemies[j];
                    const dx = projectile.x - enemy.x;
                    const dy = projectile.y - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < (projectile.size / 2 + enemy.width / 3)) {
                        enemy.takeDamage(this.damage);
                        this.projectiles.splice(i, 1);
                        break;
                    }
                }
            }
            
            // 罠の当たり判定（バブルトラップ）
            if (this.type === 'bubbleTrap' && !projectile.triggered) {
                for (let j = 0; j < gameState.enemies.length; j++) {
                    const enemy = gameState.enemies[j];
                    const dx = projectile.x - enemy.x;
                    const dy = projectile.y - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.trapRadius) {
                        projectile.triggered = true;
                        enemy.applyStun(2.0); // 2秒間スタン
                        break;
                    }
                }
            }
        }
    }
    
    // バブル武器の更新
    updateBubble(deltaTime, gameState) {
        if (this.cooldownTimer <= 0) {
            // 最も近い敵を探す
            let closestEnemy = null;
            let closestDistance = Infinity;
            
            for (const enemy of gameState.enemies) {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEnemy = enemy;
                }
            }
            
            // 敵がいれば弾を発射
            if (closestEnemy) {
                const dx = closestEnemy.x - this.player.x;
                const dy = closestEnemy.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 方向ベクトルを正規化
                const vx = dx / distance * this.projectileSpeed;
                const vy = dy / distance * this.projectileSpeed;
                
                // プロジェクタイル作成
                this.projectiles.push({
                    x: this.player.x,
                    y: this.player.y,
                    vx: vx,
                    vy: vy,
                    size: this.projectileSize,
                    lifetime: this.projectileLifetime,
                    sprite: this.projectileSprite
                });
                
                // クールダウンリセット
                this.cooldownTimer = this.cooldown;
            }
        }
    }
    
    // バブルトラップの更新
    updateBubbleTrap(deltaTime, gameState) {
        if (this.cooldownTimer <= 0) {
            // プレイヤーの周囲にランダムに配置
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 50;
            const x = this.player.x + Math.cos(angle) * distance;
            const y = this.player.y + Math.sin(angle) * distance;
            
            // トラップ作成
            this.projectiles.push({
                x: x,
                y: y,
                size: this.trapRadius * 2,
                lifetime: this.trapDuration,
                triggered: false,
                sprite: this.trapSprite
            });
            
            // クールダウンリセット
            this.cooldownTimer = this.cooldown;
        }
    }
    
    // 水の波動の更新
    updateWaterWave(deltaTime, gameState) {
        if (this.cooldownTimer <= 0) {
            // 波動作成
            this.projectiles.push({
                x: this.player.x,
                y: this.player.y,
                size: 0, // アニメーション用に大きさを変化させる
                maxSize: this.waveRadius * 2,
                lifetime: this.waveDuration,
                sprite: this.waveSprite
            });
            
            // 範囲内の敵にダメージ
            for (const enemy of gameState.enemies) {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.waveRadius) {
                    enemy.takeDamage(this.damage);
                    
                    // ノックバック効果
                    const knockbackDistance = 50;
                    const knockbackX = dx / distance * knockbackDistance;
                    const knockbackY = dy / distance * knockbackDistance;
                    enemy.x += knockbackX;
                    enemy.y += knockbackY;
                }
            }
            
            // クールダウンリセット
            this.cooldownTimer = this.cooldown;
        }
    }
    
    // 漁網の更新
    updateFishingNet(deltaTime, gameState) {
        if (this.cooldownTimer <= 0) {
            // 最も敵が密集している場所を探す
            let bestPosition = { x: 0, y: 0 };
            let maxEnemiesCount = 0;
            
            // プレイヤーの周囲をグリッド状に探索
            const searchRadius = 200;
            const gridSize = 50;
            
            for (let x = this.player.x - searchRadius; x <= this.player.x + searchRadius; x += gridSize) {
                for (let y = this.player.y - searchRadius; y <= this.player.y + searchRadius; y += gridSize) {
                    let enemiesCount = 0;
                    
                    for (const enemy of gameState.enemies) {
                        const dx = enemy.x - x;
                        const dy = enemy.y - y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < this.netRadius) {
                            enemiesCount++;
                        }
                    }
                    
                    if (enemiesCount > maxEnemiesCount) {
                        maxEnemiesCount = enemiesCount;
                        bestPosition = { x, y };
                    }
                }
            }
            
            // 敵がいれば漁網を投げる
            if (maxEnemiesCount > 0) {
                // 漁網作成
                this.projectiles.push({
                    x: bestPosition.x,
                    y: bestPosition.y,
                    size: this.netRadius * 2,
                    lifetime: this.netDuration,
                    sprite: this.netSprite
                });
                
                // 範囲内の敵にスロー効果
                for (const enemy of gameState.enemies) {
                    const dx = enemy.x - bestPosition.x;
                    const dy = enemy.y - bestPosition.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.netRadius) {
                        enemy.takeDamage(this.damage);
                        enemy.applySlow(this.netDuration, this.slowFactor);
                    }
                }
                
                // クールダウンリセット
                this.cooldownTimer = this.cooldown;
            }
        }
    }
    
    // 描画処理
    draw(ctx) {
        for (const projectile of this.projectiles) {
            // プロジェクタイルの描画
            if (projectile.sprite) {
                // 水の波動のアニメーション
                if (this.type === 'waterWave') {
                    const progress = 1 - projectile.lifetime / this.waveDuration;
                    const currentSize = projectile.maxSize * progress;
                    const alpha = 1 - progress;
                    
                    ctx.globalAlpha = alpha;
                    ctx.drawImage(
                        projectile.sprite,
                        projectile.x - currentSize / 2,
                        projectile.y - currentSize / 2,
                        currentSize,
                        currentSize
                    );
                    ctx.globalAlpha = 1.0;
                } else {
                    ctx.drawImage(
                        projectile.sprite,
                        projectile.x - projectile.size / 2,
                        projectile.y - projectile.size / 2,
                        projectile.size,
                        projectile.size
                    );
                }
            } else {
                // スプライトがない場合は円を描画
                switch (this.type) {
                    case 'bubble':
                        ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
                        ctx.beginPath();
                        ctx.arc(projectile.x, projectile.y, projectile.size / 2, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                    case 'bubbleTrap':
                        ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
                        ctx.beginPath();
                        ctx.arc(projectile.x, projectile.y, this.trapRadius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(100, 200, 255, 0.7)';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        break;
                    case 'waterWave':
                        const progress = 1 - projectile.lifetime / this.waveDuration;
                        const currentRadius = this.waveRadius * progress;
                        const alpha = 1 - progress;
                        
                        ctx.fillStyle = `rgba(100, 200, 255, ${alpha * 0.3})`;
                        ctx.beginPath();
                        ctx.arc(projectile.x, projectile.y, currentRadius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = `rgba(100, 200, 255, ${alpha * 0.7})`;
                        ctx.lineWidth = 3;
                        ctx.stroke();
                        break;
                    case 'fishingNet':
                        ctx.fillStyle = 'rgba(200, 200, 200, 0.2)';
                        ctx.beginPath();
                        ctx.arc(projectile.x, projectile.y, this.netRadius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(200, 200, 200, 0.7)';
                        ctx.lineWidth = 2;
                        ctx.setLineDash([5, 5]);
                        ctx.stroke();
                        ctx.setLineDash([]);
                        break;
                }
            }
        }
    }
}
// フィッシュサバイバー - ヴァンパイアサバイバー風ゲーム
// メインゲームロジック

import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Weapon } from './weapon.js';
import { Pickup } from './pickup.js';
import { UI } from './ui.js';
import { AssetLoader } from './assetLoader.js';

// ゲームの状態
const gameState = {
    player: null,
    enemies: [],
    weapons: [],
    pickups: [],
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    gameTime: 0,
    isGameOver: false,
    isPaused: false,
    enemiesDefeated: 0,
    canvas: null,
    ctx: null,
    lastTimestamp: 0,
    assetLoader: null,
    ui: null,
    enemySpawnRate: 0.8, // 秒ごとの敵スポーン数（1.5から0.8に減少）
    lastEnemySpawn: 0,
    difficultyTimer: 0,
    availableUpgrades: [
        { id: 'speed', name: '移動速度アップ', description: '移動速度が10%上昇', maxLevel: 5 },
        { id: 'damage', name: '攻撃力アップ', description: '武器のダメージが15%上昇', maxLevel: 5 },
        { id: 'health', name: '最大体力アップ', description: '最大体力が20%上昇', maxLevel: 5 },
        { id: 'attackSpeed', name: '攻撃速度アップ', description: '武器の攻撃速度が10%上昇', maxLevel: 5 },
        { id: 'pickup', name: '収集範囲アップ', description: 'アイテム収集範囲が15%上昇', maxLevel: 5 },
        { id: 'bubbleTrap', name: '泡の罠', description: '敵を一時的に捕らえる泡の罠を設置', maxLevel: 3 },
        { id: 'waterWave', name: '水の波動', description: '周囲の敵にダメージを与える波動を放つ', maxLevel: 3 },
        { id: 'fishingNet', name: '漁網', description: '敵を捕らえて動きを遅くする漁網を投げる', maxLevel: 3 }
    ],
    playerUpgrades: {}
};

// ゲーム初期化
async function initGame() {
    // ローディング画面表示
    const loadingElement = document.getElementById('loading');
    const progressBar = document.getElementById('loading-progress');

    // キャンバス設定
    gameState.canvas = document.createElement('canvas');
    document.body.appendChild(gameState.canvas);
    gameState.ctx = gameState.canvas.getContext('2d');

    // キャンバスサイズ設定
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // アセットローダー初期化
    gameState.assetLoader = new AssetLoader(updateLoadingProgress);
    await gameState.assetLoader.loadAssets();

    // UI初期化
    gameState.ui = new UI(gameState);

    // プレイヤー初期化
    gameState.player = new Player(
        gameState.canvas.width / 2,
        gameState.canvas.height / 2,
        gameState.assetLoader.getImage('player')
    );

    // 初期武器設定
    gameState.weapons.push(new Weapon('bubble', gameState.player, gameState.assetLoader));

    // 各アップグレードの初期レベルを0に設定
    gameState.availableUpgrades.forEach(upgrade => {
        gameState.playerUpgrades[upgrade.id] = 0;
    });

    // イベントリスナー設定
    setupEventListeners();

    // ローディング画面を非表示
    loadingElement.style.display = 'none';

    // ゲームループ開始
    requestAnimationFrame(gameLoop);
}

// ローディング進捗更新
function updateLoadingProgress(progress) {
    const progressBar = document.getElementById('loading-progress');
    progressBar.style.width = `${progress * 100}%`;
}

// キャンバスリサイズ
function resizeCanvas() {
    gameState.canvas.width = window.innerWidth;
    gameState.canvas.height = window.innerHeight;
}

// イベントリスナー設定
function setupEventListeners() {
    // キーボード操作
    window.addEventListener('keydown', (e) => {
        if (gameState.player) {
            gameState.player.handleKeyDown(e.key);
        }
    });

    window.addEventListener('keyup', (e) => {
        if (gameState.player) {
            gameState.player.handleKeyUp(e.key);
        }
    });

    // タッチ操作
    let touchStartX = 0;
    let touchStartY = 0;

    gameState.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    gameState.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (gameState.player) {
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;

            const deltaX = touchX - touchStartX;
            const deltaY = touchY - touchStartY;

            // 移動方向を正規化
            const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (length > 20) { // デッドゾーン
                gameState.player.moveDirection.x = deltaX / length;
                gameState.player.moveDirection.y = deltaY / length;
            } else {
                gameState.player.moveDirection.x = 0;
                gameState.player.moveDirection.y = 0;
            }
        }
    });

    gameState.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (gameState.player) {
            gameState.player.moveDirection.x = 0;
            gameState.player.moveDirection.y = 0;
        }
    });

    // レベルアップ選択
    document.getElementById('upgrade-options').addEventListener('click', (e) => {
        if (e.target.classList.contains('upgrade-option')) {
            const upgradeId = e.target.dataset.id;
            applyUpgrade(upgradeId);
            document.getElementById('level-up').style.display = 'none';
            gameState.isPaused = false;
        }
    });

    // リスタートボタン
    document.getElementById('restart-button').addEventListener('click', () => {
        document.getElementById('game-over').style.display = 'none';
        resetGame();
    });
}

// ゲームループ
function gameLoop(timestamp) {
    // デルタタイム計算（前回のフレームからの経過時間）
    const deltaTime = gameState.lastTimestamp ? (timestamp - gameState.lastTimestamp) / 1000 : 0;
    gameState.lastTimestamp = timestamp;

    // ゲームが一時停止中または終了している場合は更新しない
    if (!gameState.isPaused && !gameState.isGameOver) {
        update(deltaTime);
    }

    render();

    // 次のフレームをリクエスト
    requestAnimationFrame(gameLoop);
}

// ゲーム状態更新
function update(deltaTime) {
    // ゲーム時間更新
    gameState.gameTime += deltaTime;
    gameState.difficultyTimer += deltaTime;

    // 難易度調整（より緩やかに）
    if (gameState.difficultyTimer >= 45) { // 30秒→45秒ごとに難易度上昇
        gameState.difficultyTimer = 0;
        gameState.enemySpawnRate *= 1.1; // 敵のスポーン率を20%→10%増加
    }

    // プレイヤー更新
    gameState.player.update(deltaTime, gameState);

    // 敵のスポーン
    gameState.lastEnemySpawn += deltaTime;
    if (gameState.lastEnemySpawn >= 1 / gameState.enemySpawnRate) {
        spawnEnemy();
        gameState.lastEnemySpawn = 0;
    }

    // 武器更新
    gameState.weapons.forEach(weapon => {
        weapon.update(deltaTime, gameState);
    });

    // 敵更新
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        enemy.update(deltaTime, gameState);

        // 敵の削除
        if (enemy.health <= 0) {
            // 経験値ドロップ（確率を上げる）
            if (Math.random() < 0.5) { // 30%→50%の確率で経験値をドロップ
                gameState.pickups.push(new Pickup(
                    enemy.x,
                    enemy.y,
                    'exp',
                    gameState.assetLoader.getImage('exp')
                ));
            }

            gameState.enemies.splice(i, 1);
            gameState.enemiesDefeated++;
        }
    }

    // アイテム更新
    for (let i = gameState.pickups.length - 1; i >= 0; i--) {
        const pickup = gameState.pickups[i];
        pickup.update(deltaTime, gameState);

        // プレイヤーとの当たり判定
        const dx = pickup.x - gameState.player.x;
        const dy = pickup.y - gameState.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 収集範囲を計算（基本範囲 + アップグレードによる増加）
        const pickupRange = 50 * (1 + gameState.playerUpgrades.pickup * 0.15);

        if (distance < pickupRange) {
            // アイテム効果適用
            if (pickup.type === 'exp') {
                gameState.experience += 15; // 経験値獲得量を増加 (10→15)
                checkLevelUp();
            } else if (pickup.type === 'health') {
                gameState.player.health = Math.min(
                    gameState.player.health + 25, // 回復量を増加 (20→25)
                    gameState.player.maxHealth
                );
            }

            gameState.pickups.splice(i, 1);
        }
    }

    // UI更新
    gameState.ui.update();

    // ゲームオーバーチェック
    if (gameState.player.health <= 0) {
        gameOver();
    }
}

// 敵のスポーン
function spawnEnemy() {
    // スポーン位置（画面外からスポーン）
    let x, y;
    const spawnSide = Math.floor(Math.random() * 4); // 0: 上, 1: 右, 2: 下, 3: 左

    switch (spawnSide) {
        case 0: // 上
            x = Math.random() * gameState.canvas.width;
            y = -50;
            break;
        case 1: // 右
            x = gameState.canvas.width + 50;
            y = Math.random() * gameState.canvas.height;
            break;
        case 2: // 下
            x = Math.random() * gameState.canvas.width;
            y = gameState.canvas.height + 50;
            break;
        case 3: // 左
            x = -50;
            y = Math.random() * gameState.canvas.height;
            break;
    }

    // 敵のタイプをランダムに選択（レベルに応じて出現確率を調整）
    let enemyTypes;
    let enemyWeights;
    
    if (gameState.level <= 3) {
        // レベル1-3: 弱い敵が多く出現
        enemyTypes = ['fish', 'crab', 'jellyfish', 'octopus', 'shark'];
        enemyWeights = [0.5, 0.3, 0.15, 0.04, 0.01]; // 魚50%、カニ30%、クラゲ15%、タコ4%、サメ1%
    } else if (gameState.level <= 6) {
        // レベル4-6: 中間レベル
        enemyTypes = ['fish', 'crab', 'jellyfish', 'octopus', 'shark'];
        enemyWeights = [0.35, 0.35, 0.2, 0.07, 0.03]; // 魚35%、カニ35%、クラゲ20%、タコ7%、サメ3%
    } else {
        // レベル7以上: 強い敵も増える
        enemyTypes = ['fish', 'crab', 'jellyfish', 'octopus', 'shark'];
        enemyWeights = [0.2, 0.25, 0.25, 0.2, 0.1]; // 魚20%、カニ25%、クラゲ25%、タコ20%、サメ10%
    }
    
    // 重み付き抽選
    const random = Math.random();
    let cumulativeWeight = 0;
    let enemyType = enemyTypes[0]; // デフォルト値
    
    for (let i = 0; i < enemyTypes.length; i++) {
        cumulativeWeight += enemyWeights[i];
        if (random < cumulativeWeight) {
            enemyType = enemyTypes[i];
            break;
        }
    }

    // 敵の作成
    const enemy = new Enemy(
        x,
        y,
        enemyType,
        gameState.assetLoader.getImage(enemyType),
        gameState.level
    );

    gameState.enemies.push(enemy);
}

// レベルアップチェック
function checkLevelUp() {
    if (gameState.experience >= gameState.experienceToNextLevel) {
        gameState.level++;
        gameState.experience -= gameState.experienceToNextLevel;
        gameState.experienceToNextLevel = Math.floor(gameState.experienceToNextLevel * 1.15); // 増加率を下げる (1.2→1.15)

        // レベルアップ画面表示
        showLevelUpScreen();
    }
}

// レベルアップ画面表示
function showLevelUpScreen() {
    gameState.isPaused = true;

    const upgradeOptions = document.getElementById('upgrade-options');
    upgradeOptions.innerHTML = '';

    // 利用可能なアップグレードをフィルタリング（最大レベルに達していないもの）
    const availableUpgrades = gameState.availableUpgrades.filter(upgrade =>
        gameState.playerUpgrades[upgrade.id] < upgrade.maxLevel
    );

    // ランダムに3つ選択
    const selectedUpgrades = [];
    while (selectedUpgrades.length < 3 && availableUpgrades.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableUpgrades.length);
        selectedUpgrades.push(availableUpgrades[randomIndex]);
        availableUpgrades.splice(randomIndex, 1);
    }

    // アップグレードオプション表示
    selectedUpgrades.forEach(upgrade => {
        const currentLevel = gameState.playerUpgrades[upgrade.id];
        const div = document.createElement('div');
        div.className = 'upgrade-option';
        div.dataset.id = upgrade.id;
        div.innerHTML = `
            <h3>${upgrade.name}</h3>
            <p>${upgrade.description}</p>
            <p>レベル: ${currentLevel} → ${currentLevel + 1}</p>
        `;
        upgradeOptions.appendChild(div);
    });

    document.getElementById('level-up').style.display = 'flex';
}

// アップグレード適用
function applyUpgrade(upgradeId) {
    gameState.playerUpgrades[upgradeId]++;

    switch (upgradeId) {
        case 'speed':
            gameState.player.speed *= 1.1;
            break;
        case 'damage':
            gameState.weapons.forEach(weapon => {
                weapon.damage *= 1.15;
            });
            break;
        case 'health':
            const healthIncrease = gameState.player.maxHealth * 0.2;
            gameState.player.maxHealth += healthIncrease;
            gameState.player.health += healthIncrease;
            break;
        case 'attackSpeed':
            gameState.weapons.forEach(weapon => {
                weapon.cooldown *= 0.9;
            });
            break;
        case 'pickup':
            // 収集範囲は計算時に適用
            break;
        case 'bubbleTrap':
            if (gameState.playerUpgrades.bubbleTrap === 1) {
                gameState.weapons.push(new Weapon('bubbleTrap', gameState.player, gameState.assetLoader));
            }
            break;
        case 'waterWave':
            if (gameState.playerUpgrades.waterWave === 1) {
                gameState.weapons.push(new Weapon('waterWave', gameState.player, gameState.assetLoader));
            }
            break;
        case 'fishingNet':
            if (gameState.playerUpgrades.fishingNet === 1) {
                gameState.weapons.push(new Weapon('fishingNet', gameState.player, gameState.assetLoader));
            }
            break;
    }
}

// 描画
function render() {
    // キャンバスクリア
    gameState.ctx.fillStyle = '#0a1a2a';
    gameState.ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);

    // 背景グリッド描画
    drawGrid();

    // アイテム描画
    gameState.pickups.forEach(pickup => {
        pickup.draw(gameState.ctx);
    });

    // 武器エフェクト描画
    gameState.weapons.forEach(weapon => {
        weapon.draw(gameState.ctx);
    });

    // 敵描画
    gameState.enemies.forEach(enemy => {
        enemy.draw(gameState.ctx);
    });

    // プレイヤー描画
    gameState.player.draw(gameState.ctx);
}

// 背景グリッド描画
function drawGrid() {
    gameState.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    gameState.ctx.lineWidth = 1;

    const gridSize = 50;
    const offsetX = gameState.player.x % gridSize;
    const offsetY = gameState.player.y % gridSize;

    // 垂直線
    for (let x = -offsetX; x < gameState.canvas.width; x += gridSize) {
        gameState.ctx.beginPath();
        gameState.ctx.moveTo(x, 0);
        gameState.ctx.lineTo(x, gameState.canvas.height);
        gameState.ctx.stroke();
    }

    // 水平線
    for (let y = -offsetY; y < gameState.canvas.height; y += gridSize) {
        gameState.ctx.beginPath();
        gameState.ctx.moveTo(0, y);
        gameState.ctx.lineTo(gameState.canvas.width, y);
        gameState.ctx.stroke();
    }
}

// ゲームオーバー
function gameOver() {
    gameState.isGameOver = true;

    // ゲームオーバー画面表示
    document.getElementById('survival-time').textContent = Math.floor(gameState.gameTime) + '秒';
    document.getElementById('enemies-defeated').textContent = gameState.enemiesDefeated;
    document.getElementById('game-over').style.display = 'flex';
}

// ゲームリセット
function resetGame() {
    // ゲーム状態リセット
    gameState.enemies = [];
    gameState.weapons = [];
    gameState.pickups = [];
    gameState.level = 1;
    gameState.experience = 0;
    gameState.experienceToNextLevel = 100;
    gameState.gameTime = 0;
    gameState.isGameOver = false;
    gameState.isPaused = false;
    gameState.enemiesDefeated = 0;
    gameState.enemySpawnRate = 0.8; // リセット時も調整した値を使用
    gameState.lastEnemySpawn = 0;
    gameState.difficultyTimer = 0;

    // プレイヤーリセット
    gameState.player = new Player(
        gameState.canvas.width / 2,
        gameState.canvas.height / 2,
        gameState.assetLoader.getImage('player')
    );

    // 武器リセット
    gameState.weapons.push(new Weapon('bubble', gameState.player, gameState.assetLoader));

    // アップグレードリセット
    gameState.availableUpgrades.forEach(upgrade => {
        gameState.playerUpgrades[upgrade.id] = 0;
    });
}

// ゲーム初期化
window.addEventListener('load', initGame);
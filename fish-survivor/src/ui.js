// UIクラス
export class UI {
    constructor(gameState) {
        this.gameState = gameState;
        this.healthBar = document.getElementById('health-bar');
        this.levelInfo = document.getElementById('level-info');
        this.timeInfo = document.getElementById('time-info');
    }
    
    // UI更新
    update() {
        // 体力バー更新
        this.updateHealthBar();
        
        // レベル情報更新
        this.updateLevelInfo();
        
        // 時間情報更新
        this.updateTimeInfo();
    }
    
    // 体力バー更新
    updateHealthBar() {
        const player = this.gameState.player;
        const healthPercent = player.health / player.maxHealth * 100;
        
        this.healthBar.innerHTML = `
            <div style="width: 200px; height: 20px; background-color: rgba(0, 0, 0, 0.5); border-radius: 10px; overflow: hidden; margin-bottom: 10px;">
                <div style="width: ${healthPercent}%; height: 100%; background-color: ${healthPercent > 50 ? '#4caf50' : healthPercent > 25 ? '#ff9800' : '#f44336'}; border-radius: 10px;"></div>
            </div>
            <div>体力: ${Math.ceil(player.health)} / ${player.maxHealth}</div>
        `;
    }
    
    // レベル情報更新
    updateLevelInfo() {
        const expPercent = this.gameState.experience / this.gameState.experienceToNextLevel * 100;
        
        this.levelInfo.innerHTML = `
            <div style="margin-top: 10px;">レベル: ${this.gameState.level}</div>
            <div style="width: 200px; height: 10px; background-color: rgba(0, 0, 0, 0.5); border-radius: 5px; overflow: hidden; margin-top: 5px;">
                <div style="width: ${expPercent}%; height: 100%; background-color: #9775fa; border-radius: 5px;"></div>
            </div>
            <div style="font-size: 12px;">経験値: ${this.gameState.experience} / ${this.gameState.experienceToNextLevel}</div>
        `;
    }
    
    // 時間情報更新
    updateTimeInfo() {
        const minutes = Math.floor(this.gameState.gameTime / 60);
        const seconds = Math.floor(this.gameState.gameTime % 60);
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.timeInfo.innerHTML = `
            <div style="margin-top: 10px;">生存時間: ${formattedTime}</div>
            <div style="font-size: 12px;">倒した敵: ${this.gameState.enemiesDefeated}</div>
        `;
    }
}
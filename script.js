class SicboGame {
    constructor() {
        // DOM Elements
        this.dom = {
            balanceSpan: document.getElementById('balance'),
            totalBetSpan: document.getElementById('totalBet'),
            diceElements: [
                document.getElementById('dice1'),
                document.getElementById('dice2'),
                document.getElementById('dice3')
            ],
            resultTextDiv: document.getElementById('resultText'),
            chipSelector: document.querySelector('.chip-selector'),
            bettingBoard: document.getElementById('bettingBoard'),
            clearBtn: document.getElementById('clearBtn'), // Thêm nút xóa cược
            historyList: document.getElementById('historyList'),
            allChips: document.querySelectorAll('.chip'),
            allBetOptions: document.querySelectorAll('.bet-option')
        };
        // Game State
        [span_301](start_span)this.balance = 1000;[span_301](end_span)
        [span_302](start_span)this.selectedChip = 10;[span_302](end_span)
        this.bets = {}; [span_303](start_span)// Stores { 'type_value': { type, value, amount, element } }[span_303](end_span)
        [span_304](start_span)this.history = [];[span_304](end_span)
        [span_305](start_span)this.isRolling = false;[span_305](end_span)
        this.isAutoRolling = true; [span_306](start_span)// Tự động quay mặc định[span_306](end_span)
        this.autoRollTimer = null; [span_307](start_span)// Biến để lưu trữ ID của setTimeout/setInterval[span_307](end_span)
        this.countdownInterval = null; // Biến để lưu trữ ID của setInterval cho đếm ngược

        // Game Constants
        this.BET_MULTIPLIERS = {
            4: 60, 5: 30, 6: 17, 7: 12, 8: 8, 9: 6, 10: 6,
            11: 6, 12: 6, 13: 8, 14: 12, 15: 17, 16: 30, 17: 60
        [span_308](start_span)};[span_308](end_span)
        [span_309](start_span)this.MAX_HISTORY_ITEMS = 15;[span_309](end_span)
        this.ROLL_INTERVAL = 10000; [span_310](start_span)// 10 giây giữa các lần quay[span_310](end_span)
        this.RESULT_HOLD_TIME = 6000; [span_311](start_span)// Giữ kết quả 6 giây[span_311](end_span)

        [span_312](start_span)this.init();[span_312](end_span)
    }

    /**
     * Initializes the game by loading state, binding events, and updating UI.
     */
    init() {
        [span_313](start_span)this.loadGameState();[span_313](end_span)
        [span_314](start_span)this.bindEvents();[span_314](end_span)
        [span_315](start_span)this.updateDisplay();[span_315](end_span)
        [span_316](start_span)this.updateHistoryDisplay();[span_316](end_span)
        this.dom.allChips.forEach(chip => {
            if (parseInt(chip.dataset.value) === this.selectedChip) {
                chip.classList.add('selected');
            }
        });
        this.startAutoRoll(true); // Bắt đầu vòng quay đầu tiên với đếm ngược
    }

    /**
     * Binds all necessary event listeners.
     */
    bindEvents() {
        // Chip selection using event delegation
        this.dom.chipSelector.addEventListener('click', (e) => {
            const targetChip = e.target.closest('.chip');
            [span_317](start_span)if (targetChip && !this.isRolling) {[span_317](end_span)
                [span_318](start_span)this.selectChip(targetChip);[span_318](end_span)
            }
        });
        // Betting options using event delegation
        this.dom.bettingBoard.addEventListener('click', (e) => {
            const targetOption = e.target.closest('.bet-option');
            if (targetOption && !this.isRolling) {
                [span_319](start_span)this.placeBet(targetOption);[span_319](end_span)
            }
        });
        this.dom.clearBtn.addEventListener('click', () => this.clearBets()); [span_320](start_span)// Event cho nút xóa cược[span_320](end_span)
    }

    /**
     * Selects a chip value.
     * @param {HTMLElement} chipElement - The clicked chip element.
     */
    selectChip(chipElement) {
        [span_321](start_span)this.dom.allChips.forEach(chip => chip.classList.remove('selected'));[span_321](end_span)
        [span_322](start_span)chipElement.classList.add('selected');[span_322](end_span)
        [span_323](start_span)this.selectedChip = parseInt(chipElement.dataset.value);[span_323](end_span)
    }

    /**
     * Places a bet on a selected option.
     * @param {HTMLElement} optionElement - The clicked bet option element.
     */
    placeBet(optionElement) {
        if (this.balance < this.selectedChip) {
            [span_324](start_span)this.showResult('🚫 Không đủ xu để đặt cược!', 'lose');[span_324](end_span)
            return;
        }

        [span_325](start_span)const type = optionElement.dataset.type;[span_325](end_span)
        [span_326](start_span)const value = optionElement.dataset.value;[span_326](end_span)
        [span_327](start_span)const key = `${type}_${value}`;[span_327](end_span)

        if (!this.bets[key]) {
            this.bets[key] = {
                type: type,
                value: value,
                [span_328](start_span)amount: 0,[span_328](end_span)
                element: optionElement
            [span_329](start_span)};[span_329](end_span)
        }

        [span_330](start_span)this.bets[key].amount += this.selectedChip;[span_330](end_span)
        [span_331](start_span)this.balance -= this.selectedChip;[span_331](end_span)

        [span_332](start_span)this.updateBetDisplay(optionElement, this.bets[key].amount);[span_332](end_span)
        [span_333](start_span)this.updateDisplay();[span_333](end_span)
        [span_334](start_span)this.saveGameState();[span_334](end_span)
    }

    /**
     * Updates the visual display of a bet on the board.
     * @param {HTMLElement} element - The bet option DOM element.
     * @param {number} amount - The current bet amount for this option.
     */
    updateBetDisplay(element, amount) {
        [span_335](start_span)let amountDisplay = element.querySelector('.bet-amount');[span_335](end_span)
        if (!amountDisplay) {
            [span_336](start_span)amountDisplay = document.createElement('div');[span_336](end_span)
            [span_337](start_span)amountDisplay.className = 'bet-amount';[span_337](end_span)
            [span_338](start_span)element.appendChild(amountDisplay);[span_338](end_span)
        }
        [span_339](start_span)amountDisplay.textContent = amount;[span_339](end_span)
        [span_340](start_span)element.classList.add('selected');[span_340](end_span)
    }

    /**
     * Clears all active bets and refunds money to the player.
     */
    clearBets() {
        Object.values(this.bets).forEach(bet => {
            [span_341](start_span)this.balance += bet.amount;[span_341](end_span)
            [span_342](start_span)bet.element.classList.remove('selected');[span_342](end_span)
            [span_343](start_span)const amountDisplay = bet.element.querySelector('.bet-amount');[span_343](end_span)
            if (amountDisplay) {
                [span_344](start_span)amountDisplay.remove();[span_344](end_span)
            }
        });
        [span_345](start_span)this.bets = {};[span_345](end_span)
        [span_346](start_span)this.updateDisplay();[span_346](end_span)
        [span_347](start_span)this.saveGameState();[span_347](end_span)
    }

    /**
     * Simulates rolling the dice, calculates winnings, and updates UI.
     */
    async rollDice() {
        [span_348](start_span)if (this.isRolling) return;[span_348](end_span)
        [span_349](start_span)this.isRolling = true;[span_349](end_span)
        this.disableControls(true); [span_350](start_span)// Vô hiệu hóa các nút điều khiển[span_350](end_span)

        // Start dice animation and clear previous results
        this.dom.diceElements.forEach(dice => {
            [span_351](start_span)dice.classList.add('rolling');[span_351](end_span)
            [span_352](start_span)dice.textContent = '?';[span_352](end_span)
        });
        [span_353](start_span)this.showResult('Đang lắc xúc xắc...', '');[span_353](end_span)
        
        // Simulate roll duration
        [span_354](start_span)await new Promise(resolve => setTimeout(resolve, 2000));[span_354](end_span)
        
        // Generate random dice results
        [span_355](start_span)const results = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1);[span_355](end_span)
        
        // Display final results
        this.dom.diceElements.forEach((dice, index) => {
            [span_356](start_span)dice.classList.remove('rolling');[span_356](end_span)
            [span_357](start_span)dice.textContent = results[index];[span_357](end_span)
        });
        
        // Calculate winnings
        [span_358](start_span)this.calculateWinnings(results);[span_358](end_span)
        
        // Save and update history
        [span_359](start_span)this.addToHistory(results);[span_359](end_span)
        
        // Giữ kết quả 6 giây
        [span_360](start_span)await new Promise(resolve => setTimeout(resolve, this.RESULT_HOLD_TIME));[span_360](end_span)
        
        // Xóa cược sau thời gian giữ kết quả
        [span_361](start_span)this.clearBets();[span_361](end_span)
        
        // Đóng lại kết quả xúc xắc
        this.dom.diceElements.forEach(dice => {
            dice.textContent = '?';
        });
        
        // Reset trạng thái
        [span_362](start_span)this.isRolling = false;[span_362](end_span)
        this.disableControls(false); [span_363](start_span)// Kích hoạt lại các nút điều khiển[span_363](end_span)

        // Nếu đang ở chế độ tự động quay, đặt hẹn giờ cho lần quay tiếp theo và hiển thị đếm ngược
        if (this.isAutoRolling) {
            this.startAutoRoll(true); // Bắt đầu đếm ngược cho lần quay tiếp theo
        }
    }

    /**
     * Disables or enables controls during rolling.
     * @param {boolean} disabled - True to disable, false to enable.
     */
    disableControls(disabled) {
        this.dom.clearBtn.disabled = disabled; // Vô hiệu hóa nút xóa cược
        this.dom.allBetOptions.forEach(option => {
            [span_364](start_span)option.style.pointerEvents = disabled ? 'none' : 'auto';[span_364](end_span)
            option.style.opacity = disabled ? [span_365](start_span)'0.7' : '1';[span_365](end_span)
        });
        this.dom.chipSelector.style.pointerEvents = disabled ? [span_366](start_span)'none' : 'auto';[span_366](end_span)
        this.dom.chipSelector.style.opacity = disabled ? [span_367](start_span)'0.7' : '1';[span_367](end_span)
    }

    /**
     * Calculates winnings based on dice results and placed bets.
     * @param {number[]} results - An array of the three dice results.
     */
    calculateWinnings(results) {
        [span_368](start_span)const total = results.reduce((a, b) => a + b, 0);[span_368](end_span)
        [span_369](start_span)let totalWin = 0;[span_369](end_span)
        [span_370](start_span)let winningBetsDetails = [];[span_370](end_span)
        [span_371](start_span)const isTriple = results[0] === results[1] && results[1] === results[2];[span_371](end_span)
        // Check for specific winning conditions
        Object.values(this.bets).forEach(bet => {
            let isWin = false;
            let multiplier = 0; // Payout multiplier (e.g., 1 for 1:1, 60 for 1:60)

            [span_372](start_span)switch (bet.type) {[span_372](end_span)
                case 'total':
                    if (total == bet.value) {
                        [span_373](start_span)isWin = true;[span_373](end_span)
                        [span_374](start_span)multiplier = this.BET_MULTIPLIERS[parseInt(bet.value)];[span_374](end_span)
                    }
                    break;

                case 'size': // Tài/Xỉu (Big/Small)
                    // Small: 4-10, Big: 11-17. Lose on any triple.
                    [span_375](start_span)if (!isTriple) {[span_375](end_span)
                        if ((bet.value === 'small' && total >= 4 && total <= 10) ||
                            (bet.value === 'big' && total >= 11 && total <= 17)) {
                            [span_376](start_span)isWin = true;[span_376](end_span)
                            [span_377](start_span)multiplier = 1;[span_377](end_span)
                        }
                    }
                    [span_378](start_span)break;[span_378](end_span)
                case 'oddeven': // Chẵn/Lẻ (Odd/Even)
                    // Lose on any triple.
                    [span_379](start_span)if (!isTriple) {[span_379](end_span)
                        if ((bet.value === 'odd' && total % 2 === 1) ||
                            (bet.value === 'even' && total % 2 === 0)) {
                            [span_380](start_span)isWin = true;[span_380](end_span)
                            [span_381](start_span)multiplier = 1;[span_381](end_span)
                        }
                    }
                    [span_382](start_span)break;[span_382](end_span)
                case 'single': // Cược số đơn
                    [span_383](start_span)const count = results.filter(r => r == bet.value).length;[span_383](end_span)
                    if (count > 0) {
                        [span_384](start_span)isWin = true;[span_384](end_span)
                        multiplier = count; [span_385](start_span)// 1:1 for each appearance (e.g., if '1' appears twice, payout is 2x bet)[span_385](end_span)
                    }
                    [span_386](start_span)break;[span_386](end_span)
            }

            if (isWin) {
                [span_387](start_span)const winAmount = bet.amount * multiplier;[span_387](end_span)
                // Only profit
                [span_388](start_span)totalWin += bet.amount + winAmount;[span_388](end_span)
                // Add back original bet + profit
                [span_389](start_span)winningBetsDetails.push(`${this.getBetName(bet)}: +${winAmount} xu`);[span_389](end_span)
            }
        });
        [span_390](start_span)const totalBetAmount = Object.values(this.bets).reduce((sum, bet) => sum + bet.amount, 0);[span_390](end_span)
        [span_391](start_span)const netChange = totalWin - totalBetAmount;[span_391](end_span)

        [span_392](start_span)let messageClass = '';[span_392](end_span)
        [span_393](start_span)let resultMessage = '';[span_393](end_span)

        if (netChange > 0) {
            [span_394](start_span)messageClass = 'win';[span_394](end_span)
            resultMessage = `🎉 THẮNG! [span_395](start_span)🎉`;[span_395](end_span)
            [span_396](start_span)resultMessage += `<br><span class="result-detail">Bạn thắng ${netChange} xu!</span>`;[span_396](end_span)
        } else if (netChange < 0) {
            [span_397](start_span)messageClass = 'lose';[span_397](end_span)
            [span_398](start_span)resultMessage = `😢 THUA!`;[span_398](end_span)
            [span_399](start_span)resultMessage += `<br><span class="result-detail">Bạn mất ${Math.abs(netChange)} xu.</span>`;[span_399](end_span)
        } else {
            [span_400](start_span)messageClass = '';[span_400](end_span)
            resultMessage = `🤝 HÒA! [span_401](start_span)Bạn không thắng cũng không thua.`;[span_401](end_span)
        }
        
        this.showResult(`
            <span class="result-text">${resultMessage}</span><br>
            <span class="result-detail">Kết quả: ${results.join('-')} (Tổng: ${total})</span>
            ${winningBetsDetails.length > 0 ? `<br><span class="result-detail">${winningBetsDetails.join('<br>')}</span>` : ''}
        [span_402](start_span)`, messageClass);[span_402](end_span)
        this.balance += netChange; [span_403](start_span)// Cập nhật số dư cuối cùng[span_403](end_span)
        [span_404](start_span)this.updateDisplay();[span_404](end_span)
        [span_405](start_span)this.saveGameState();[span_405](end_span)
    }

    /**
     * Returns a user-friendly name for a given bet.
     * @param {object} bet - The bet object.
     * @returns {string} The display name of the bet.
     */
    getBetName(bet) {
        const names = {
            'size_small': 'Xỉu',
            'size_big': 'Tài',
            'oddeven_odd': 'Lẻ',
            [span_406](start_span)'oddeven_even': 'Chẵn'[span_406](end_span)
        };
        if (bet.type === 'total') {
            [span_407](start_span)return `Tổng ${bet.value}`;[span_407](end_span)
        } else if (bet.type === 'single') {
            [span_408](start_span)return `Số ${bet.value}`;[span_408](end_span)
        } else {
            [span_409](start_span)return names[`${bet.type}_${bet.value}`] || bet.value;[span_409](end_span)
        }
    }

    /**
     * Adds the current game result to the history.
     * @param {number[]} results - An array of the three dice results.
     */
    addToHistory(results) {
        [span_410](start_span)const total = results.reduce((a, b) => a + b, 0);[span_410](end_span)
        [span_411](start_span)const isTriple = results[0] === results[1] && results[1] === results[2];[span_411](end_span)
        [span_412](start_span)let sizeText = '';[span_412](end_span)
        [span_413](start_span)if (total >= 4 && total <= 10) sizeText = 'Xỉu';[span_413](end_span)
        [span_414](start_span)else if (total >= 11 && total <= 17) sizeText = 'Tài';[span_414](end_span)
        this.history.unshift({
            dice: results.join('-'),
            total: total,
            size: sizeText,
            oddeven: total % 2 === 0 ? 'Chẵn' : 'Lẻ',
            [span_415](start_span)isTriple: isTriple[span_415](end_span)
        });
        if (this.history.length > this.MAX_HISTORY_ITEMS) {
            [span_416](start_span)this.history.pop();[span_416](end_span)
        }
        [span_417](start_span)this.updateHistoryDisplay();[span_417](end_span)
        [span_418](start_span)this.saveGameState();[span_418](end_span)
    }

    /**
     * Updates the history list display.
     */
    updateHistoryDisplay() {
        if (this.history.length === 0) {
            [span_419](start_span)this.dom.historyList.innerHTML = '<div class="history-item">Chưa có kết quả</div>';[span_419](end_span)
        } else {
            this.dom.historyList.innerHTML = this.history.map(h => 
                `<div class="history-item">${h.dice} (${h.total}) ${h.isTriple ? 'TAM HOA' : ''} ${h.size} ${h.oddeven}</div>`
            [span_420](start_span)).join('');[span_420](end_span)
        }
    }

    /**
     * Updates the balance and total bet display.
     */
    updateDisplay() {
        [span_421](start_span)this.dom.balanceSpan.textContent = this.balance;[span_421](end_span)
        [span_422](start_span)const totalBet = Object.values(this.bets).reduce((sum, bet) => sum + bet.amount, 0);[span_422](end_span)
        [span_423](start_span)this.dom.totalBetSpan.textContent = totalBet;[span_423](end_span)
    }

    /**
     * Displays a message in the result area.
     * @param {string} message - The message to display (can include HTML).
     * @param {string} type - 'win', 'lose', or empty string for neutral.
     * @param {number} countdown - Time in seconds for countdown.
     */
    showResult(message, type = '', countdown = 0) {
        [span_424](start_span)this.dom.resultTextDiv.className = `result-text ${type}`;[span_424](end_span)
        [span_425](start_span)this.dom.resultTextDiv.innerHTML = message;[span_425](end_span)
        if (countdown > 0) {
            const countdownSpan = document.createElement('span');
            countdownSpan.id = 'countdownTimer';
            countdownSpan.style.fontSize = '0.8em';
            countdownSpan.style.opacity = '0.7';
            this.dom.resultTextDiv.appendChild(document.createElement('br'));
            this.dom.resultTextDiv.appendChild(countdownSpan);
            this.startCountdown(countdown);
        }
    }

    /**
     * Starts the countdown timer.
     * @param {number} duration - The duration of the countdown in seconds.
     */
    startCountdown(duration) {
        let timer = duration;
        const countdownElement = document.getElementById('countdownTimer');
        if (!countdownElement) return;

        countdownElement.textContent = `Vòng tiếp theo trong ${timer} giây...`;

        this.countdownInterval = setInterval(() => {
            timer--;
            countdownElement.textContent = `Vòng tiếp theo trong ${timer} giây...`;
            if (timer <= 0) {
                clearInterval(this.countdownInterval);
                countdownElement.textContent = ''; // Clear countdown text
            }
        }, 1000);
    }

    /**
     * Resets the game to its initial state.
     */
    resetGame() {
        [span_426](start_span)if (this.isRolling) return;[span_426](end_span)
        [span_427](start_span)if (confirm('Bạn có chắc muốn đặt lại game? Điều này sẽ xóa tất cả tiền và lịch sử!')) {[span_427](end_span)
            clearTimeout(this.autoRollTimer);
            clearInterval(this.countdownInterval); // Xóa bộ đếm ngược
            this.autoRollTimer = null;
            [span_428](start_span)this.balance = 1000;[span_428](end_span)
            [span_429](start_span)this.clearBets();[span_429](end_span)
            [span_430](start_span)this.history = [];[span_430](end_span)
            [span_431](start_span)this.updateHistoryDisplay();[span_431](end_span)
            [span_432](start_span)this.dom.diceElements.forEach(dice => dice.textContent = '?');[span_432](end_span)
            [span_433](start_span)this.showResult('🔄 Game đã được đặt lại! Chúc bạn may mắn!', '');[span_433](end_span)
            [span_434](start_span)this.saveGameState();[span_434](end_span)
            this.startAutoRoll(true); // Khởi động lại tự động quay với đếm ngược
        }
    }

    /**
     * Starts the automatic roll timer.
     * @param {boolean} showCountdown - True to display countdown message, false otherwise.
     */
    startAutoRoll(showCountdown = false) {
        clearTimeout(this.autoRollTimer); // Clear any existing timer
        clearInterval(this.countdownInterval); // Clear any running countdown
        
        if (!this.isRolling) { // Only start if not already rolling
            if (showCountdown) {
                this.showResult(`Chuẩn bị cho vòng tiếp theo...`, '', this.ROLL_INTERVAL / 1000); // Hiển thị đếm ngược
            } else {
                this.showResult('Tự động quay đã BẬT. Vòng tiếp theo sẽ bắt đầu sau một lát.', '');
            }

            this.autoRollTimer = setTimeout(() => {
                this.rollDice();
            }, this.ROLL_INTERVAL);
        }
    }

    /**
     * Saves current game state to LocalStorage.
     */
    saveGameState() {
        const gameState = {
            [span_435](start_span)balance: this.balance,[span_435](end_span)
            [span_436](start_span)history: this.history,[span_436](end_span)
            [span_437](start_span)selectedChip: this.selectedChip[span_437](end_span)
        };
        [span_438](start_span)localStorage.setItem('sicboGameState', JSON.stringify(gameState));[span_438](end_span)
    }

    /**
     * Loads game state from LocalStorage.
     */
    loadGameState() {
        [span_439](start_span)const savedState = localStorage.getItem('sicboGameState');[span_439](end_span)
        if (savedState) {
            [span_440](start_span)const gameState = JSON.parse(savedState);[span_440](end_span)
            this.balance = gameState.balance || [span_441](start_span)1000;[span_441](end_span)
            this.history = gameState.history || [span_442](start_span)[];[span_442](end_span)
            this.selectedChip = gameState.selectedChip || [span_443](start_span)10;[span_443](end_span)
        }
    }
}

// Initialize the game when the DOM is fully loaded
[span_444](start_span)document.addEventListener('DOMContentLoaded', () => {[span_444](end_span)
    [span_445](start_span)new SicboGame();[span_445](end_span)
});

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
                this.balance = 1000;
                this.selectedChip = 10;
                this.bets = {}; // Stores { 'type_value': { type, value, amount, element } }
                this.history = [];
                this.isRolling = false;
                this.isAutoRolling = true; // Tự động quay mặc định
                this.autoRollTimer = null; // Biến để lưu trữ ID của setTimeout/setInterval
                this.countdownInterval = null; // Biến để lưu trữ ID của setInterval cho đếm ngược

                // Game Constants
                this.BET_MULTIPLIERS = {
                    4: 60, 5: 30, 6: 17, 7: 12, 8: 8, 9: 6, 10: 6,
                    11: 6, 12: 6, 13: 8, 14: 12, 15: 17, 16: 30, 17: 60
                };
                this.MAX_HISTORY_ITEMS = 15;
                this.ROLL_INTERVAL = 10000; // 10 giây giữa các lần quay
                this.RESULT_HOLD_TIME = 6000; // Giữ kết quả 6 giây

                this.init();
            }

            /**
             * Initializes the game by loading state, binding events, and updating UI.
             */
            init() {
                this.loadGameState();
                this.bindEvents();
                this.updateDisplay();
                this.updateHistoryDisplay();
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
                    if (targetChip && !this.isRolling) {
                        this.selectChip(targetChip);
                    }
                });
                // Betting options using event delegation
                this.dom.bettingBoard.addEventListener('click', (e) => {
                    const targetOption = e.target.closest('.bet-option');
                    if (targetOption && !this.isRolling) {
                        this.placeBet(targetOption);
                    }
                });
                this.dom.clearBtn.addEventListener('click', () => this.clearBets()); // Event cho nút xóa cược
            }

            /**
             * Selects a chip value.
             * @param {HTMLElement} chipElement - The clicked chip element.
             */
            selectChip(chipElement) {
                this.dom.allChips.forEach(chip => chip.classList.remove('selected'));
                chipElement.classList.add('selected');
                this.selectedChip = parseInt(chipElement.dataset.value);
            }

            /**
             * Places a bet on a selected option.
             * @param {HTMLElement} optionElement - The clicked bet option element.
             */
            placeBet(optionElement) {
                if (this.balance < this.selectedChip) {
                    this.showResult('🚫 Không đủ xu để đặt cược!', 'lose');
                    return;
                }

                const type = optionElement.dataset.type;
                const value = optionElement.dataset.value;
                const key = `${type}_${value}`;

                if (!this.bets[key]) {
                    this.bets[key] = {
                        type: type,
                        value: value,
                        amount: 0,
                        element: optionElement
                    };
                }

                this.bets[key].amount += this.selectedChip;
                this.balance -= this.selectedChip;

                this.updateBetDisplay(optionElement, this.bets[key].amount);
                this.updateDisplay();
                this.saveGameState();
            }

            /**
             * Updates the visual display of a bet on the board.
             * @param {HTMLElement} element - The bet option DOM element.
             * @param {number} amount - The current bet amount for this option.
             */
            updateBetDisplay(element, amount) {
                let amountDisplay = element.querySelector('.bet-amount');
                if (!amountDisplay) {
                    amountDisplay = document.createElement('div');
                    amountDisplay.className = 'bet-amount';
                    element.appendChild(amountDisplay);
                }
                amountDisplay.textContent = amount;
                element.classList.add('selected');
            }

            /**
             * Clears all active bets and refunds money to the player.
             */
            clearBets() {
                Object.values(this.bets).forEach(bet => {
                    this.balance += bet.amount;
                    bet.element.classList.remove('selected');
                    const amountDisplay = bet.element.querySelector('.bet-amount');
                    if (amountDisplay) {
                        amountDisplay.remove();
                    }
                });
                this.bets = {};
                this.updateDisplay();
                this.saveGameState();
            }

            /**
             * Simulates rolling the dice, calculates winnings, and updates UI.
             */
            async rollDice() {
                if (this.isRolling) return;
                this.isRolling = true;
                this.disableControls(true); // Vô hiệu hóa các nút điều khiển

                // Start dice animation and clear previous results
                this.dom.diceElements.forEach(dice => {
                    dice.classList.add('rolling');
                    dice.textContent = '?';
                });
                this.showResult('Đang lắc xúc xắc...', '');
                
                // Simulate roll duration
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Generate random dice results
                const results = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1);
                
                // Display final results
                this.dom.diceElements.forEach((dice, index) => {
                    dice.classList.remove('rolling');
                    dice.textContent = results[index];
                });
                
                // Calculate winnings
                this.calculateWinnings(results);
                
                // Save and update history
                this.addToHistory(results);
                
                // Giữ kết quả 6 giây
                await new Promise(resolve => setTimeout(resolve, this.RESULT_HOLD_TIME));
                
                // Xóa cược sau thời gian giữ kết quả
                this.clearBets();
                
                // Đóng lại kết quả xúc xắc
                this.dom.diceElements.forEach(dice => {
                    dice.textContent = '?';
                });
                
                // Reset trạng thái
                this.isRolling = false;
                this.disableControls(false); // Kích hoạt lại các nút điều khiển

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
                    option.style.pointerEvents = disabled ? 'none' : 'auto';
                    option.style.opacity = disabled ? '0.7' : '1';
                });
                this.dom.chipSelector.style.pointerEvents = disabled ? 'none' : 'auto';
                this.dom.chipSelector.style.opacity = disabled ? '0.7' : '1';
            }

            /**
             * Calculates winnings based on dice results and placed bets.
             * @param {number[]} results - An array of the three dice results.
             */
            calculateWinnings(results) {
                const total = results.reduce((a, b) => a + b, 0);
                let totalWin = 0;
                let winningBetsDetails = [];
                const isTriple = results[0] === results[1] && results[1] === results[2];
                // Check for specific winning conditions
                Object.values(this.bets).forEach(bet => {
                    let isWin = false;
                    let multiplier = 0; // Payout multiplier (e.g., 1 for 1:1, 60 for 1:60)

                    switch (bet.type) {
                        case 'total':
                            if (total == bet.value) {
                                isWin = true;
                                multiplier = this.BET_MULTIPLIERS[parseInt(bet.value)];
                            }
                            break;

                        case 'size': // Tài/Xỉu (Big/Small)
                            // Small: 4-10, Big: 11-17. Lose on any triple.
                            if (!isTriple) {
                                if ((bet.value === 'small' && total >= 4 && total <= 10) ||
                                    (bet.value === 'big' && total >= 11 && total <= 17)) {
                                    isWin = true;
                                    multiplier = 1;
                                }
                            }
                            break;
                        case 'oddeven': // Chẵn/Lẻ (Odd/Even)
                            // Lose on any triple.
                            if (!isTriple) {
                                if ((bet.value === 'odd' && total % 2 === 1) ||
                                    (bet.value === 'even' && total % 2 === 0)) {
                                    isWin = true;
                                    multiplier = 1;
                                }
                            }
                            break;
                        case 'single': // Cược số đơn
                            const count = results.filter(r => r == bet.value).length;
                            if (count > 0) {
                                isWin = true;
                                multiplier = count; // 1:1 for each appearance (e.g., if '1' appears twice, payout is 2x bet)
                            }
                            break;
                    }

                    if (isWin) {
                        const winAmount = bet.amount * multiplier; // Only profit
                        totalWin += bet.amount + winAmount; // Add back original bet + profit
                        winningBetsDetails.push(`${this.getBetName(bet)}: +${winAmount} xu`);
                    }
                });
                const totalBetAmount = Object.values(this.bets).reduce((sum, bet) => sum + bet.amount, 0);
                const netChange = totalWin - totalBetAmount;

                let messageClass = '';
                let resultMessage = '';

                if (netChange > 0) {
                    messageClass = 'win';
                    resultMessage = `🎉 THẮNG! 🎉`;
                    resultMessage += `<br><span class="result-detail">Bạn thắng ${netChange} xu!</span>`;
                } else if (netChange < 0) {
                    messageClass = 'lose';
                    resultMessage = `😢 THUA!`;
                    resultMessage += `<br><span class="result-detail">Bạn mất ${Math.abs(netChange)} xu.</span>`;
                } else {
                    messageClass = '';
                    resultMessage = `🤝 HÒA! Bạn không thắng cũng không thua.`;
                }
                
                this.showResult(`
                    <span class="result-text">${resultMessage}</span><br>
                    <span class="result-detail">Kết quả: ${results.join('-')} (Tổng: ${total})</span>
                    ${winningBetsDetails.length > 0 ? `<br><span class="result-detail">${winningBetsDetails.join('<br>')}</span>` : ''}
                `, messageClass);
                this.balance += netChange; // Cập nhật số dư cuối cùng
                this.updateDisplay();
                this.saveGameState();
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
                    'oddeven_even': 'Chẵn'
                };
                if (bet.type === 'total') {
                    return `Tổng ${bet.value}`;
                } else if (bet.type === 'single') {
                    return `Số ${bet.value}`;
                } else {
                    return names[`${bet.type}_${bet.value}`] || bet.value;
                }
            }

            /**
             * Adds the current game result to the history.
             * @param {number[]} results - An array of the three dice results.
             */
            addToHistory(results) {
                const total = results.reduce((a, b) => a + b, 0);
                const isTriple = results[0] === results[1] && results[1] === results[2];
                let sizeText = '';
                if (total >= 4 && total <= 10) sizeText = 'Xỉu';
                else if (total >= 11 && total <= 17) sizeText = 'Tài';
                this.history.unshift({
                    dice: results.join('-'),
                    total: total,
                    size: sizeText,
                    oddeven: total % 2 === 0 ? 'Chẵn' : 'Lẻ',
                    isTriple: isTriple
                });
                if (this.history.length > this.MAX_HISTORY_ITEMS) {
                    this.history.pop();
                }
                this.updateHistoryDisplay();
                this.saveGameState();
            }

            /**
             * Updates the history list display.
             */
            updateHistoryDisplay() {
                if (this.history.length === 0) {
                    this.dom.historyList.innerHTML = '<div class="history-item">Chưa có kết quả</div>';
                } else {
                    this.dom.historyList.innerHTML = this.history.map(h => 
                        `<div class="history-item">${h.dice} (${h.total}) ${h.isTriple ? 'TAM HOA' : ''} ${h.size} ${h.oddeven}</div>`
                    ).join('');
                }
            }

            /**
             * Updates the balance and total bet display.
             */
            updateDisplay() {
                this.dom.balanceSpan.textContent = this.balance;
                const totalBet = Object.values(this.bets).reduce((sum, bet) => sum + bet.amount, 0);
                this.dom.totalBetSpan.textContent = totalBet;
            }

            /**
             * Displays a message in the result area.
             * @param {string} message - The message to display (can include HTML).
             * @param {string} type - 'win', 'lose', or empty string for neutral.
             * @param {number} countdown - Time in seconds for countdown.
             */
            showResult(message, type = '', countdown = 0) {
                this.dom.resultTextDiv.className = `result-text ${type}`;
                this.dom.resultTextDiv.innerHTML = message;
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
                if (this.isRolling) return;
                if (confirm('Bạn có chắc muốn đặt lại game? Điều này sẽ xóa tất cả tiền và lịch sử!')) {
                    clearTimeout(this.autoRollTimer);
                    clearInterval(this.countdownInterval); // Xóa bộ đếm ngược
                    this.autoRollTimer = null;
                    this.balance = 1000;
                    this.clearBets();
                    this.history = [];
                    this.updateHistoryDisplay();
                    this.dom.diceElements.forEach(dice => dice.textContent = '?');
                    this.showResult('🔄 Game đã được đặt lại! Chúc bạn may mắn!', '');
                    this.saveGameState();
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
                    balance: this.balance,
                    history: this.history,
                    selectedChip: this.selectedChip
                };
                localStorage.setItem('sicboGameState', JSON.stringify(gameState));
            }

            /**
             * Loads game state from LocalStorage.
             */
            loadGameState() {
                const savedState = localStorage.getItem('sicboGameState');
                if (savedState) {
                    const gameState = JSON.parse(savedState);
                    this.balance = gameState.balance || 1000;
                    this.history = gameState.history || [];
                    this.selectedChip = gameState.selectedChip || 10;
                }
            }
        }

        // Initialize the game when the DOM is fully loaded
        document.addEventListener('DOMContentLoaded', () => {
            new SicboGame();
        });

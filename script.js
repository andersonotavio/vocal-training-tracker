   let exerciseData = {};
        let selectedExercises = 0;

        // Carregar dados salvos
        function loadData() {
            const saved = localStorage.getItem('voiceExerciseData');
            if (saved) {
                exerciseData = JSON.parse(saved);
            }
        }

        // Salvar dados
        function saveData() {
            localStorage.setItem('voiceExerciseData', JSON.stringify(exerciseData));
        }

        // Formatar data
        function formatDate(date) {
            return date.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Obter data de hoje como string
        function getTodayString() {
            return new Date().toISOString().split('T')[0];
        }

        // Inicializar página
        function init() {
            loadData();
            
            const today = new Date();
            document.getElementById('todayDate').textContent = formatDate(today);
            
            // Verificar se já existe registro para hoje
            const todayStr = getTodayString();
            if (exerciseData[todayStr] !== undefined) {
                selectedExercises = exerciseData[todayStr];
                updateButtonSelection();
            }
            
            updateStats();
            updateHistory();
            
            // Adicionar event listeners aos botões
            document.querySelectorAll('.exercise-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    selectedExercises = parseInt(this.dataset.count);
                    updateButtonSelection();
                });
            });
        }

        // Atualizar seleção dos botões
        function updateButtonSelection() {
            document.querySelectorAll('.exercise-btn').forEach(btn => {
                btn.classList.remove('active');
                if (parseInt(btn.dataset.count) === selectedExercises) {
                    btn.classList.add('active');
                }
            });
        }

        // Salvar o dia atual
        function saveToday() {
            const todayStr = getTodayString();
            exerciseData[todayStr] = selectedExercises;
            saveData();
            updateStats();
            updateHistory();
            
            // Feedback visual
            const saveBtn = document.querySelector('.save-btn');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '✓ Salvo!';
            saveBtn.style.background = '#4CAF50';
            saveBtn.style.color = 'white';
            
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.background = '';
                saveBtn.style.color = '';
            }, 2000);
        }

        // Atualizar estatísticas
        function updateStats() {
            const dates = Object.keys(exerciseData).sort();
            const exercises = dates.map(date => exerciseData[date]);
            
            // Total de dias
            document.getElementById('totalDays').textContent = dates.length;
            
            // Dias completos (3 exercícios)
            const completeDays = exercises.filter(count => count === 3).length;
            document.getElementById('completeDays').textContent = completeDays;
            
            // Média de exercícios
            if (exercises.length > 0) {
                const avg = exercises.reduce((a, b) => a + b, 0) / exercises.length;
                document.getElementById('avgExercises').textContent = avg.toFixed(1);
            } else {
                document.getElementById('avgExercises').textContent = '0';
            }
            
            // Sequência atual
            let streak = 0;
            const today = new Date();
            for (let i = 0; i < 30; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                if (exerciseData[dateStr] && exerciseData[dateStr] > 0) {
                    streak++;
                } else {
                    break;
                }
            }
            document.getElementById('streak').textContent = streak;
        }

        // Atualizar histórico
        function updateHistory() {
            const historyList = document.getElementById('historyList');
            const dates = Object.keys(exerciseData).sort().reverse();
            
            if (dates.length === 0) {
                historyList.innerHTML = '<div class="no-history">Nenhum registro ainda. Comece hoje!</div>';
                return;
            }
            
            historyList.innerHTML = dates.slice(0, 10).map(dateStr => {
                // const date = new Date(dateStr);
                const dateParts = dateStr.split('-');
                const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
                const count = exerciseData[dateStr];
                const dots = Array.from({length: 3}, (_, i) => 
                    `<div class="exercise-dot ${i < count ? 'completed' : ''}"></div>`
                ).join('');
                
                return `
                    <div class="history-item">
                        <span class="history-date">${date.toLocaleDateString('pt-BR')}</span>
                        <div class="history-exercises">${dots}</div>
                    </div>
                `;
            }).join('');
        }

        // Inicializar quando a página carregar
        document.addEventListener('DOMContentLoaded', init);
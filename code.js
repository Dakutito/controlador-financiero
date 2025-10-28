 // Datos iniciales
        let financialData = {
            income: 0,
            expenses: 0,
            savings: 0,
            emergency: 0
        };

        // Historial de gastos
        let expenseHistory = [];

        /* --- ALERTAS / CONFIRMACIONES PERSONALIZADAS --- */
        // Mostrar un modal tipo alerta con un botón Aceptar
        function showAlert(message) {
            const backdrop = document.getElementById('custom-modal');
            const msg = document.getElementById('modalMessage');
            const ok = document.getElementById('modalOk');
            const cancel = document.getElementById('modalCancel');

            if (!backdrop || !msg || !ok || !cancel) return Promise.resolve();

            msg.textContent = message;
            cancel.style.display = 'none';
            backdrop.classList.add('show');

            return new Promise(resolve => {
                function onOk() {
                    ok.removeEventListener('click', onOk);
                    backdrop.classList.remove('show');
                    resolve();
                }

                ok.addEventListener('click', onOk);
            });
        }

        // Mostrar confirmación con botones Aceptar/Cancelar -> devuelve Promise<boolean>
        function showConfirm(message) {
            const backdrop = document.getElementById('custom-modal');
            const msg = document.getElementById('modalMessage');
            const ok = document.getElementById('modalOk');
            const cancel = document.getElementById('modalCancel');

            if (!backdrop || !msg || !ok || !cancel) return Promise.resolve(false);

            msg.textContent = message;
            cancel.style.display = '';
            backdrop.classList.add('show');

            return new Promise(resolve => {
                function onOk() {
                    cleanup();
                    resolve(true);
                }

                function onCancel() {
                    cleanup();
                    resolve(false);
                }

                function cleanup() {
                    ok.removeEventListener('click', onOk);
                    cancel.removeEventListener('click', onCancel);
                    backdrop.classList.remove('show');
                }

                ok.addEventListener('click', onOk);
                cancel.addEventListener('click', onCancel);
            });
        }

        // Toast simple (mensaje corto que desaparece)
        function showToast(message, duration = 1800) {
            const container = document.getElementById('toast-container');
            if (!container) return;
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
            container.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(6px)';
                setTimeout(() => container.removeChild(toast), 240);
            }, duration);
        }

        // Cargar datos desde localStorage si existen
        function loadData() {
            const savedData = localStorage.getItem('financialData');
            if (savedData) {
                financialData = JSON.parse(savedData);
            }
            
            const savedHistory = localStorage.getItem('expenseHistory');
            if (savedHistory) {
                expenseHistory = JSON.parse(savedHistory);
            }
            
            // Calcular gastos totales basados en el historial
            financialData.expenses = calculateTotalExpenses();
            
            updateInputs();
            updateChart();
            updateSummary();
            updateHistory();
        }

        // Calcular el total de gastos basado en el historial
        function calculateTotalExpenses() {
            return expenseHistory.reduce((total, expense) => total + expense.amount, 0);
        }

        // Guardar datos en localStorage
        function saveData() {
            localStorage.setItem('financialData', JSON.stringify(financialData));
            localStorage.setItem('expenseHistory', JSON.stringify(expenseHistory));
        }

        // Actualizar los inputs con los datos actuales
        function updateInputs() {
            document.getElementById('income').value = financialData.income;
            document.getElementById('expenses').value = financialData.expenses;
            document.getElementById('savings').value = financialData.savings;
            document.getElementById('emergency').value = financialData.emergency;
        }

        // Actualizar el resumen
        function updateSummary() {
            document.getElementById('totalIncome').textContent = `$${financialData.income}`;
            document.getElementById('totalExpenses').textContent = `$${financialData.expenses}`;
            document.getElementById('totalSavings').textContent = `$${financialData.savings}`;
            document.getElementById('totalEmergency').textContent = `$${financialData.emergency}`;
        }

        // Actualizar el historial
        function updateHistory() {
            const historyContainer = document.getElementById('historyContainer');
            
            // Limpiar el contenedor
            historyContainer.innerHTML = '';
            
            if (expenseHistory.length === 0) {
                const emptyHistory = document.createElement('div');
                emptyHistory.className = 'empty-history';
                emptyHistory.id = 'emptyHistory';
                emptyHistory.textContent = 'No hay gastos registrados aún. Agrega tu primer gasto en la sección "Distribución de tus Finanzas".';
                historyContainer.appendChild(emptyHistory);
                return;
            }
            
            // Ordenar historial por fecha (más reciente primero)
            const sortedHistory = [...expenseHistory].sort((a, b) => {
                return new Date(b.date || '1970-01-01') - new Date(a.date || '1970-01-01');
            });
            
            // Crear elementos para cada gasto
            sortedHistory.forEach((expense, index) => {
                const originalIndex = expenseHistory.findIndex(e => 
                    e.name === expense.name && 
                    e.amount === expense.amount && 
                    e.date === expense.date
                );
                
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                const historyInfo = document.createElement('div');
                historyInfo.className = 'history-info';
                
                const historyName = document.createElement('div');
                historyName.className = 'history-name';
                historyName.textContent = expense.name;
                
                const historyDetails = document.createElement('div');
                historyDetails.className = 'history-details';
                
                const historyAmount = document.createElement('span');
                historyAmount.className = 'history-amount';
                historyAmount.textContent = `$${expense.amount}`;
                
                const historyDate = document.createElement('span');
                historyDate.className = 'history-date';
                historyDate.textContent = expense.date ? `Fecha: ${formatDate(expense.date)}` : 'Sin fecha';
                
                historyDetails.appendChild(historyAmount);
                historyDetails.appendChild(historyDate);
                
                historyInfo.appendChild(historyName);
                historyInfo.appendChild(historyDetails);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = 'Eliminar';
                deleteBtn.addEventListener('click', () => {
                    deleteExpense(originalIndex);
                });
                
                historyItem.appendChild(historyInfo);
                historyItem.appendChild(deleteBtn);
                
                historyContainer.appendChild(historyItem);
            });
        }

        // Formatear fecha de YYYY-MM-DD a DD/MM/YYYY
        function formatDate(dateString) {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }

        // Eliminar un gasto del historial
        function deleteExpense(index) {
            showConfirm('¿Estás seguro de que quieres eliminar este gasto?').then(confirmed => {
                if (!confirmed) return;

                // Restar el monto del gasto eliminado del total
                financialData.expenses -= expenseHistory[index].amount;

                // Eliminar el gasto del historial
                expenseHistory.splice(index, 1);

                // Actualizar datos y vistas
                saveData();
                updateInputs();
                updateChart();
                updateSummary();
                updateHistory(); // Actualizar el historial inmediatamente
            });
        }

        // Configuración del gráfico
        let financeChart;

        function updateChart() {
            const ctx = document.getElementById('financeChart').getContext('2d');
            
            // Destruir el gráfico anterior si existe
            if (financeChart) {
                financeChart.destroy();
            }
            
            // Crear nuevo gráfico
            financeChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Ingresos', 'Gastos', 'Ahorros', 'Fondo Emergencia'],
                    datasets: [{
                        data: [
                            financialData.income,
                            financialData.expenses,
                            financialData.savings,
                            financialData.emergency
                        ],
                        backgroundColor: [
                            '#4cc9f0', // success
                            '#f72585', // danger
                            '#4361ee', // primary
                            '#f8961e'  // warning
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                font: {
                                    size: 14
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return `${label}: $${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Funciones para actualizar cada categoría
        function updateIncome() {
            const value = parseFloat(document.getElementById('income').value) || 0;
            financialData.income = value;
            saveData();
            updateChart();
            updateSummary();
        }

        function updateExpenses() {
            const value = parseFloat(document.getElementById('expenses').value) || 0;
            financialData.expenses = value;
            saveData();
            updateChart();
            updateSummary();
        }

        function updateSavings() {
            const value = parseFloat(document.getElementById('savings').value) || 0;
            financialData.savings = value;
            saveData();
            updateChart();
            updateSummary();
        }

        function updateEmergency() {
            const value = parseFloat(document.getElementById('emergency').value) || 0;
            financialData.emergency = value;
            saveData();
            updateChart();
            updateSummary();
        }

        // Agregar un nuevo gasto
        function addExpense() {
            const name = document.getElementById('expenseName').value.trim();
            const amount = parseFloat(document.getElementById('expenseAmount').value) || 0;
            const date = document.getElementById('expenseDate').value;
            
            if (!name) {
                showAlert('Por favor, ingresa un nombre para el gasto');
                return;
            }
            
            if (amount <= 0) {
                showAlert('Por favor, ingresa un monto válido para el gasto');
                return;
            }
            
            // Agregar el gasto al historial
            expenseHistory.push({
                name: name,
                amount: amount,
                date: date || null
            });
            
            // Actualizar el total de gastos
            financialData.expenses += amount;
            
            // Limpiar el formulario
            document.getElementById('expenseName').value = '';
            document.getElementById('expenseAmount').value = '';
            document.getElementById('expenseDate').value = '';
            
            // Actualizar datos y vistas
            saveData();
            updateInputs();
            updateChart();
            updateSummary();
            updateHistory(); // Actualizar el historial inmediatamente
            
            // Mensaje de éxito breve
            showToast('Gasto agregado correctamente');
        }

        function updateAll() {
            updateIncome();
            updateExpenses();
            updateSavings();
            updateEmergency();
            showToast('¡Todos los datos han sido actualizados!');
        }

        function resetData() {
            showConfirm('¿Estás seguro de que quieres reiniciar todos los datos? Esto eliminará también el historial de gastos.').then(confirmed => {
                if (!confirmed) return;

                financialData = {
                    income: 0,
                    expenses: 0,
                    savings: 0,
                    emergency: 0
                };

                expenseHistory = [];

                saveData();
                updateInputs();
                updateChart();
                updateSummary();
                updateHistory(); // Actualizar el historial inmediatamente
            });
        }

        // Navegación entre secciones
        function setupNavigation() {
            const navItems = document.querySelectorAll('.nav-item');
            const sections = document.querySelectorAll('.section');
            
            navItems.forEach(item => {
                item.addEventListener('click', function() {
                    const targetId = this.getAttribute('data-target');
                    
                    // Remover clase active de todos los items y secciones
                    navItems.forEach(nav => nav.classList.remove('active'));
                    sections.forEach(section => section.classList.remove('active'));
                    
                    // Agregar clase active al item clickeado y a la sección correspondiente
                    this.classList.add('active');
                    document.getElementById(targetId).classList.add('active');
                    
                    // Si la sección activa es el historial, actualizarlo
                    if (targetId === 'history') {
                        updateHistory();
                    }
                });
            });
        }

        // Event Listeners
        document.getElementById('updateIncome').addEventListener('click', updateIncome);
        document.getElementById('updateExpenses').addEventListener('click', updateExpenses);
        document.getElementById('updateSavings').addEventListener('click', updateSavings);
        document.getElementById('updateEmergency').addEventListener('click', updateEmergency);
        document.getElementById('addExpense').addEventListener('click', addExpense);
        document.getElementById('updateChart').addEventListener('click', updateChart);
        document.getElementById('updateAll').addEventListener('click', updateAll);
        document.getElementById('resetData').addEventListener('click', resetData);

        // Inicializar la aplicación
        document.addEventListener('DOMContentLoaded', function() {
            loadData();
            setupNavigation();
            
            // Establecer la fecha actual como valor por defecto en el campo de fecha
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('expenseDate').value = today;
        });

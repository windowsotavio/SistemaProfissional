// Preços dos produtos
const productPrices = {
    1: 0.50,
    2: 5.90,
    3: 12.90,
    4: 28.90
};

// Elementos DOM
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');
const scheduleBtn = document.getElementById('schedule-btn');
const confirmationModal = document.getElementById('confirmationModal');
const closeModal = document.querySelector('.close-modal');
const heroCta = document.getElementById('hero-cta');

// Elementos do resumo
const summaryName = document.getElementById('summary-name');
const summaryPhone = document.getElementById('summary-phone');
const summaryDate = document.getElementById('summary-date');
const summaryTime = document.getElementById('summary-time');
const summaryProducts = document.getElementById('summary-products');
const summaryTotal = document.getElementById('summary-total');
const finalTotal = document.getElementById('final-total');

// Elementos do modal
const modalDate = document.getElementById('modal-date');
const modalTotal = document.getElementById('modal-total');
const modalCode = document.getElementById('modal-code');

// Container de agendamentos
const appointmentsContainer = document.getElementById('appointments-container');

// Inicialização
function init() {
    // Atualizar data mínima para hoje
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Configurar event listeners
    setupEventListeners();
    
    // Carregar agendamentos de exemplo
    loadSampleAppointments();
    
    // Inicializar o resumo
    updateSummary();
}

// Configurar event listeners
function setupEventListeners() {
    // Seleção de produtos
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('selected');
            updateSummary();
        });
    });

    // Controles de quantidade
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = this.getAttribute('data-product');
            const quantityInput = document.getElementById(`qty-product${productId}`);
            let quantity = parseInt(quantityInput.value);
            
            if (this.classList.contains('plus')) {
                quantity++;
            } else if (this.classList.contains('minus') && quantity > 1) {
                quantity--;
            }
            
            quantityInput.value = quantity;
            updateSummary();
        });
    });

    // Atualizar resumo em tempo real
    nameInput.addEventListener('input', updateSummary);
    phoneInput.addEventListener('input', updateSummary);
    emailInput.addEventListener('input', updateSummary);
    dateInput.addEventListener('change', updateSummary);
    timeSelect.addEventListener('change', updateSummary);

    // Botão de agendamento
    scheduleBtn.addEventListener('click', handleSchedule);

    // Fechar modal
    closeModal.addEventListener('click', closeConfirmationModal);

    // Fechar modal ao clicar fora
    window.addEventListener('click', function(e) {
        if (e.target === confirmationModal) {
            closeConfirmationModal();
        }
    });

    // Botão CTA do hero
    heroCta.addEventListener('click', function() {
        document.querySelector('.form-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    });
}

// Atualizar resumo em tempo real
function updateSummary() {
    summaryName.textContent = nameInput.value || '-';
    summaryPhone.textContent = phoneInput.value || '-';
    summaryDate.textContent = dateInput.value ? formatDate(dateInput.value) : '-';
    summaryTime.textContent = timeSelect.value || '-';
    
    // Calcular produtos selecionados e total
    let selectedProducts = 0;
    let total = 0;
    
    document.querySelectorAll('.product-card.selected').forEach(card => {
        const productId = card.getAttribute('data-product');
        const quantityInput = document.getElementById(`qty-product${productId}`);
        const quantity = parseInt(quantityInput.value);
        
        selectedProducts += quantity;
        total += productPrices[productId] * quantity;
    });
    
    summaryProducts.textContent = selectedProducts;
    summaryTotal.textContent = `R$ ${total.toFixed(2)}`;
    finalTotal.textContent = `R$ ${total.toFixed(2)}`;
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Manipular agendamento
function handleSchedule() {
    // Validação básica
    if (!validateForm()) {
        return;
    }
    
    // Criar objeto de agendamento
    const appointment = createAppointment();
    
    // Adicionar à lista de agendamentos
    addAppointmentToList(appointment);
    
    // Mostrar modal de confirmação
    showConfirmationModal(appointment);
    
    // Limpar formulário
    resetForm();
    
    // Atualizar resumo
    updateSummary();
}

// Validar formulário
function validateForm() {
    if (!nameInput.value || !phoneInput.value || !dateInput.value || !timeSelect.value) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return false;
    }
    
    // Verificar se pelo menos um produto foi selecionado
    const selectedProducts = document.querySelectorAll('.product-card.selected');
    if (selectedProducts.length === 0) {
        alert('Por favor, selecione pelo menos um produto.');
        return false;
    }
    
    return true;
}

// Criar objeto de agendamento
function createAppointment() {
    const appointment = {
        id: generateId(),
        name: nameInput.value,
        phone: phoneInput.value,
        email: emailInput.value,
        date: dateInput.value,
        time: timeSelect.value,
        products: [],
        total: 0,
        notes: document.getElementById('notes').value,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    // Adicionar produtos selecionados
    document.querySelectorAll('.product-card.selected').forEach(card => {
        const productId = card.getAttribute('data-product');
        const quantityInput = document.getElementById(`qty-product${productId}`);
        const quantity = parseInt(quantityInput.value);
        const price = productPrices[productId];
        const productName = card.querySelector('.product-name').textContent;
        
        appointment.products.push({
            id: productId,
            name: productName,
            quantity: quantity,
            price: price,
            subtotal: price * quantity
        });
        
        appointment.total += price * quantity;
    });
    
    return appointment;
}

// Adicionar agendamento à lista
function addAppointmentToList(appointment) {
    const appointmentCard = document.createElement('div');
    appointmentCard.className = 'appointment-card';
    
    // Formatar data
    const formattedDate = formatDate(appointment.date);
    
    // Criar HTML do card
    appointmentCard.innerHTML = `
        <div class="appointment-header">
            <div class="appointment-date">${formattedDate} às ${appointment.time}</div>
            <div class="appointment-status status-confirmed">Confirmado</div>
        </div>
        <div><strong>Cliente:</strong> ${appointment.name}</div>
        <div><strong>Código:</strong> ${appointment.id}</div>
        <div class="appointment-products">
            <strong>Produtos:</strong>
            <ul>
                ${appointment.products.map(product => 
                    `<li>${product.quantity}x ${product.name} - R$ ${product.subtotal.toFixed(2)}</li>`
                ).join('')}
            </ul>
        </div>
        <div><strong>Total:</strong> R$ ${appointment.total.toFixed(2)}</div>
        ${appointment.notes ? `<div><strong>Observações:</strong> ${appointment.notes}</div>` : ''}
        <div class="appointment-actions">
            <button class="btn btn-success btn-sm" onclick="editAppointment('${appointment.id}')">
                <i class="fas fa-edit"></i> Alterar
            </button>
            <button class="btn btn-danger btn-sm" onclick="cancelAppointment('${appointment.id}')">
                <i class="fas fa-times"></i> Cancelar
            </button>
        </div>
    `;
    
    // Adicionar à lista (no topo)
    appointmentsContainer.prepend(appointmentCard);
}

// Mostrar modal de confirmação
function showConfirmationModal(appointment) {
    modalDate.textContent = `${formatDate(appointment.date)} às ${appointment.time}`;
    modalTotal.textContent = `R$ ${appointment.total.toFixed(2)}`;
    modalCode.textContent = appointment.id;
    confirmationModal.style.display = 'flex';
}

// Fechar modal de confirmação
function closeConfirmationModal() {
    confirmationModal.style.display = 'none';
}

// Limpar formulário
function resetForm() {
    nameInput.value = '';
    phoneInput.value = '';
    emailInput.value = '';
    dateInput.value = '';
    timeSelect.value = '';
    document.getElementById('notes').value = '';
    
    // Desmarcar todos os produtos
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Resetar quantidades
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.value = '1';
    });
}

// Gerar ID único
function generateId() {
    return 'AGD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Carregar agendamentos de exemplo
function loadSampleAppointments() {
    const sampleAppointments = [
        {
            id: generateId(),
            name: "Maria Silva",
            phone: "(11) 99999-8888",
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            time: "10:00",
            products: [
                { name: "tijolo", quantity: 10, subtotal: 250.00 },
                { name: "cimento", quantity: 2, subtotal: 175.80 }
            ],
            total: 428.80,
            status: "confirmed",
            notes: "Produto bem embalado"
        },
        {
            id: generateId(),
            name: "João Santos",
            phone: "(11) 97777-6666",
            date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
            time: "15:00",
            products: [
                { name: "ferro", quantity: 1, subtotal: 12.90 },
                { name: "madeira", quantity: 5, subtotal: 280.90 }
            ],
            total: 293.80,
            status: "pending",
            notes: ""
        }
    ];
    
    sampleAppointments.forEach(appointment => {
        addAppointmentToList(appointment);
    });
}

// Funções para ações dos botões (para demonstração)
function editAppointment(appointmentId) {
    alert(`Editar agendamento: ${appointmentId}\n\nEsta funcionalidade seria implementada em uma versão completa do sistema.`);
}

function cancelAppointment(appointmentId) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        alert(`Agendamento ${appointmentId} cancelado com sucesso!`);
        // Em uma implementação real, removeríamos o agendamento da lista
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);
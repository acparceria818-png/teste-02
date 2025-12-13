// app.js - CÓDIGO JAVASCRIPT COMPLETO ATUALIZADO
let currentUser = null;
let currentUserType = null;
let watchId = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('AC Transporte Portal - Inicializando...');
  
  // Inicializar todas as funcionalidades
  initDarkMode();
  initPWA();
  initEventListeners();
  initAccessibility();
  
  // Verificar se já está autenticado
  checkAuthState();
});

// ========== AUTENTICAÇÃO E TIPOS DE USUÁRIO ==========
function selectUserType(type) {
  currentUserType = type;
  
  switch(type) {
    case 'motorista':
      showMotoristaLogin();
      break;
    case 'passageiro':
      showPassageiroScreen();
      break;
    case 'admin':
      showAdminLogin();
      break;
  }
}

function showMotoristaLogin() {
  const container = document.getElementById('app-container');
  container.innerHTML = `
    <section class="login-section">
      <h2><i class="fas fa-bus"></i> Acesso Motorista</h2>
      
      <div class="card">
        <div class="form-group">
          <label for="matricula"><i class="fas fa-id-card"></i> Matrícula</label>
          <input type="text" id="matricula" placeholder="Digite sua matrícula" />
        </div>
        
        <div class="form-group">
          <label for="placaOnibus"><i class="fas fa-bus"></i> Placa do Ônibus</label>
          <input type="text" id="placaOnibus" placeholder="Ex: ABC1234" />
        </div>
        
        <div class="form-group">
          <label for="rotaSelect"><i class="fas fa-route"></i> Rota</label>
          <select id="rotaSelect">
            <option value="">Selecione uma rota</option>
            <option value="adm01">ROTA ADM 01</option>
            <option value="adm02">ROTA ADM 02</option>
            <option value="rota01">ROTA 01</option>
            <option value="rota02">ROTA 02</option>
            <option value="rota03">ROTA 03</option>
            <option value="rota04">ROTA 04</option>
            <option value="rota05">ROTA 05</option>
            <option value="retorno01">RETORNO OVERLAND - ROTA 01</option>
            <option value="retorno02">RETORNO OVERLAND - ROTA 02</option>
          </select>
        </div>
        
        <button class="btn" onclick="loginMotorista()">
          <i class="fas fa-sign-in-alt"></i> Acessar como Motorista
        </button>
        
        <p class="note">Ao acessar, você autoriza o compartilhamento da sua localização em tempo real.</p>
        
        <button class="btn secondary" onclick="backToWelcome()">
          <i class="fas fa-arrow-left"></i> Voltar
        </button>
      </div>
    </section>
  `;
  
  // Adicionar evento para buscar nome da matrícula
  document.getElementById('matricula').addEventListener('blur', buscarNomePorMatricula);
}

async function buscarNomePorMatricula() {
  const matricula = document.getElementById('matricula').value;
  if (!matricula) return;
  
  try {
    // Aqui você implementaria a integração com a planilha Google
    // Como exemplo, vou usar um mock
    const motoristas = {
      '001': 'João Silva',
      '002': 'Maria Santos',
      '003': 'Pedro Oliveira'
    };
    
    const nome = motoristas[matricula];
    if (nome) {
      showMessage(`Bem-vindo, ${nome}!`, 'success');
    }
  } catch (error) {
    console.error('Erro ao buscar matrícula:', error);
  }
}

function loginMotorista() {
  const matricula = document.getElementById('matricula').value;
  const placa = document.getElementById('placaOnibus').value;
  const rota = document.getElementById('rotaSelect').value;
  
  if (!matricula || !placa || !rota) {
    showMessage('Preencha todos os campos!', 'error');
    return;
  }
  
  // Solicitar permissão de localização
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Login bem sucedido
        currentUser = {
          type: 'motorista',
          matricula: matricula,
          placa: placa,
          rota: rota,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        };
        
        // Salvar no localStorage
        localStorage.setItem('ac_user', JSON.stringify(currentUser));
        
        // Iniciar tracking de localização
        startLocationTracking();
        
        // Solicitar permissão para notificações
        requestNotificationPermission();
        
        // Mostrar tela do motorista
        showMotoristaScreen();
      },
      (error) => {
        showMessage('É necessário permitir a localização para acessar como motorista', 'error');
      },
      { enableHighAccuracy: true }
    );
  } else {
    showMessage('Seu navegador não suporta geolocalização', 'error');
  }
}

function showPassageiroScreen() {
  const container = document.getElementById('app-container');
  container.innerHTML = `
    <section id="passageiroMenu">
      <h2><i class="fas fa-user"></i> Menu Passageiro</h2>
      
      <div class="grid-container">
        <div class="card feature-card" onclick="openAvisos('passageiro')">
          <div class="feature-icon">
            <i class="fas fa-bullhorn"></i>
          </div>
          <h3>Avisos & Comunicados</h3>
          <p>Comunicados importantes para passageiros</p>
        </div>
        
        <div class="card feature-card" onclick="verRotaPassageiro()">
          <div class="feature-icon">
            <i class="fas fa-route"></i>
          </div>
          <h3>Ver Rota do Motorista</h3>
          <p>Verifique a localização em tempo real</p>
        </div>
        
        <div class="card feature-card" onclick="openFeedback()">
          <div class="feature-icon">
            <i class="fas fa-comment"></i>
          </div>
          <h3>Feedback</h3>
          <p>Sugestões e reclamações</p>
        </div>
        
        <div class="card feature-card" onclick="openSupport()">
          <div class="feature-icon">
            <i class="fas fa-headset"></i>
          </div>
          <h3>Suporte</h3>
          <p>Contato com nossa equipe</p>
        </div>
        
        <div class="card feature-card" onclick="verClima()">
          <div class="feature-icon">
            <i class="fas fa-cloud-sun"></i>
          </div>
          <h3>Clima Atual</h3>
          <p>Condições climáticas na rota</p>
        </div>
      </div>
      
      <div style="margin-top: 24px;">
        <button class="btn secondary" onclick="backToWelcome()">
          <i class="fas fa-arrow-left"></i> Voltar
        </button>
      </div>
    </section>
  `;
}

function showAdminLogin() {
  const container = document.getElementById('app-container');
  container.innerHTML = `
    <section class="login-section">
      <h2><i class="fas fa-user-shield"></i> Acesso Administrador</h2>
      
      <div class="card">
        <div class="form-group">
          <label for="adminLogin"><i class="fas fa-user"></i> Login</label>
          <input type="text" id="adminLogin" placeholder="Digite seu login" />
        </div>
        
        <div class="form-group">
          <label for="adminSenha"><i class="fas fa-lock"></i> Senha</label>
          <input type="password" id="adminSenha" placeholder="Digite sua senha" />
        </div>
        
        <button class="btn" onclick="loginAdmin()">
          <i class="fas fa-sign-in-alt"></i> Acessar como Admin
        </button>
        
        <button class="btn secondary" onclick="backToWelcome()">
          <i class="fas fa-arrow-left"></i> Voltar
        </button>
      </div>
    </section>
  `;
}

function loginAdmin() {
  const login = document.getElementById('adminLogin').value;
  const senha = document.getElementById('adminSenha').value;
  
  if (login === 'Admin' && senha === '050370') {
    currentUser = { type: 'admin' };
    localStorage.setItem('ac_user', JSON.stringify(currentUser));
    showAdminScreen();
  } else {
    showMessage('Login ou senha incorretos!', 'error');
  }
}

function checkAuthState() {
  const savedUser = localStorage.getItem('ac_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    switch(currentUser.type) {
      case 'motorista':
        startLocationTracking();
        showMotoristaScreen();
        break;
      case 'passageiro':
        showPassageiroScreen();
        break;
      case 'admin':
        showAdminScreen();
        break;
    }
  }
}

function backToWelcome() {
  localStorage.removeItem('ac_user');
  currentUser = null;
  currentUserType = null;
  
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  
  const container = document.getElementById('app-container');
  container.innerHTML = document.querySelector('#welcome').outerHTML;
}

// ========== TELA DO MOTORISTA ==========
function showMotoristaScreen() {
  const container = document.getElementById('app-container');
  container.innerHTML = `
    <section id="motoristaMenu">
      <div class="user-header">
        <div class="user-info">
          <h2><i class="fas fa-bus"></i> Motorista</h2>
          <p>${currentUser.matricula} • ${currentUser.placa}</p>
          <small>Rota: ${getRotaNome(currentUser.rota)}</small>
        </div>
        <div class="location-status" id="locationStatus">
          <i class="fas fa-circle"></i> Localização ativa
        </div>
      </div>
      
      <div class="grid-container">
        <div class="card feature-card" onclick="openControleVeiculo()">
          <div class="feature-icon emergency">
            <i class="fas fa-clipboard-check"></i>
          </div>
          <h3>Controle de Veículo</h3>
          <p>Preencher entrada/saída</p>
        </div>
        
        <div class="card feature-card" onclick="openAvisos('motorista')">
          <div class="feature-icon">
            <i class="fas fa-bullhorn"></i>
          </div>
          <h3>Avisos & Comunicados</h3>
          <p>Comunicados importantes</p>
        </div>
        
        <div class="card feature-card" onclick="openRotaMotorista()">
          <div class="feature-icon">
            <i class="fas fa-map-marked-alt"></i>
          </div>
          <h3>Minha Rota</h3>
          <p>Abrir e compartilhar rota</p>
        </div>
        
        <div class="card feature-card" onclick="openAjuda()">
          <div class="feature-icon">
            <i class="fas fa-question-circle"></i>
          </div>
          <h3>Ajuda & Suporte</h3>
          <p>Instruções e contatos</p>
        </div>
        
        <div class="card feature-card" onclick="verEscala()">
          <div class="feature-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <h3>Minha Escala</h3>
          <p>Ver escala de trabalho</p>
        </div>
        
        <div class="card feature-card" onclick="verClima()">
          <div class="feature-icon">
            <i class="fas fa-cloud-sun"></i>
          </div>
          <h3>Clima Atual</h3>
          <p>Condições climáticas</p>
        </div>
        
        <div class="card feature-card" onclick="openFeedback()">
          <div class="feature-icon">
            <i class="fas fa-comment"></i>
          </div>
          <h3>Feedback</h3>
          <p>Sugestões e reclamações</p>
        </div>
        
        <div class="card feature-card emergency" onclick="openEmergencia()">
          <div class="feature-icon emergency">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>EMERGÊNCIA</h3>
          <p>Botão de pânico</p>
        </div>
      </div>
      
      <div class="bottom-actions">
        <button class="btn secondary" onclick="logout()">
          <i class="fas fa-sign-out-alt"></i> Sair
        </button>
      </div>
    </section>
  `;
}

// ========== LOCALIZAÇÃO EM TEMPO REAL ==========
function startLocationTracking() {
  if (!navigator.geolocation || !currentUser) return;
  
  // Enviar localização inicial
  navigator.geolocation.getCurrentPosition(sendLocationToServer);
  
  // Iniciar tracking contínuo
  watchId = navigator.geolocation.watchPosition(
    sendLocationToServer,
    (error) => {
      console.error('Erro na localização:', error);
      updateLocationStatus(false);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000
    }
  );
  
  updateLocationStatus(true);
}

async function sendLocationToServer(position) {
  if (!currentUser || currentUser.type !== 'motorista') return;
  
  const locationData = {
    matricula: currentUser.matricula,
    placa: currentUser.placa,
    rota: currentUser.rota,
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: new Date().toISOString(),
    speed: position.coords.speed || 0
  };
  
  // Atualizar localização atual
  currentUser.location = {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  };
  
  try {
    // Salvar no Firestore
    await db.collection('locations').doc(currentUser.matricula).set(locationData);
    
    // Verificar geofencing
    checkGeofencing(position.coords);
    
    console.log('Localização enviada:', locationData);
  } catch (error) {
    console.error('Erro ao salvar localização:', error);
  }
}

function updateLocationStatus(active) {
  const statusElement = document.getElementById('locationStatus');
  if (statusElement) {
    if (active) {
      statusElement.innerHTML = '<i class="fas fa-circle" style="color: #4CAF50;"></i> Localização ativa';
    } else {
      statusElement.innerHTML = '<i class="fas fa-circle" style="color: #f44336;"></i> Localização inativa';
    }
  }
}

// ========== GEOFENCING ==========
async function checkGeofencing(coords) {
  // Aqui você implementaria a lógica para verificar se o motorista está na rota correta
  // Compararia as coordenadas atuais com as coordenadas esperadas da rota
  
  const desvio = await verificarDesvioRota(coords, currentUser.rota);
  
  if (desvio) {
    // Enviar alerta para administrador
    db.collection('alerts').add({
      type: 'desvio_rota',
      matricula: currentUser.matricula,
      placa: currentUser.placa,
      rota: currentUser.rota,
      location: {
        lat: coords.latitude,
        lng: coords.longitude
      },
      timestamp: new Date().toISOString(),
      resolved: false
    });
  }
}

async function verificarDesvioRota(coords, rotaId) {
  // Implementar lógica de verificação de rota
  // Por enquanto, retorna falso
  return false;
}

// ========== TELA DO ADMINISTRADOR ==========
function showAdminScreen() {
  const container = document.getElementById('app-container');
  container.innerHTML = `
    <section id="adminMenu">
      <h2><i class="fas fa-user-shield"></i> Painel Administrativo</h2>
      
      <div class="grid-container">
        <div class="card feature-card" onclick="verControlesVeiculo()">
          <div class="feature-icon">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <h3>Controles de Veículo</h3>
          <p>Verificar formulários preenchidos</p>
        </div>
        
        <div class="card feature-card" onclick="gerarNotificacao()">
          <div class="feature-icon">
            <i class="fas fa-bell"></i>
          </div>
          <h3>Notificar App</h3>
          <p>Enviar notificação push</p>
        </div>
        
        <div class="card feature-card" onclick="gerarAvisos('motorista')">
          <div class="feature-icon">
            <i class="fas fa-edit"></i>
          </div>
          <h3>Avisos Motoristas</h3>
          <p>Editor de avisos Rich Text</p>
        </div>
        
        <div class="card feature-card" onclick="gerarAvisos('passageiro')">
          <div class="feature-icon">
            <i class="fas fa-edit"></i>
          </div>
          <h3>Avisos Passageiros</h3>
          <p>Editor de avisos Rich Text</p>
        </div>
        
        <div class="card feature-card" onclick="verEmergencias()">
          <div class="feature-icon emergency">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Ver Emergências</h3>
          <p>Solicitações de emergência</p>
        </div>
        
        <div class="card feature-card" onclick="gerenciarEscalas()">
          <div class="feature-icon">
            <i class="fas fa-calendar-plus"></i>
          </div>
          <h3>Gerenciar Escalas</h3>
          <p>Alterar escala dos motoristas</p>
        </div>
        
        <div class="card feature-card" onclick="verLocalizacoes()">
          <div class="feature-icon">
            <i class="fas fa-map-marker-alt"></i>
          </div>
          <h3>Localizações em Tempo Real</h3>
          <p>Monitorar motoristas</p>
        </div>
        
        <div class="card feature-card" onclick="verFeedbacks()">
          <div class="feature-icon">
            <i class="fas fa-comments"></i>
          </div>
          <h3>Ver Feedbacks</h3>
          <p>Sugestões e reclamações</p>
        </div>
      </div>
      
      <div class="bottom-actions">
        <button class="btn secondary" onclick="logout()">
          <i class="fas fa-sign-out-alt"></i> Sair
        </button>
      </div>
    </section>
  `;
}

// ========== EDITOR DE AVISOS RICH TEXT ==========
function gerarAvisos(tipo) {
  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = `
    <h3>Editor de Avisos - ${tipo === 'motorista' ? 'Motoristas' : 'Passageiros'}</h3>
    
    <div class="editor-toolbar">
      <button type="button" onclick="formatText('bold')"><i class="fas fa-bold"></i></button>
      <button type="button" onclick="formatText('italic')"><i class="fas fa-italic"></i></button>
      <button type="button" onclick="formatText('underline')"><i class="fas fa-underline"></i></button>
      <button type="button" onclick="formatText('insertUnorderedList')"><i class="fas fa-list-ul"></i></button>
      <button type="button" onclick="formatText('insertOrderedList')"><i class="fas fa-list-ol"></i></button>
    </div>
    
    <div 
      id="editor" 
      contenteditable="true" 
      class="editor-content"
      placeholder="Digite seu aviso aqui..."
    ></div>
    
    <div class="form-group">
      <label for="avisosPrioridade">Prioridade:</label>
      <select id="avisosPrioridade">
        <option value="normal">Normal</option>
        <option value="alta">Alta</option>
        <option value="urgente">Urgente</option>
      </select>
    </div>
    
    <div class="form-group">
      <label for="avisosValidade">Validade (dias):</label>
      <input type="number" id="avisosValidade" value="7" min="1" max="30">
    </div>
    
    <button class="btn" onclick="salvarAviso('${tipo}')">
      <i class="fas fa-save"></i> Publicar Aviso
    </button>
    
    <button class="btn secondary" onclick="closeModal()">
      <i class="fas fa-times"></i> Cancelar
    </button>
  `;
  
  openModal();
}

function formatText(command) {
  document.execCommand(command, false, null);
  document.getElementById('editor').focus();
}

async function salvarAviso(tipo) {
  const content = document.getElementById('editor').innerHTML;
  const prioridade = document.getElementById('avisosPrioridade').value;
  const validade = parseInt(document.getElementById('avisosValidade').value);
  
  if (!content.trim()) {
    showMessage('Digite o conteúdo do aviso!', 'error');
    return;
  }
  
  try {
    await db.collection('avisos').add({
      tipo: tipo,
      conteudo: content,
      prioridade: prioridade,
      validadeDias: validade,
      dataPublicacao: new Date().toISOString(),
      publicadoPor: 'admin'
    });
    
    // Enviar notificação push
    sendNotification(`Novo aviso para ${tipo}`, 'Clique para ver os detalhes', tipo);
    
    showMessage('Aviso publicado com sucesso!', 'success');
    closeModal();
  } catch (error) {
    showMessage('Erro ao salvar aviso: ' + error.message, 'error');
  }
}

// ========== CLIMA ==========
async function verClima() {
  if (!navigator.geolocation) {
    showMessage('Seu navegador não suporta geolocalização', 'error');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=d695613e30d7ae87a2254c7eeb373b66&units=metric&lang=pt_br`
      );
      
      if (!response.ok) throw new Error('Erro ao buscar clima');
      
      const data = await response.json();
      
      const modalContent = document.getElementById('modalContent');
      modalContent.innerHTML = `
        <h3><i class="fas fa-cloud-sun"></i> Clima Atual</h3>
        
        <div class="weather-card">
          <div class="weather-main">
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" 
                 alt="${data.weather[0].description}" />
            <div>
              <h4>${Math.round(data.main.temp)}°C</h4>
              <p>${capitalizeFirstLetter(data.weather[0].description)}</p>
            </div>
          </div>
          
          <div class="weather-details">
            <div class="weather-item">
              <i class="fas fa-temperature-high"></i>
              <span>Sensação: ${Math.round(data.main.feels_like)}°C</span>
            </div>
            
            <div class="weather-item">
              <i class="fas fa-tint"></i>
              <span>Umidade: ${data.main.humidity}%</span>
            </div>
            
            <div class="weather-item">
              <i class="fas fa-wind"></i>
              <span>Vento: ${Math.round(data.wind.speed * 3.6)} km/h</span>
            </div>
            
            <div class="weather-item">
              <i class="fas fa-compress-alt"></i>
              <span>Pressão: ${data.main.pressure} hPa</span>
            </div>
          </div>
          
          <div class="weather-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${data.name}, ${data.sys.country}</span>
          </div>
        </div>
        
        <button class="btn" onclick="closeModal()">
          <i class="fas fa-check"></i> OK
        </button>
      `;
      
      openModal();
    } catch (error) {
      showMessage('Não foi possível obter dados do clima', 'error');
    }
  }, (error) => {
    showMessage('Permissão de localização necessária', 'error');
  });
}

// ========== BOTÃO DE EMERGÊNCIA ==========
function openEmergencia() {
  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = `
    <h3 class="emergency"><i class="fas fa-exclamation-triangle"></i> Botão de Emergência</h3>
    
    <div class="emergency-options">
      <button class="btn emergency" onclick="enviarEmergencia('avaria')">
        <i class="fas fa-car-crash"></i> Avaria no Veículo
      </button>
      
      <button class="btn emergency" onclick="enviarEmergencia('acidente')">
        <i class="fas fa-ambulance"></i> Acidente
      </button>
      
      <button class="btn emergency" onclick="enviarEmergencia('assalto')">
        <i class="fas fa-shield-alt"></i> Situação de Risco
      </button>
      
      <button class="btn emergency" onclick="enviarEmergencia('passageiro')">
        <i class="fas fa-user-injured"></i> Problema com Passageiro
      </button>
      
      <button class="btn emergency" onclick="enviarEmergencia('outro')">
        <i class="fas fa-exclamation-circle"></i> Outra Emergência
      </button>
    </div>
    
    <div class="emergency-note">
      <p><i class="fas fa-info-circle"></i> Ao acionar, nossa equipe será notificada imediatamente.</p>
      <p><strong>Contato de emergência: +55 93 9205-9914</strong></p>
    </div>
    
    <button class="btn secondary" onclick="closeModal()">
      <i class="fas fa-times"></i> Cancelar
    </button>
  `;
  
  openModal();
}

async function enviarEmergencia(tipo) {
  if (!navigator.geolocation) {
    showMessage('Localização necessária para emergência', 'error');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      await db.collection('emergencias').add({
        matricula: currentUser.matricula,
        placa: currentUser.placa,
        tipo: tipo,
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        timestamp: new Date().toISOString(),
        status: 'pendente',
        atendidaPor: null
      });
      
      // Enviar notificação para administradores
      sendNotification('EMERGÊNCIA ACIONADA', `Motorista ${currentUser.matricula} acionou emergência`, 'admin');
      
      // Enviar WhatsApp
      const message = `🚨 EMERGÊNCIA ACIONADA 🚨%0A%0AMotorista: ${currentUser.matricula}%0APlaca: ${currentUser.placa}%0ATipo: ${tipo}%0ALocalização: https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
      window.open(`https://wa.me/559392059914?text=${message}`, '_blank');
      
      showMessage('Emergência enviada! Nossa equipe foi notificada.', 'success');
      closeModal();
    } catch (error) {
      showMessage('Erro ao enviar emergência', 'error');
    }
  });
}

// ========== FEEDBACK ==========
function openFeedback() {
  const modalContent = document.getElementById('modalContent');
  const userType = currentUser ? currentUser.type : 'passageiro';
  
  modalContent.innerHTML = `
    <h3><i class="fas fa-comment"></i> Enviar Feedback</h3>
    
    <div class="form-group">
      <label for="feedbackTipo">Tipo:</label>
      <select id="feedbackTipo">
        <option value="sugestao">Sugestão</option>
        <option value="reclamacao">Reclamação</option>
        <option value="elogio">Elogio</option>
        <option value="melhoria">Melhoria</option>
      </select>
    </div>
    
    <div class="form-group">
      <label for="feedbackAssunto">Assunto:</label>
      <input type="text" id="feedbackAssunto" placeholder="Digite o assunto">
    </div>
    
    <div class="form-group">
      <label for="feedbackMensagem">Mensagem:</label>
      <textarea id="feedbackMensagem" rows="5" placeholder="Descreva seu feedback..."></textarea>
    </div>
    
    <div class="form-group">
      <label for="feedbackAnonimo">
        <input type="checkbox" id="feedbackAnonimo"> Enviar anonimamente
      </label>
    </div>
    
    <button class="btn" onclick="enviarFeedback('${userType}')">
      <i class="fas fa-paper-plane"></i> Enviar Feedback
    </button>
    
    <button class="btn secondary" onclick="closeModal()">
      <i class="fas fa-times"></i> Cancelar
    </button>
  `;
  
  openModal();
}

async function enviarFeedback(userType) {
  const tipo = document.getElementById('feedbackTipo').value;
  const assunto = document.getElementById('feedbackAssunto').value;
  const mensagem = document.getElementById('feedbackMensagem').value;
  const anonimo = document.getElementById('feedbackAnonimo').checked;
  
  if (!assunto.trim() || !mensagem.trim()) {
    showMessage('Preencha assunto e mensagem!', 'error');
    return;
  }
  
  try {
    const feedbackData = {
      tipo: tipo,
      assunto: assunto,
      mensagem: mensagem,
      userType: userType,
      timestamp: new Date().toISOString(),
      status: 'novo'
    };
    
    if (!anonimo && currentUser) {
      if (currentUser.type === 'motorista') {
        feedbackData.matricula = currentUser.matricula;
        feedbackData.placa = currentUser.placa;
      }
    }
    
    await db.collection('feedbacks').add(feedbackData);
    
    showMessage('Feedback enviado com sucesso!', 'success');
    closeModal();
  } catch (error) {
    showMessage('Erro ao enviar feedback', 'error');
  }
}

// ========== SUPPORT/WHATSAPP ==========
function openSupport() {
  const message = `Olá, preciso de suporte no Portal de Transporte da AC Parceria.`;
  window.open(`https://wa.me/559392059914?text=${encodeURIComponent(message)}`, '_blank');
}

// ========== FUNÇÕES AUXILIARES ==========
function getRotaNome(rotaId) {
  const rotas = {
    'adm01': 'ROTA ADM 01',
    'adm02': 'ROTA ADM 02',
    'rota01': 'ROTA 01',
    'rota02': 'ROTA 02',
    'rota03': 'ROTA 03',
    'rota04': 'ROTA 04',
    'rota05': 'ROTA 05',
    'retorno01': 'RETORNO OVERLAND - ROTA 01',
    'retorno02': 'RETORNO OVERLAND - ROTA 02'
  };
  
  return rotas[rotaId] || rotaId;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function showMessage(message, type = 'info') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message-toast ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  if (type === 'success') {
    messageDiv.style.backgroundColor = '#4CAF50';
  } else if (type === 'error') {
    messageDiv.style.backgroundColor = '#f44336';
  } else {
    messageDiv.style.backgroundColor = '#2196F3';
  }
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(messageDiv);
    }, 300);
  }, 3000);
}

function logout() {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  
  localStorage.removeItem('ac_user');
  currentUser = null;
  
  const container = document.getElementById('app-container');
  container.innerHTML = document.querySelector('#welcome').outerHTML;
}

// ========== MANTER FUNÇÕES EXISTENTES ==========
// (Manter todas as funções do código original que não foram substituídas)

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registrado com sucesso: ', registration.scope);
      })
      .catch(error => {
        console.log('Falha ao registrar ServiceWorker: ', error);
      });
  });
}

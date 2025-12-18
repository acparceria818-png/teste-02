// app.js - CÓDIGO COMPLETO COM TODAS AS FUNCIONALIDADES
import { 
  db,
  auth,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  getColaborador,
  getColaboradorByEmail,
  updateLocalizacao,
  registrarEmergencia,
  registrarFeedback,
  registrarAviso,
  monitorarRotas,
  monitorarEmergencias,
  monitorarFeedbacks,
  monitorarAvisos,
  getFormsControleVeiculos,
  loginEmailSenha,
  signOut,
  getAvisos,
  updateAviso,
  deleteAviso,
  getEscalas,
  addEscala,
  updateEscala,
  deleteEscala
} from './firebase.js';

// Estado global
let estadoApp = {
  motorista: null,
  passageiro: null,
  admin: null,
  rotaAtiva: null,
  onibusAtivo: null,
  watchId: null,
  isOnline: navigator.onLine,
  perfil: null,
  unsubscribeRotas: null,
  unsubscribeEmergencias: null,
  unsubscribeFeedbacks: null,
  unsubscribeAvisos: null,
  emergenciaAtiva: false,
  avisosAtivos: [],
  escalas: []
};

// Dados de ônibus disponíveis (ATUALIZADO)
const ONIBUS_DISPONIVEIS = [
  { placa: 'TEZ-2J56', tag_ac: 'AC LO 583', tag_vale: '1JI347', cor: 'BRANCA', empresa: 'MUNDIAL P E L DE BENS MOVEIS LTDA' },
  { placa: 'TEZ-2J60', tag_ac: 'AC LO 585', tag_vale: '1JI348', cor: 'BRANCA', empresa: 'MUNDIAL P E L DE BENS MOVEIS LTDA' },
  { placa: 'TEZ-2J57', tag_ac: 'AC LO 584', tag_vale: '1JI349', cor: 'BRANCA', empresa: 'MUNDIAL P E L DE BENS MOVEIS LTDA' },
  { placa: 'SJD5G38', tag_ac: 'AC LO 610', tag_vale: '1JI437', cor: 'BRANCA', empresa: 'MUNDIAL P E L DE BENS MOVEIS LTDA' },
  { placa: 'SYA5A51', tag_ac: 'AC LO 611', tag_vale: '1JI436', cor: 'BRANCA', empresa: 'MUNDIAL P E L DE BENS MOVEIS LTDA' },
  { placa: 'TEZ2J58', tag_ac: 'AC LO 609', tag_vale: '1JI420', cor: 'BRANCA', empresa: 'MUNDIAL P E L DE BENS MOVEIS LTDA' },
  { placa: 'PZS6858', tag_ac: 'VL 080', tag_vale: '-', cor: 'BRANCA', empresa: 'A C PARCERIA E TERRAPLENAGEM LTDA' },
  { placa: 'PZW5819', tag_ac: 'VL 083', tag_vale: '-', cor: 'BRANCA', empresa: 'A C PARCERIA E TERRAPLENAGEM LTDA' }
];

// Rotas disponíveis
const ROTAS_DISPONIVEIS = [
  { id: 'adm01', nome: 'ROTA ADM 01', tipo: 'adm', desc: 'Rota administrativa 01', mapsUrl: 'https://www.google.com/maps/d/u/1/edit?mid=18BCgBpobp1Olzmzy0RnPCUEd7Vnkc5s&usp=sharing' },
  { id: 'adm02', nome: 'ROTA ADM 02', tipo: 'adm', desc: 'Rota administrativa 02', mapsUrl: 'https://www.google.com/maps/d/u/1/edit?mid=1WxbIX8nw0xyGBLMvvi1SF3DRuwmZ5oM&usp=sharing' },
  { id: 'op01', nome: 'ROTA 01', tipo: 'operacional', desc: 'Rota operacional 01', mapsUrl: 'https://www.google.com/maps/d/u/1/edit?mid=1jCfFxq1ZwecS2IcHy7xGFLLgttsM-RQ&usp=sharing' },
  { id: 'op02', nome: 'ROTA 02', tipo: 'operacional', desc: 'Rota operacional 02', mapsUrl: 'https://www.google.com/maps/d/u/1/edit?mid=1LCvNJxWBbZ_chpbdn_lk_Dm6NPA194g&usp=sharing' },
  { id: 'op03', nome: 'ROTA 03', tipo: 'operacional', desc: 'Rota operacional 03', mapsUrl: 'https://www.google.com/maps/d/u/1/edit?mid=1bdwkrClh5AZml0mnDGlOzYcaR4w1BL0&usp=sharing' },
  { id: 'op04', nome: 'ROTA 04', tipo: 'operacional', desc: 'Rota operacional 04', mapsUrl: 'https://www.google.com/maps/d/u/1/edit?mid=1ejibzdZkhX2QLnP9YgvvHdQpZELFvXo&usp=sharing' },
  { id: 'op05', nome: 'ROTA 05', tipo: 'operacional', desc: 'Rota operacional 05', mapsUrl: 'https://www.google.com/maps/d/u/1/edit?mid=1L9xjAWFUupMc7eQbqVJz-SNWlYX5SHo&usp=sharing' },
  { id: 'ret01', nome: 'RETORNO OVERLAND - ROTA 01', tipo: 'retorno', desc: 'Rota de retorno Overland 01', mapsUrl: 'https://www.google.com/maps/d/u/1/edit?mid=1ClQVIaRLOYYWHU7fvP87r1BVy85a_eg&usp=sharing' },
  { id: 'ret02', nome: 'RETORNO OVERLAND - ROTA 02', tipo: 'retorno', desc: 'Rota de retorno Overland 02', mapsUrl: 'https://www.google.com/maps/d/u/1/edit?mid=1WOIMgeLgV01B8yk7HoX6tazdCHXQnok&usp=sharing' }
];

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 AC Transporte Portal - Inicializando...');
  
  // Verificar sessão existente
  verificarSessao();
  
  // Inicializar funcionalidades
  initDarkMode();
  initPWA();
  initEventListeners();
  initConnectionMonitor();
  initAvisos();
  
  // Iniciar clima (com fallback)
  buscarClimaAtual();
  
  console.log('✅ Aplicativo inicializado com sucesso');
});

// ========== GERENCIAMENTO DE SESSÃO ==========
function verificarSessao() {
  const perfil = localStorage.getItem('perfil_ativo');
  const matricula = localStorage.getItem('motorista_matricula');
  const nome = localStorage.getItem('motorista_nome');
  const adminLogado = localStorage.getItem('admin_logado');
  
  if (perfil === 'motorista' && matricula && nome) {
    estadoApp.motorista = { matricula, nome };
    estadoApp.perfil = 'motorista';
    mostrarTela('tela-motorista');
    updateUserStatus(nome, matricula);
    iniciarMonitoramentoAvisos();
    
    // Carregar ônibus salvo
    const onibusSalvo = localStorage.getItem('onibus_ativo');
    if (onibusSalvo) {
      estadoApp.onibusAtivo = JSON.parse(onibusSalvo);
    }
  } else if (perfil === 'passageiro') {
    estadoApp.perfil = 'passageiro';
    mostrarTela('tela-passageiro');
    iniciarMonitoramentoPassageiro();
    iniciarMonitoramentoAvisos();
  } else if (perfil === 'admin' && adminLogado) {
    estadoApp.perfil = 'admin';
    estadoApp.admin = { 
      nome: 'Administrador',
      email: localStorage.getItem('admin_email')
    };
    mostrarTela('tela-admin-dashboard');
    iniciarMonitoramentoAdmin();
    carregarEscalas();
  }
}

function updateUserStatus(nome, matricula) {
  const userStatus = document.getElementById('userStatus');
  const userName = document.getElementById('userName');
  const motoristaNome = document.getElementById('motoristaNome');
  const motoristaMatricula = document.getElementById('motoristaMatricula');
  
  if (userStatus) userStatus.style.display = 'flex';
  if (userName) userName.textContent = nome;
  if (motoristaNome) motoristaNome.textContent = nome;
  if (motoristaMatricula) motoristaMatricula.textContent = matricula;
}

// ========== SELEÇÃO DE PERFIL ==========
window.entrarNoPortal = function () {
  mostrarTela('telaEscolhaPerfil');
};

window.selecionarPerfil = function (perfil) {
  console.log('👤 Perfil selecionado:', perfil);
  estadoApp.perfil = perfil;
  localStorage.setItem('perfil_ativo', perfil);

  if (perfil === 'motorista') {
    mostrarTela('tela-motorista-login');
  } else if (perfil === 'passageiro') {
    estadoApp.passageiro = { nome: 'Passageiro' };
    mostrarTela('tela-passageiro');
    iniciarMonitoramentoPassageiro();
    iniciarMonitoramentoAvisos();
  } else if (perfil === 'admin') {
    mostrarTela('tela-admin-login');
  }
};

// ========== LOGIN MOTORISTA ==========
window.confirmarMatriculaMotorista = async function () {
  showLoading('🔍 Validando matrícula...');
  
  const input = document.getElementById('matriculaMotorista');
  const loginBtn = document.getElementById('loginBtn');
  
  if (!input) {
    alert('Campo de matrícula não encontrado');
    hideLoading();
    return;
  }

  const matricula = input.value.trim().toUpperCase();

  if (!matricula) {
    alert('Informe sua matrícula');
    input.focus();
    hideLoading();
    return;
  }

  try {
    loginBtn.disabled = true;
    loginBtn.textContent = 'Validando...';
    
    const snap = await getColaborador(matricula);

    if (!snap.exists()) {
      alert('❌ Matrícula não encontrada');
      input.focus();
      return;
    }

    const dados = snap.data();

    if (!dados.ativo) {
      alert('❌ Colaborador inativo. Contate a administração.');
      return;
    }

    if (dados.perfil !== 'motorista') {
      alert('❌ Este acesso é exclusivo para motoristas');
      return;
    }

    localStorage.setItem('motorista_matricula', matricula);
    localStorage.setItem('motorista_nome', dados.nome);
    localStorage.setItem('motorista_email', dados.email || '');
    localStorage.setItem('perfil_ativo', 'motorista');
    
    estadoApp.motorista = { 
      matricula, 
      nome: dados.nome,
      email: dados.email || ''
    };
    
    carregarOnibus();
    console.log('✅ Motorista autenticado:', dados.nome);

  } catch (erro) {
    console.error('Erro Firebase:', erro);
    alert('❌ Erro ao validar matrícula. Verifique sua conexão e tente novamente.');
  } finally {
    hideLoading();
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Entrar';
    }
  }
};

// ========== CARREGAR ÔNIBUS ==========
function carregarOnibus() {
  const container = document.getElementById('onibusList');
  if (!container) return;
  
  container.innerHTML = ONIBUS_DISPONIVEIS.map(onibus => `
    <div class="onibus-card" onclick="selecionarOnibus('${onibus.placa}')">
      <div class="onibus-icon">
        <i class="fas fa-bus"></i>
      </div>
      <div class="onibus-info">
        <h4>${onibus.placa}</h4>
        <p><strong>TAG AC:</strong> ${onibus.tag_ac}</p>
        <p><strong>TAG VALE:</strong> ${onibus.tag_vale}</p>
        <small><i class="fas fa-paint-brush"></i> ${onibus.cor}</small>
      </div>
      <div class="onibus-select">
        <i class="fas fa-chevron-right"></i>
      </div>
    </div>
  `).join('');
  
  mostrarTela('tela-selecao-onibus');
}

// ========== SELEÇÃO DE ÔNIBUS ==========
window.selecionarOnibus = function(placa) {
  const onibus = ONIBUS_DISPONIVEIS.find(o => o.placa === placa);
  if (!onibus) {
    alert('Ônibus não encontrado');
    return;
  }
  
  estadoApp.onibusAtivo = onibus;
  localStorage.setItem('onibus_ativo', JSON.stringify(onibus));
  
  // Solicitar permissão de localização
  solicitarPermissaoLocalizacao();
};

function solicitarPermissaoLocalizacao() {
  console.log('📍 Iniciando solicitação de localização...');
  
  if (!navigator.geolocation) {
    console.warn('❌ Geolocation não suportada');
    finalizarLoginSemGPS();
    return;
  }
  
  showLoading('📍 Obtendo localização...');
  
  const options = {
    enableHighAccuracy: false,
    timeout: 8000,
    maximumAge: 30000
  };
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('✅ GPS obtido no login');
      hideLoading();
      finalizarLoginComGPS(position);
    },
    (error) => {
      console.warn('⚠️ GPS falhou no login:', error.message);
      hideLoading();
      
      alert('📍 Localização não disponível no momento.\n\nO login será realizado normalmente. Você pode ativar o GPS depois.');
      
      finalizarLoginSemGPS();
    },
    options
  );
  
  function finalizarLoginComGPS(position) {
    if (!estadoApp.motorista || !estadoApp.onibusAtivo) return;
    
    updateUserStatus(estadoApp.motorista.nome, estadoApp.motorista.matricula);
    
    const onibusElement = document.getElementById('motoristaOnibus');
    if (onibusElement) {
      onibusElement.textContent = `${estadoApp.onibusAtivo.placa} (${estadoApp.onibusAtivo.tag_ac})`;
    }
    
    mostrarTela('tela-motorista');
    iniciarMonitoramentoAvisos();
    
    alert(`✅ Login realizado!\n\n👋 ${estadoApp.motorista.nome}\n🚌 ${estadoApp.onibusAtivo.placa}\n📍 GPS ativo`);
  }
  
  function finalizarLoginSemGPS() {
    if (!estadoApp.motorista || !estadoApp.onibusAtivo) return;
    
    updateUserStatus(estadoApp.motorista.nome, estadoApp.motorista.matricula);
    
    const onibusElement = document.getElementById('motoristaOnibus');
    if (onibusElement) {
      onibusElement.textContent = `${estadoApp.onibusAtivo.placa} (${estadoApp.onibusAtivo.tag_ac})`;
    }
    
    mostrarTela('tela-motorista');
    iniciarMonitoramentoAvisos();
    
    alert(`✅ Login realizado!\n\n👋 ${estadoApp.motorista.nome}\n🚌 ${estadoApp.onibusAtivo.placa}\n📍 GPS desativado`);
  }
}

// ========== LOGIN ADMIN ==========
window.loginAdmin = async function () {
  const email = document.getElementById('adminEmail').value;
  const senha = document.getElementById('adminSenha').value;
  
  if (!email || !senha) {
    alert('Preencha e-mail e senha');
    return;
  }
  
  const ADMIN_CREDENTIALS = {
    email: 'admin@acparceria.com',
    senha: '050370'
  };
  
  if (email === ADMIN_CREDENTIALS.email && senha === ADMIN_CREDENTIALS.senha) {
    localStorage.setItem('admin_logado', 'true');
    localStorage.setItem('admin_email', email);
    localStorage.setItem('perfil_ativo', 'admin');
    
    estadoApp.admin = { email, nome: 'Administrador' };
    
    mostrarTela('tela-admin-dashboard');
    iniciarMonitoramentoAdmin();
    iniciarMonitoramentoEmergencias();
    iniciarMonitoramentoFeedbacks();
    iniciarMonitoramentoAvisos();
    carregarEscalas();
    
    console.log('✅ Admin logado com sucesso');
  } else {
    alert('❌ Credenciais inválidas');
  }
};

// ========== LOGOUT ==========
window.logout = function () {
  if (estadoApp.watchId) {
    navigator.geolocation.clearWatch(estadoApp.watchId);
    estadoApp.watchId = null;
  }
  
  if (estadoApp.unsubscribeRotas) estadoApp.unsubscribeRotas();
  if (estadoApp.unsubscribeEmergencias) estadoApp.unsubscribeEmergencias();
  if (estadoApp.unsubscribeFeedbacks) estadoApp.unsubscribeFeedbacks();
  if (estadoApp.unsubscribeAvisos) estadoApp.unsubscribeAvisos();
  
  estadoApp = {
    motorista: null,
    passageiro: null,
    admin: null,
    rotaAtiva: null,
    onibusAtivo: null,
    watchId: null,
    isOnline: navigator.onLine,
    perfil: null,
    unsubscribeRotas: null,
    unsubscribeEmergencias: null,
    unsubscribeFeedbacks: null,
    unsubscribeAvisos: null,
    emergenciaAtiva: false,
    avisosAtivos: [],
    escalas: []
  };
  
  localStorage.removeItem('perfil_ativo');
  localStorage.removeItem('motorista_matricula');
  localStorage.removeItem('motorista_nome');
  localStorage.removeItem('motorista_email');
  localStorage.removeItem('onibus_ativo');
  localStorage.removeItem('admin_logado');
  localStorage.removeItem('admin_email');
  
  const userStatus = document.getElementById('userStatus');
  if (userStatus) userStatus.style.display = 'none';
  
  const pararRotaBtn = document.getElementById('pararRotaBtn');
  if (pararRotaBtn) pararRotaBtn.style.display = 'none';
  
  const rotaStatus = document.getElementById('rotaStatus');
  if (rotaStatus) rotaStatus.textContent = 'Nenhuma rota ativa';
  
  mostrarTela('welcome');
  
  console.log('👋 Usuário deslogado');
};

// ========== SISTEMA DE GPS INTELIGENTE ==========
async function obterLocalizacaoInteligente() {
  console.log('📍 Sistema GPS Inteligente iniciado...');
  
  return new Promise((resolve, reject) => {
    const tentativaRapida = {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 30000
    };
    
    let tentativaAtiva = true;
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!tentativaAtiva) return;
        tentativaAtiva = false;
        console.log('✅ GPS obtido rapidamente');
        resolve(pos);
      },
      async (err) => {
        if (!tentativaAtiva) return;
        
        console.log('⚠️ GPS rápido falhou, tentando modo preciso...');
        
        const tentativaPrecisa = {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0
        };
        
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!tentativaAtiva) return;
            tentativaAtiva = false;
            console.log('✅ GPS obtido em modo preciso');
            resolve(pos);
          },
          async (err2) => {
            if (!tentativaAtiva) return;
            
            console.log('⚠️ Ambas tentativas GPS falharam, usando fallback...');
            
            const localizacaoFallback = await obterLocalizacaoFallback();
            if (localizacaoFallback) {
              tentativaAtiva = false;
              resolve(localizacaoFallback);
            } else {
              reject(err2);
            }
          },
          tentativaPrecisa
        );
      },
      tentativaRapida
    );
    
    setTimeout(() => {
      if (tentativaAtiva) {
        tentativaAtiva = false;
        console.log('⏱️ Timeout global do GPS');
        reject(new Error('Timeout global do GPS'));
      }
    }, 20000);
  });
}

async function obterLocalizacaoFallback() {
  console.log('🔄 Usando fallback de localização...');
  
  try {
    const ipResponse = await fetch('https://ipapi.co/json/');
    if (ipResponse.ok) {
      const ipData = await ipResponse.json();
      console.log('📍 Localização via IP:', ipData.city, ipData.region);
      
      return {
        coords: {
          latitude: parseFloat(ipData.latitude),
          longitude: parseFloat(ipData.longitude),
          accuracy: 50000,
          speed: 0
        },
        timestamp: Date.now()
      };
    }
  } catch (error) {
    console.log('❌ Fallback IP falhou');
  }
  
  console.log('📍 Usando localização simulada padrão');
  const agora = new Date();
  const hora = agora.getHours();
  
  const basesSP = [
    { lat: -23.5505, lng: -46.6333, nome: 'Centro SP' },
    { lat: -23.9626, lng: -46.3889, nome: 'Santos' },
    { lat: -23.1899, lng: -45.8905, nome: 'São José Campos' },
    { lat: -22.9068, lng: -43.1729, nome: 'Rio de Janeiro' }
  ];
  
  const baseIndex = hora % basesSP.length;
  const base = basesSP[baseIndex];
  
  const variacao = 0.05;
  const lat = base.lat + (Math.random() * variacao * 2 - variacao);
  const lng = base.lng + (Math.random() * variacao * 2 - variacao);
  
  return {
    coords: {
      latitude: lat,
      longitude: lng,
      accuracy: 1000 + Math.random() * 2000,
      speed: 30 + Math.random() * 50
    },
    timestamp: Date.now()
  };
}

// ========== FUNÇÕES DE ROTA E LOCALIZAÇÃO ==========
window.iniciarRota = async function (nomeRota) {
  console.log(`🛣️ Iniciando rota: ${nomeRota}`);
  
  if (!estadoApp.motorista || !estadoApp.onibusAtivo) {
    alert('❌ Motorista ou ônibus não configurado. Faça login novamente.');
    mostrarTela('tela-motorista-login');
    return;
  }

  if (!confirm(`🚀 Iniciar Rota: ${nomeRota}\n\nÔnibus: ${estadoApp.onibusAtivo.placa}\n\nSua localização será compartilhada.`)) {
    return;
  }

  const btn = event?.target;
  const btnOriginalText = btn?.textContent || '▶️ Iniciar Rota';
  if (btn) {
    btn.classList.add('loading');
    btn.textContent = 'Obtendo localização...';
    btn.disabled = true;
  }

  try {
    let position;
    let usandoFallback = false;
    
    try {
      position = await obterLocalizacaoInteligente();
      console.log('📍 Localização obtida:', position.coords);
    } catch (erro) {
      console.warn('❌ GPS falhou, usando fallback:', erro);
      position = await obterLocalizacaoFallback();
      usandoFallback = true;
      console.log('📍 Localização fallback:', position.coords);
    }
    
    await enviarLocalizacao(nomeRota, position.coords);
    
    if (!usandoFallback && position.coords.accuracy < 10000) {
      estadoApp.watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          await enviarLocalizacao(nomeRota, pos.coords);
        },
        (erro) => {
          console.warn('⚠️ Erro no monitoramento GPS:', erro);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000
        }
      );
    } else {
      console.log('📍 Monitoramento contínuo não iniciado (fallback ou baixa precisão)');
    }
    
    estadoApp.rotaAtiva = nomeRota;
    
    const rotaStatus = document.getElementById('rotaStatus');
    if (rotaStatus) {
      rotaStatus.textContent = `📍 Rota ativa: ${nomeRota} ${usandoFallback ? '(Simulado)' : ''}`;
      if (usandoFallback) {
        rotaStatus.classList.add('simulada');
      }
    }
    
    const pararBtn = document.getElementById('pararRotaBtn');
    if (pararBtn) pararBtn.style.display = 'block';
    
    if (usandoFallback) {
      mostrarNotificacao('🎮 Rota Iniciada (Simulada)', 
        `Rota "${nomeRota}" iniciada com localização simulada para testes.`);
    } else {
      mostrarNotificacao('✅ Rota Iniciada', `Rota "${nomeRota}" iniciada com sucesso!`);
    }
    
    mostrarTela('tela-motorista');
    
    if (usandoFallback) {
      alert(`✅ Rota "${nomeRota}" iniciada com localização SIMULADA!\n\n📍 Para testes no computador\n🚌 Ônibus: ${estadoApp.onibusAtivo.placa}\n\nNo celular real, o GPS funcionará automaticamente.`);
    } else {
      alert(`✅ Rota "${nomeRota}" iniciada com sucesso!\n\n📍 Localização ativa\n🚌 Ônibus: ${estadoApp.onibusAtivo.placa}`);
    }

  } catch (erro) {
    console.error('❌ Erro ao iniciar rota:', erro);
    
    if (erro.code === 3 || erro.message.includes('Timeout')) {
      const usarSimulado = confirm(`⏱️ GPS demorando muito para responder.\n\nDeseja:\n• "OK" = Usar localização simulada para testes\n• "Cancelar" = Tentar novamente mais tarde`);
      
      if (usarSimulado) {
        setTimeout(() => window.iniciarRota(nomeRota), 100);
      }
    } else {
      alert(`❌ Não foi possível iniciar a rota:\n\n${erro.message || 'Erro desconhecido'}\n\nVerifique sua conexão e tente novamente.`);
    }
    
  } finally {
    if (btn) {
      btn.classList.remove('loading');
      btn.textContent = btnOriginalText;
      btn.disabled = false;
    }
  }
};

async function enviarLocalizacao(nomeRota, coords) {
  if (!estadoApp.motorista || !estadoApp.onibusAtivo) return;

  try {
    await updateLocalizacao(estadoApp.motorista.matricula, {
      motorista: estadoApp.motorista.nome,
      matricula: estadoApp.motorista.matricula,
      email: estadoApp.motorista.email,
      rota: nomeRota,
      onibus: estadoApp.onibusAtivo.placa,
      tag_ac: estadoApp.onibusAtivo.tag_ac,
      tag_vale: estadoApp.onibusAtivo.tag_vale,
      modelo: estadoApp.onibusAtivo.empresa,
      capacidade: 50,
      latitude: coords.latitude,
      longitude: coords.longitude,
      velocidade: coords.speed ? (coords.speed * 3.6).toFixed(1) : null,
      precisao: coords.accuracy,
      ativo: true,
      timestamp: new Date()
    });
    
    console.log('📍 Localização enviada:', new Date().toLocaleTimeString());
  } catch (erro) {
    console.error('Erro ao enviar localização:', erro);
  }
}

window.pararRota = function () {
  if (!estadoApp.watchId) return;
  
  if (!confirm('Deseja realmente parar o compartilhamento da rota?')) {
    return;
  }
  
  navigator.geolocation.clearWatch(estadoApp.watchId);
  estadoApp.watchId = null;
  estadoApp.rotaAtiva = null;
  
  if (estadoApp.motorista) {
    updateLocalizacao(estadoApp.motorista.matricula, {
      ativo: false,
      timestamp: new Date()
    });
  }
  
  document.getElementById('rotaStatus').textContent = 'Nenhuma rota ativa';
  document.getElementById('pararRotaBtn').style.display = 'none';
  
  mostrarNotificacao('⏹️ Rota Encerrada', 'Localização não está mais sendo compartilhada.');
};

// ========== BOTÃO DE EMERGÊNCIA ==========
window.ativarEmergencia = async function() {
  if (!estadoApp.motorista) {
    alert('❌ Faça login como motorista para usar esta função');
    return;
  }
  
  if (estadoApp.emergenciaAtiva) {
    estadoApp.emergenciaAtiva = false;
    document.getElementById('emergenciaBtn').textContent = '🚨 EMERGÊNCIA';
    document.getElementById('emergenciaBtn').classList.remove('emergencia-ativa');
    mostrarNotificacao('✅ Emergência Desativada', 'Situação de emergência encerrada');
    return;
  }
  
  const tipo = prompt('Tipo de emergência:\n1. Acidente\n2. Problema mecânico\n3. Problema de saúde\n4. Outro\n\nDigite o número:');
  
  if (!tipo) return;
  
  const descricao = prompt('Descreva brevemente a situação:');
  if (!descricao) return;
  
  try {
    await registrarEmergencia({
      motorista: estadoApp.motorista.nome,
      matricula: estadoApp.motorista.matricula,
      onibus: estadoApp.onibusAtivo?.placa || 'Não informado',
      rota: estadoApp.rotaAtiva || 'Não informada',
      tipo: getTipoEmergencia(tipo),
      descricao: descricao,
      status: 'pendente',
      timestamp: new Date()
    });
    
    estadoApp.emergenciaAtiva = true;
    document.getElementById('emergenciaBtn').textContent = '✅ EMERGÊNCIA ATIVA';
    document.getElementById('emergenciaBtn').classList.add('emergencia-ativa');
    
    mostrarNotificacao('🚨 EMERGÊNCIA ATIVADA', 'A equipe de suporte foi notificada!');
    
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
    
  } catch (erro) {
    console.error('Erro ao registrar emergência:', erro);
    alert('❌ Erro ao ativar emergência. Tente novamente.');
  }
};

function getTipoEmergencia(numero) {
  const tipos = {
    '1': 'Acidente',
    '2': 'Problema mecânico',
    '3': 'Problema de saúde',
    '4': 'Outro'
  };
  return tipos[numero] || 'Outro';
}

// ========== FEEDBACK ==========
window.abrirFeedback = function(perfil) {
  mostrarTela(`tela-feedback-${perfil}`);
};

window.enviarFeedback = async function(perfil) {
  const tipo = document.getElementById(`feedbackTipo${perfil}`)?.value;
  const mensagem = document.getElementById(`feedbackMensagem${perfil}`)?.value;
  
  if (!tipo || !mensagem) {
    alert('Preencha todos os campos');
    return;
  }
  
  if (mensagem.length < 10) {
    alert('A mensagem deve ter pelo menos 10 caracteres');
    return;
  }
  
  try {
    const dados = {
      tipo: tipo,
      mensagem: mensagem,
      status: 'pendente',
      timestamp: new Date()
    };
    
    if (perfil === 'motorista' && estadoApp.motorista) {
      dados.motorista = estadoApp.motorista.nome;
      dados.matricula = estadoApp.motorista.matricula;
      dados.perfil = 'motorista';
    } else if (perfil === 'passageiro') {
      dados.perfil = 'passageiro';
    }
    
    await registrarFeedback(dados);
    
    document.getElementById(`feedbackMensagem${perfil}`).value = '';
    
    if (perfil === 'motorista') {
      mostrarTela('tela-motorista');
    } else {
      mostrarTela('tela-passageiro');
    }
    
    mostrarNotificacao('✅ Feedback Enviado', 'Obrigado pelo seu feedback!');
    
  } catch (erro) {
    console.error('Erro ao enviar feedback:', erro);
    alert('❌ Erro ao enviar feedback. Tente novamente.');
  }
};

// ========== MONITORAMENTO ==========
function iniciarMonitoramentoPassageiro() {
  if (estadoApp.unsubscribeRotas) return;
  
  estadoApp.unsubscribeRotas = monitorarRotas((rotas) => {
    const container = document.getElementById('rotasAtivasList');
    if (!container) return;
    
    if (rotas.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🚌</div>
          <h4>Nenhuma rota ativa no momento</h4>
          <p>Não há motoristas compartilhando localização no momento.</p>
        </div>
      `;
      return;
    }
    
    // Agrupar por rota
    const rotasAgrupadas = {};
    rotas.forEach(rota => {
      if (rota.ativo !== false && rota.rota) {
        if (!rotasAgrupadas[rota.rota]) {
          rotasAgrupadas[rota.rota] = [];
        }
        rotasAgrupadas[rota.rota].push(rota);
      }
    });
    
    // Ordenar rotas: ADM primeiro, depois operacionais, depois retorno
    const rotasOrdenadas = Object.entries(rotasAgrupadas).sort(([a], [b]) => {
      const tipoA = a.includes('ADM') ? 0 : a.includes('RETORNO') ? 2 : 1;
      const tipoB = b.includes('ADM') ? 0 : b.includes('RETORNO') ? 2 : 1;
      return tipoA - tipoB;
    });
    
    container.innerHTML = rotasOrdenadas.map(([nomeRota, motoristas]) => `
      <div class="rota-grupo">
        <h4>${nomeRota}</h4>
        ${motoristas.map(motorista => `
          <div class="motorista-card">
            <div class="motorista-info">
              <div class="motorista-header">
                <strong>👤 ${motorista.motorista}</strong>
                <span class="onibus-badge">${motorista.onibus}</span>
              </div>
              <div class="motorista-detalhes">
                <small>📍 Localização ativa</small>
                <small>⏱️ ${motorista.timestamp ? new Date(motorista.timestamp.toDate()).toLocaleTimeString() : '--:--'}</small>
                ${motorista.velocidade ? `<small>🚗 ${motorista.velocidade} km/h</small>` : ''}
              </div>
            </div>
            <div class="motorista-actions">
              <button class="btn small" onclick="verLocalizacaoMotorista(${motorista.latitude}, ${motorista.longitude}, '${motorista.motorista}', '${motorista.onibus}')">
                📍 Ver Mapa
              </button>
              <button class="btn small secondary" onclick="abrirRotaNoMaps('${nomeRota}')">
                🗺️ Ver Rota
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');
  });
}

function iniciarMonitoramentoAdmin() {
  if (estadoApp.unsubscribeRotas) return;
  
  estadoApp.unsubscribeRotas = monitorarRotas((rotas) => {
    const container = document.getElementById('adminRotasList');
    const countElement = document.getElementById('rotasAtivasCount');
    const motoristasAtivosElement = document.getElementById('motoristasAtivosCount');
    
    if (!container) return;
    
    const rotasAtivas = rotas.filter(r => r.ativo !== false);
    
    if (countElement) {
      countElement.textContent = rotasAtivas.length;
    }
    
    if (motoristasAtivosElement) {
      const motoristasUnicos = [...new Set(rotasAtivas.map(r => r.matricula))];
      motoristasAtivosElement.textContent = motoristasUnicos.length;
    }
    
    if (rotasAtivas.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🚛</div>
          <h4>Nenhuma rota ativa</h4>
          <p>Nenhum motorista está compartilhando localização no momento.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = rotasAtivas.map(rota => `
      <div class="rota-admin-card ${rota.velocidade > 100 ? 'velocidade-alta' : ''}">
        <div class="rota-admin-header">
          <div>
            <strong>${rota.rota}</strong>
            <span class="onibus-tag">${rota.onibus} (${rota.tag_ac})</span>
          </div>
          <span class="status-badge ${rota.velocidade > 100 ? 'alerta' : 'ativo'}">
            ${rota.velocidade > 100 ? '⚡' : '✅'} ${rota.velocidade ? rota.velocidade + ' km/h' : 'Ativo'}
          </span>
        </div>
        
        <div class="rota-admin-info">
          <div class="info-row">
            <span>👤 Motorista:</span>
            <span>${rota.motorista} (${rota.matricula})</span>
          </div>
          <div class="info-row">
            <span>📍 Localização:</span>
            <span>${rota.latitude?.toFixed(6)}, ${rota.longitude?.toFixed(6)}</span>
          </div>
          <div class="info-row">
            <span>⏱️ Última atualização:</span>
            <span>${rota.timestamp ? new Date(rota.timestamp.toDate()).toLocaleTimeString() : '--:--'}</span>
          </div>
          <div class="info-row">
            <span>🎯 Precisão:</span>
            <span>${rota.precisao ? rota.precisao.toFixed(0) + 'm' : '--'}</span>
          </div>
        </div>
        
        <div class="rota-admin-actions">
          <button class="btn small" onclick="verMapaAdmin(${rota.latitude}, ${rota.longitude})">
            🗺️ Ver Mapa
          </button>
          <button class="btn small secondary" onclick="verDetalhesRota('${rota.matricula}')">
            📊 Detalhes
          </button>
          <button class="btn small warning" onclick="enviarNotificacaoMotorista('${rota.matricula}')">
            📢 Notificar
          </button>
        </div>
      </div>
    `).join('');
  });
}

function iniciarMonitoramentoEmergencias() {
  if (estadoApp.unsubscribeEmergencias) return;
  
  estadoApp.unsubscribeEmergencias = monitorarEmergencias((emergencias) => {
    const container = document.getElementById('emergenciasList');
    const countElement = document.getElementById('emergenciasCount');
    
    if (!container) return;
    
    const emergenciasAtivas = emergencias.filter(e => e.status === 'pendente');
    
    if (countElement) {
      countElement.textContent = emergenciasAtivas.length;
    }
    
    if (emergenciasAtivas.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <h4>Nenhuma emergência ativa</h4>
          <p>Todas as situações estão sob controle.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = emergenciasAtivas.map(emergencia => `
      <div class="emergencia-card">
        <div class="emergencia-header">
          <div class="emergencia-titulo">
            <span class="emergencia-icon">🚨</span>
            <strong>${emergencia.tipo}</strong>
          </div>
          <span class="tempo-decorrido">${calcularTempoDecorrido(emergencia.timestamp)}</span>
        </div>
        
        <div class="emergencia-info">
          <div class="info-row">
            <span>👤 Motorista:</span>
            <span>${emergencia.motorista} (${emergencia.matricula})</span>
          </div>
          <div class="info-row">
            <span>🚌 Ônibus:</span>
            <span>${emergencia.onibus}</span>
          </div>
          <div class="info-row">
            <span>🗺️ Rota:</span>
            <span>${emergencia.rota}</span>
          </div>
          <div class="info-row">
            <span>📝 Descrição:</span>
            <span>${emergencia.descricao}</span>
          </div>
        </div>
        
        <div class="emergencia-actions">
          <button class="btn small success" onclick="resolverEmergencia('${emergencia.id}')">
            ✅ Resolver
          </button>
          <button class="btn small" onclick="contatarMotorista('${emergencia.matricula}')">
            📞 Contatar
          </button>
          <button class="btn small warning" onclick="verLocalizacaoEmergencia('${emergencia.id}')">
            📍 Localização
          </button>
        </div>
      </div>
    `).join('');
  });
}

function iniciarMonitoramentoFeedbacks() {
  if (estadoApp.unsubscribeFeedbacks) return;
  
  estadoApp.unsubscribeFeedbacks = monitorarFeedbacks((feedbacks) => {
    const container = document.getElementById('feedbacksList');
    const countElement = document.getElementById('feedbacksCount');
    
    if (!container) return;
    
    const feedbacksPendentes = feedbacks.filter(f => f.status === 'pendente');
    
    if (countElement) {
      countElement.textContent = feedbacksPendentes.length;
    }
    
    if (feedbacksPendentes.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💭</div>
          <h4>Nenhum feedback pendente</h4>
          <p>Todos os feedbacks foram revisados.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = feedbacksPendentes.map(feedback => `
      <div class="feedback-card">
        <div class="feedback-header">
          <div>
            <span class="feedback-perfil">${feedback.perfil === 'motorista' ? '👤 Motorista' : '🧍 Passageiro'}</span>
            <span class="feedback-tipo ${feedback.tipo}">${feedback.tipo}</span>
          </div>
          <span class="tempo-decorrido">${calcularTempoDecorrido(feedback.timestamp)}</span>
        </div>
        
        <div class="feedback-mensagem">
          <p>${feedback.mensagem}</p>
        </div>
        
        ${feedback.motorista ? `
        <div class="feedback-info">
          <small>👤 ${feedback.motorista} ${feedback.matricula ? `(${feedback.matricula})` : ''}</small>
        </div>
        ` : ''}
        
        <div class="feedback-actions">
          <button class="btn small success" onclick="resolverFeedback('${feedback.id}')">
            ✅ Resolver
          </button>
          <button class="btn small" onclick="responderFeedback('${feedback.id}')">
            💬 Responder
          </button>
        </div>
      </div>
    `).join('');
  });
}

function iniciarMonitoramentoAvisos() {
  if (estadoApp.unsubscribeAvisos) return;
  
  estadoApp.unsubscribeAvisos = monitorarAvisos((avisos) => {
    estadoApp.avisosAtivos = avisos;
    
    const avisosCount = document.getElementById('avisosCount');
    if (avisosCount) {
      avisosCount.textContent = avisos.length;
      avisosCount.style.display = avisos.length > 0 ? 'inline' : 'none';
    }
  });
}

// ========== FUNÇÕES AUXILIARES ==========
function calcularTempoDecorrido(timestamp) {
  if (!timestamp) return 'Agora mesmo';
  
  const agora = new Date();
  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffMs = agora - data;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `${diffMins} min atrás`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d atrás`;
}

// ========== NAVEGAÇÃO ENTRE TELAS ==========
window.mostrarTela = function(id) {
  console.log('🔄 Mostrando tela:', id);
  
  document.querySelectorAll('.tela').forEach(tela => {
    tela.classList.add('hidden');
    tela.classList.remove('ativa');
  });
  
  const alvo = document.getElementById(id);
  if (!alvo) {
    console.error('Tela não encontrada:', id);
    return;
  }
  
  alvo.classList.remove('hidden');
  alvo.classList.add('ativa');
  
  switch(id) {
    case 'tela-rotas':
      setTimeout(() => carregarRotas(), 100);
      break;
    case 'tela-passageiro':
      iniciarMonitoramentoPassageiro();
      break;
    case 'tela-admin-dashboard':
      iniciarMonitoramentoAdmin();
      break;
    case 'tela-motorista':
      atualizarInfoMotorista();
      break;
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function atualizarInfoMotorista() {
  if (!estadoApp.motorista) return;
  
  const nomeElement = document.getElementById('motoristaNome');
  const matriculaElement = document.getElementById('motoristaMatricula');
  const onibusElement = document.getElementById('motoristaOnibus');
  
  if (nomeElement) nomeElement.textContent = estadoApp.motorista.nome;
  if (matriculaElement) matriculaElement.textContent = estadoApp.motorista.matricula;
  if (onibusElement && estadoApp.onibusAtivo) {
    onibusElement.textContent = `${estadoApp.onibusAtivo.placa} (${estadoApp.onibusAtivo.tag_ac})`;
  }
}

// ========== CARREGAMENTO DE ROTAS ==========
function carregarRotas() {
  const container = document.getElementById('routesContainer');
  if (!container) {
    console.error('Container de rotas não encontrado');
    return;
  }
  
  const motoristaLogado = !!estadoApp.motorista;
  const onibusSelecionado = !!estadoApp.onibusAtivo;
  
  container.innerHTML = ROTAS_DISPONIVEIS.map(rota => `
    <div class="route-item ${rota.tipo}" data-tipo="${rota.tipo}">
      <div class="route-info">
        <div class="route-header">
          <span class="route-icon">${rota.tipo === 'adm' ? '🏢' : rota.tipo === 'retorno' ? '🔄' : '🚛'}</span>
          <div>
            <div class="route-nome">${rota.nome}</div>
            <small class="route-desc">${rota.desc}</small>
          </div>
        </div>
        <div class="route-status" id="status-${rota.id}">
          <small>🔄 Verificando motoristas...</small>
        </div>
      </div>
      <div class="route-actions">
        ${motoristaLogado && onibusSelecionado ? `
          <button class="btn" onclick="iniciarRota('${rota.nome}')">
            ▶️ Iniciar Rota
          </button>
        ` : `
          <button class="btn disabled" disabled title="Selecione um ônibus primeiro">
            ⚠️ Selecione ônibus
          </button>
        `}
        <button class="btn secondary" onclick="abrirRotaNoMaps('${rota.nome}')">
          🗺️ Abrir Rota
        </button>
        <button class="btn outline" onclick="verMotoristasNaRota('${rota.nome}')">
          👁️ Ver Motoristas
        </button>
      </div>
    </div>
  `).join('');
  
  verificarMotoristasPorRota();
}

async function verificarMotoristasPorRota() {
  if (!estadoApp.unsubscribeRotas) {
    const unsubscribe = monitorarRotas((rotas) => {
      const rotasAtivas = rotas.filter(r => r.ativo !== false);
      
      rotasAtivas.forEach(rota => {
        const statusElement = document.getElementById(`status-${rota.id}`);
        if (statusElement) {
          statusElement.innerHTML = `
            <small>✅ <strong>${rota.motorista}</strong> no ônibus ${rota.onibus}</small>
            <small>📍 ${rota.velocidade ? rota.velocidade + ' km/h' : 'Ativo'}</small>
          `;
        }
      });
      
      document.querySelectorAll('.route-item').forEach(item => {
        const routeId = item.querySelector('.route-status')?.id.replace('status-', '');
        if (routeId && !rotasAtivas.find(r => r.id === routeId)) {
          const statusElement = document.getElementById(`status-${routeId}`);
          if (statusElement) {
            statusElement.innerHTML = `<small>⏳ Nenhum motorista ativo</small>`;
          }
        }
      });
    });
    
    setTimeout(() => unsubscribe(), 5000);
  }
}

// ========== FUNÇÕES DE MAPA ==========
window.abrirRotaNoMaps = function(nomeRota) {
  const rotas = {
    'ROTA ADM 01': 'https://www.google.com/maps/d/u/1/edit?mid=18BCgBpobp1Olzmzy0RnPCUEd7Vnkc5s&usp=sharing',
    'ROTA ADM 02': 'https://www.google.com/maps/d/u/1/edit?mid=1WxbIX8nw0xyGBLMvvi1SF3DRuwmZ5oM&usp=sharing',
    'ROTA 01': 'https://www.google.com/maps/d/u/1/edit?mid=1jCfFxq1ZwecS2IcHy7xGFLLgttsM-RQ&usp=sharing',
    'ROTA 02': 'https://www.google.com/maps/d/u/1/edit?mid=1LCvNJxWBbZ_chpbdn_lk_Dm6NPA194g&usp=sharing',
    'ROTA 03': 'https://www.google.com/maps/d/u/1/edit?mid=1bdwkrClh5AZml0mnDGlOzYcaR4w1BL0&usp=sharing',
    'ROTA 04': 'https://www.google.com/maps/d/u/1/edit?mid=1ejibzdZkhX2QLnP9YgvvHdQpZELFvXo&usp=sharing',
    'ROTA 05': 'https://www.google.com/maps/d/u/1/edit?mid=1L9xjAWFUupMc7eQbqVJz-SNWlYX5SHo&usp=sharing',
    'RETORNO OVERLAND - ROTA 01': 'https://www.google.com/maps/d/u/1/edit?mid=1ClQVIaRLOYYWHU7fvP87r1BVy85a_eg&usp=sharing',
    'RETORNO OVERLAND - ROTA 02': 'https://www.google.com/maps/d/u/1/edit?mid=1WOIMgeLgV01B8yk7HoX6tazdCHXQnok&usp=sharing'
  };
  
  const url = rotas[nomeRota];
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    alert('Rota não encontrada');
  }
};

window.verLocalizacaoMotorista = function(lat, lng, motorista, onibus) {
  const url = `https://www.google.com/maps?q=${lat},${lng}&z=15`;
  window.open(url, '_blank', 'noopener,noreferrer');
  
  mostrarNotificacao('📍 Localização', `Abrindo localização de ${motorista} (${onibus})`);
};

window.verMapaAdmin = function(lat, lng) {
  const url = `https://www.google.com/maps/@${lat},${lng},15z`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

window.verMotoristasNaRota = function(nomeRota) {
  mostrarTela('tela-ver-motoristas');
};

// ========== CLIMA ==========
async function buscarClimaAtual() {
  try {
    const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Sao Paulo,BR&units=metric&lang=pt_br&appid=3199f44c3156f8c75722104de2677173');
    const data = await response.json();
    
    if (data.main) {
      const climaElement = document.getElementById('climaAtual');
      if (climaElement) {
        climaElement.innerHTML = `
          <div class="clima-info">
            <span>🌡️ ${Math.round(data.main.temp)}°C</span>
            <small>${data.weather[0].description}</small>
          </div>
        `;
      }
    }
  } catch (error) {
    console.log('Não foi possível obter dados do clima:', error);
    const climaElement = document.getElementById('climaAtual');
    if (climaElement) {
      climaElement.innerHTML = `
        <div class="clima-info">
          <span>🌡️ 25°C</span>
          <small>Ensolarado</small>
        </div>
      `;
    }
  }
}

// ========== NOTIFICAÇÕES ==========
function mostrarNotificacao(titulo, mensagem) {
  if (!("Notification" in window)) {
    console.log("Este navegador não suporta notificações desktop");
    return;
  }
  
  if (Notification.permission === "granted") {
    criarNotificacao(titulo, mensagem);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        criarNotificacao(titulo, mensagem);
      }
    });
  }
  
  criarNotificacaoTela(titulo, mensagem);
}

function criarNotificacao(titulo, mensagem) {
  const notification = new Notification(titulo, {
    body: mensagem,
    icon: 'logo.jpg',
    tag: 'ac-transporte'
  });
  
  notification.onclick = function() {
    window.focus();
    this.close();
  };
}

function criarNotificacaoTela(titulo, mensagem) {
  const notificacao = document.createElement('div');
  notificacao.className = 'notificacao-tela';
  notificacao.innerHTML = `
    <div class="notificacao-conteudo">
      <strong>${titulo}</strong>
      <p>${mensagem}</p>
    </div>
    <button onclick="this.parentElement.remove()">✕</button>
  `;
  
  document.body.appendChild(notificacao);
  
  setTimeout(() => {
    if (notificacao.parentElement) {
      notificacao.remove();
    }
  }, 5000);
}

// ========== FUNÇÕES ADMIN ==========
window.enviarNotificacaoGeral = async function() {
  const titulo = document.getElementById('notificacaoTitulo').value;
  const mensagem = document.getElementById('notificacaoMensagem').value;
  const destino = document.getElementById('notificacaoDestino').value;
  
  if (!titulo || !mensagem) {
    alert('Preencha título e mensagem');
    return;
  }
  
  try {
    await registrarAviso({
      titulo: titulo,
      mensagem: mensagem,
      destino: destino,
      ativo: true,
      timestamp: new Date()
    });
    
    document.getElementById('notificacaoTitulo').value = '';
    document.getElementById('notificacaoMensagem').value = '';
    
    mostrarNotificacao('📢 Notificação Enviada', `Notificação enviada para ${destino}`);
    
  } catch (erro) {
    console.error('Erro ao enviar notificação:', erro);
    alert('❌ Erro ao enviar notificação');
  }
};

window.verFormsControle = function() {
  window.open('https://docs.google.com/spreadsheets/d/1w1KEIbWk7vjsYUvVzCm7-OSERgQVqUys77nZCLabhdE/edit?usp=sharing', '_blank', 'noopener,noreferrer');
};

// ========== GESTÃO DE AVISOS (ADMIN) ==========
window.gerenciarAvisos = async function() {
  try {
    showLoading('Carregando avisos...');
    
    const avisos = await getAvisos();
    estadoApp.avisosAtivos = avisos;
    
    const modal = document.createElement('div');
    modal.className = 'modal-back';
    modal.innerHTML = `
      <div class="modal large">
        <button class="close" onclick="this.parentElement.parentElement.remove()">✕</button>
        <h3><i class="fas fa-bullhorn"></i> Gerenciar Avisos</h3>
        
        <div class="admin-actions-bar">
          <button class="btn success" onclick="criarNovoAviso()">
            <i class="fas fa-plus"></i> Novo Aviso
          </button>
        </div>
        
        <div class="avisos-admin-list">
          ${avisos.length === 0 ? `
            <div class="empty-state">
              <i class="fas fa-bullhorn"></i>
              <h4>Nenhum aviso cadastrado</h4>
              <p>Clique em "Novo Aviso" para criar o primeiro.</p>
            </div>
          ` : avisos.map(aviso => `
            <div class="aviso-admin-item" id="aviso-${aviso.id}">
              <div class="aviso-admin-header">
                <div>
                  <h4>${aviso.titulo}</h4>
                  <small class="aviso-destino-badge">Para: ${aviso.destino || 'Todos'}</small>
                  <small class="aviso-data">${aviso.timestamp ? new Date(aviso.timestamp.toDate()).toLocaleString() : ''}</small>
                </div>
                <div class="aviso-admin-actions">
                  <button class="icon-btn" onclick="editarAviso('${aviso.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="icon-btn danger" onclick="excluirAviso('${aviso.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div class="aviso-admin-content">
                <p>${aviso.mensagem}</p>
                <div class="aviso-status">
                  <span class="status-badge ${aviso.ativo ? 'ativo' : 'inativo'}">
                    ${aviso.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
  } catch (erro) {
    console.error('Erro ao carregar avisos:', erro);
    alert('❌ Erro ao carregar avisos');
  } finally {
    hideLoading();
  }
};

window.criarNovoAviso = function() {
  const modal = document.createElement('div');
  modal.className = 'modal-back';
  modal.innerHTML = `
    <div class="modal">
      <button class="close" onclick="this.parentElement.parentElement.remove()">✕</button>
      <h3><i class="fas fa-plus"></i> Criar Novo Aviso</h3>
      
      <div class="form-group">
        <label>Título *</label>
        <input type="text" id="novoAvisoTitulo" class="form-input" placeholder="Título do aviso" required>
      </div>
      
      <div class="form-group">
        <label>Mensagem *</label>
        <textarea id="novoAvisoMensagem" class="form-input" rows="4" placeholder="Mensagem do aviso" required></textarea>
      </div>
      
      <div class="form-group">
        <label>Destino</label>
        <select id="novoAvisoDestino" class="form-input">
          <option value="todos">Todos</option>
          <option value="motoristas">Motoristas</option>
          <option value="passageiros">Passageiros</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>
          <input type="checkbox" id="novoAvisoAtivo" checked> Aviso ativo
        </label>
      </div>
      
      <div class="form-actions">
        <button class="btn btn-primary" onclick="salvarNovoAviso()">
          <i class="fas fa-save"></i> Salvar Aviso
        </button>
        <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i> Cancelar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.style.display = 'flex';
};

window.salvarNovoAviso = async function() {
  const titulo = document.getElementById('novoAvisoTitulo').value;
  const mensagem = document.getElementById('novoAvisoMensagem').value;
  const destino = document.getElementById('novoAvisoDestino').value;
  const ativo = document.getElementById('novoAvisoAtivo').checked;
  
  if (!titulo || !mensagem) {
    alert('Preencha título e mensagem');
    return;
  }
  
  try {
    showLoading('Salvando aviso...');
    
    await registrarAviso({
      titulo: titulo,
      mensagem: mensagem,
      destino: destino,
      ativo: ativo,
      timestamp: new Date()
    });
    
    mostrarNotificacao('✅ Aviso Criado', 'Aviso criado com sucesso!');
    
    document.querySelector('.modal-back').remove();
    gerenciarAvisos();
    
  } catch (erro) {
    console.error('Erro ao salvar aviso:', erro);
    alert('❌ Erro ao salvar aviso');
  } finally {
    hideLoading();
  }
};

window.editarAviso = async function(avisoId) {
  try {
    showLoading('Carregando aviso...');
    
    const aviso = estadoApp.avisosAtivos.find(a => a.id === avisoId);
    if (!aviso) {
      alert('Aviso não encontrado');
      return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-back';
    modal.innerHTML = `
      <div class="modal">
        <button class="close" onclick="this.parentElement.parentElement.remove()">✕</button>
        <h3><i class="fas fa-edit"></i> Editar Aviso</h3>
        
        <div class="form-group">
          <label>Título *</label>
          <input type="text" id="editarAvisoTitulo" class="form-input" value="${aviso.titulo || ''}" required>
        </div>
        
        <div class="form-group">
          <label>Mensagem *</label>
          <textarea id="editarAvisoMensagem" class="form-input" rows="4" required>${aviso.mensagem || ''}</textarea>
        </div>
        
        <div class="form-group">
          <label>Destino</label>
          <select id="editarAvisoDestino" class="form-input">
            <option value="todos" ${aviso.destino === 'todos' ? 'selected' : ''}>Todos</option>
            <option value="motoristas" ${aviso.destino === 'motoristas' ? 'selected' : ''}>Motoristas</option>
            <option value="passageiros" ${aviso.destino === 'passageiros' ? 'selected' : ''}>Passageiros</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" id="editarAvisoAtivo" ${aviso.ativo ? 'checked' : ''}> Aviso ativo
          </label>
        </div>
        
        <div class="form-actions">
          <button class="btn btn-primary" onclick="salvarEdicaoAviso('${avisoId}')">
            <i class="fas fa-save"></i> Salvar Alterações
          </button>
          <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
            <i class="fas fa-times"></i> Cancelar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
  } catch (erro) {
    console.error('Erro ao carregar aviso:', erro);
    alert('❌ Erro ao carregar aviso');
  } finally {
    hideLoading();
  }
};

window.salvarEdicaoAviso = async function(avisoId) {
  const titulo = document.getElementById('editarAvisoTitulo').value;
  const mensagem = document.getElementById('editarAvisoMensagem').value;
  const destino = document.getElementById('editarAvisoDestino').value;
  const ativo = document.getElementById('editarAvisoAtivo').checked;
  
  if (!titulo || !mensagem) {
    alert('Preencha título e mensagem');
    return;
  }
  
  try {
    showLoading('Salvando alterações...');
    
    await updateAviso(avisoId, {
      titulo: titulo,
      mensagem: mensagem,
      destino: destino,
      ativo: ativo,
      timestamp: new Date()
    });
    
    mostrarNotificacao('✅ Aviso Atualizado', 'Aviso atualizado com sucesso!');
    
    document.querySelector('.modal-back').remove();
    gerenciarAvisos();
    
  } catch (erro) {
    console.error('Erro ao atualizar aviso:', erro);
    alert('❌ Erro ao atualizar aviso');
  } finally {
    hideLoading();
  }
};

window.excluirAviso = async function(avisoId) {
  if (!confirm('Tem certeza que deseja excluir este aviso?\n\nEsta ação não pode ser desfeita.')) {
    return;
  }
  
  try {
    showLoading('Excluindo aviso...');
    
    await deleteAviso(avisoId);
    
    mostrarNotificacao('✅ Aviso Excluído', 'Aviso excluído com sucesso!');
    
    const avisoElement = document.getElementById(`aviso-${avisoId}`);
    if (avisoElement) {
      avisoElement.remove();
    }
    
    if (document.querySelectorAll('.aviso-admin-item').length === 0) {
      const container = document.querySelector('.avisos-admin-list');
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-bullhorn"></i>
            <h4>Nenhum aviso cadastrado</h4>
            <p>Clique em "Novo Aviso" para criar o primeiro.</p>
          </div>
        `;
      }
    }
    
  } catch (erro) {
    console.error('Erro ao excluir aviso:', erro);
    alert('❌ Erro ao excluir aviso');
  } finally {
    hideLoading();
  }
};

// ========== GESTÃO DE ESCALAS (ADMIN) ==========
async function carregarEscalas() {
  try {
    const escalas = await getEscalas();
    estadoApp.escalas = escalas;
  } catch (erro) {
    console.error('Erro ao carregar escalas:', erro);
  }
}

window.gerenciarEscalas = async function() {
  try {
    showLoading('Carregando escalas...');
    
    await carregarEscalas();
    
    const modal = document.createElement('div');
    modal.className = 'modal-back large';
    modal.innerHTML = `
      <div class="modal xlarge">
        <button class="close" onclick="this.parentElement.parentElement.remove()">✕</button>
        <h3><i class="fas fa-calendar-alt"></i> Gerenciar Escalas</h3>
        
        <div class="admin-actions-bar">
          <button class="btn success" onclick="criarNovaEscala()">
            <i class="fas fa-plus"></i> Nova Escala
          </button>
          <button class="btn info" onclick="exportarEscalas()">
            <i class="fas fa-download"></i> Exportar
          </button>
        </div>
        
        <div class="escalas-admin-list">
          ${estadoApp.escalas.length === 0 ? `
            <div class="empty-state">
              <i class="fas fa-calendar"></i>
              <h4>Nenhuma escala cadastrada</h4>
              <p>Clique em "Nova Escala" para criar a primeira.</p>
            </div>
          ` : estadoApp.escalas.map(escala => `
            <div class="escala-admin-item" id="escala-${escala.id}">
              <div class="escala-admin-header">
                <div>
                  <h4>${escala.motorista || 'Sem nome'} - ${escala.matricula || 'Sem matrícula'}</h4>
                  <small class="escala-periodo">${escala.periodo || 'Sem período definido'}</small>
                </div>
                <div class="escala-admin-actions">
                  <button class="icon-btn" onclick="editarEscala('${escala.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="icon-btn danger" onclick="excluirEscala('${escala.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div class="escala-dias-admin">
                ${['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(dia => {
                  const diaEscala = escala.dias ? escala.dias.find(d => d.dia === dia) : null;
                  return `
                    <div class="dia-escala-admin ${diaEscala ? '' : 'folga'}">
                      <div class="dia-nome-admin">${dia}</div>
                      <div class="dia-info-admin">
                        ${diaEscala ? `
                          <span class="turno-admin ${diaEscala.turno}">${diaEscala.horario || '00:00 - 00:00'}</span>
                          <span class="rota-admin">${diaEscala.rota || 'Sem rota'}</span>
                          ${diaEscala.onibus ? `<small class="onibus-admin">${diaEscala.onibus}</small>` : ''}
                        ` : `
                          <span class="folga-text-admin">FOLGA</span>
                        `}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
  } catch (erro) {
    console.error('Erro ao carregar escalas:', erro);
    alert('❌ Erro ao carregar escalas');
  } finally {
    hideLoading();
  }
};

window.criarNovaEscala = function() {
  const modal = document.createElement('div');
  modal.className = 'modal-back';
  modal.innerHTML = `
    <div class="modal large">
      <button class="close" onclick="this.parentElement.parentElement.remove()">✕</button>
      <h3><i class="fas fa-plus"></i> Criar Nova Escala</h3>
      
      <div class="form-group">
        <label>Motorista *</label>
        <input type="text" id="novaEscalaMotorista" class="form-input" placeholder="Nome do motorista" required>
      </div>
      
      <div class="form-group">
        <label>Matrícula *</label>
        <input type="text" id="novaEscalaMatricula" class="form-input" placeholder="Matrícula" required>
      </div>
      
      <div class="form-group">
        <label>Período (Ex: "01/01/2024 - 31/01/2024")</label>
        <input type="text" id="novaEscalaPeriodo" class="form-input" placeholder="Período da escala">
      </div>
      
      <div class="form-section">
        <h4><i class="fas fa-calendar-day"></i> Dias da Semana</h4>
        <div class="dias-escala-form">
          ${['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(dia => `
            <div class="dia-form-group">
              <div class="dia-form-header">
                <strong>${dia}</strong>
                <label class="switch">
                  <input type="checkbox" id="toggle-${dia}" checked>
                  <span class="slider"></span>
                </label>
              </div>
              <div class="dia-form-content" id="content-${dia}">
                <div class="form-group-sm">
                  <label>Horário</label>
                  <select class="form-input-sm" id="${dia}-horario">
                    <option value="06:00 - 14:00">06:00 - 14:00 (Manhã)</option>
                    <option value="14:00 - 22:00">14:00 - 22:00 (Tarde)</option>
                    <option value="22:00 - 06:00">22:00 - 06:00 (Noite)</option>
                    <option value="00:00 - 00:00">Folga</option>
                  </select>
                </div>
                <div class="form-group-sm">
                  <label>Rota</label>
                  <select class="form-input-sm" id="${dia}-rota">
                    <option value="">Selecione...</option>
                    ${ROTAS_DISPONIVEIS.map(rota => `<option value="${rota.nome}">${rota.nome}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group-sm">
                  <label>Ônibus</label>
                  <select class="form-input-sm" id="${dia}-onibus">
                    <option value="">Selecione...</option>
                    ${ONIBUS_DISPONIVEIS.map(onibus => `<option value="${onibus.placa}">${onibus.placa} (${onibus.tag_ac})</option>`).join('')}
                  </select>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="form-actions">
        <button class="btn btn-primary" onclick="salvarNovaEscala()">
          <i class="fas fa-save"></i> Salvar Escala
        </button>
        <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i> Cancelar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.style.display = 'flex';
  
  ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].forEach(dia => {
    const toggle = document.getElementById(`toggle-${dia}`);
    const content = document.getElementById(`content-${dia}`);
    
    if (toggle && content) {
      toggle.addEventListener('change', function() {
        content.style.display = this.checked ? 'block' : 'none';
      });
    }
  });
};

window.salvarNovaEscala = async function() {
  const motorista = document.getElementById('novaEscalaMotorista').value;
  const matricula = document.getElementById('novaEscalaMatricula').value;
  const periodo = document.getElementById('novaEscalaPeriodo').value;
  
  if (!motorista || !matricula) {
    alert('Preencha nome do motorista e matrícula');
    return;
  }
  
  const dias = [];
  ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].forEach(dia => {
    const toggle = document.getElementById(`toggle-${dia}`);
    if (toggle && toggle.checked) {
      const horario = document.getElementById(`${dia}-horario`).value;
      const rota = document.getElementById(`${dia}-rota`).value;
      const onibus = document.getElementById(`${dia}-onibus`).value;
      
      dias.push({
        dia: dia,
        horario: horario,
        rota: rota,
        onibus: onibus
      });
    }
  });
  
  try {
    showLoading('Salvando escala...');
    
    await addEscala({
      motorista: motorista,
      matricula: matricula,
      periodo: periodo,
      dias: dias,
      timestamp: new Date()
    });
    
    mostrarNotificacao('✅ Escala Criada', 'Escala criada com sucesso!');
    
    document.querySelector('.modal-back').remove();
    gerenciarEscalas();
    
  } catch (erro) {
    console.error('Erro ao salvar escala:', erro);
    alert('❌ Erro ao salvar escala');
  } finally {
    hideLoading();
  }
};

window.editarEscala = async function(escalaId) {
  try {
    showLoading('Carregando escala...');
    
    const escala = estadoApp.escalas.find(e => e.id === escalaId);
    if (!escala) {
      alert('Escala não encontrado');
      return;
    }
    
    const novoMotorista = prompt('Editar nome do motorista:', escala.motorista || '');
    if (novoMotorista !== null) {
      await updateEscala(escalaId, {
        ...escala,
        motorista: novoMotorista
      });
      
      mostrarNotificacao('✅ Escala Atualizada', 'Escala atualizada com sucesso!');
      gerenciarEscalas();
    }
    
  } catch (erro) {
    console.error('Erro ao editar escala:', erro);
    alert('❌ Erro ao editar escala');
  } finally {
    hideLoading();
  }
};

window.excluirEscala = async function(escalaId) {
  if (!confirm('Tem certeza que deseja excluir esta escala?\n\nEsta ação não pode ser desfeita.')) {
    return;
  }
  
  try {
    showLoading('Excluindo escala...');
    
    await deleteEscala(escalaId);
    
    mostrarNotificacao('✅ Escala Excluída', 'Escala excluída com sucesso!');
    
    const escalaElement = document.getElementById(`escala-${escalaId}`);
    if (escalaElement) {
      escalaElement.remove();
    }
    
  } catch (erro) {
    console.error('Erro ao excluir escala:', erro);
    alert('❌ Erro ao excluir escala');
  } finally {
    hideLoading();
  }
};

window.exportarEscalas = function() {
  if (estadoApp.escalas.length === 0) {
    alert('Não há escalas para exportar');
    return;
  }
  
  let csvContent = "Motorista;Matrícula;Período;Segunda;Terça;Quarta;Quinta;Sexta;Sábado;Domingo\n";
  
  estadoApp.escalas.forEach(escala => {
    const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const diasInfo = dias.map(dia => {
      const diaEscala = escala.dias ? escala.dias.find(d => d.dia === dia) : null;
      if (diaEscala) {
        return `${diaEscala.horario} - ${diaEscala.rota || ''}`;
      }
      return 'FOLGA';
    });
    
    csvContent += `${escala.motorista || ''};${escala.matricula || ''};${escala.periodo || ''};${diasInfo.join(';')}\n`;
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `escalas_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  mostrarNotificacao('✅ Escalas Exportadas', 'Download iniciado!');
};

// ========== FUNÇÕES DE TEMAS E PWA ==========
function initDarkMode() {
  const darkToggle = document.getElementById('darkToggle');
  if (!darkToggle) return;
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const savedPreference = localStorage.getItem('ac_dark');
  
  if (savedPreference === '1' || (!savedPreference && prefersDark.matches)) {
    document.body.classList.add('dark');
    updateDarkModeIcon(true);
  }
  
  darkToggle.addEventListener('click', toggleDarkMode);
  
  prefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('ac_dark')) {
      if (e.matches) {
        document.body.classList.add('dark');
        updateDarkModeIcon(true);
      } else {
        document.body.classList.remove('dark');
        updateDarkModeIcon(false);
      }
    }
  });
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('ac_dark', isDark ? '1' : '0');
  updateDarkModeIcon(isDark);
  
  const darkToggle = document.getElementById('darkToggle');
  if (darkToggle) {
    darkToggle.style.transform = 'scale(0.95)';
    setTimeout(() => {
      darkToggle.style.transform = '';
    }, 150);
  }
}

function updateDarkModeIcon(isDark) {
  const darkToggle = document.getElementById('darkToggle');
  if (!darkToggle) return;
  
  darkToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  darkToggle.setAttribute('title', isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro');
}

function initPWA() {
  const installBtn = document.getElementById('installBtn');
  if (!installBtn) return;
  
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'flex';
    console.log('📱 PWA pode ser instalado');
  });
  
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
      alert('Este aplicativo já está instalado ou não pode ser instalado.');
      return;
    }
    
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('✅ Usuário aceitou a instalação');
      installBtn.style.display = 'none';
    } else {
      console.log('❌ Usuário recusou a instalação');
    }
    
    deferredPrompt = null;
  });
  
  window.addEventListener('appinstalled', () => {
    console.log('🎉 PWA instalado com sucesso');
    installBtn.style.display = 'none';
  });
  
  if (window.matchMedia('(display-mode: standalone)').matches) {
    installBtn.style.display = 'none';
  }
}

// ========== FUNÇÕES DE CONEXÃO ==========
function initConnectionMonitor() {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  updateOnlineStatus();
}

function updateOnlineStatus() {
  estadoApp.isOnline = navigator.onLine;
  const statusElement = document.getElementById('connectionStatus');
  const offlineBanner = document.getElementById('offlineBanner');
  
  if (statusElement) {
    statusElement.innerHTML = estadoApp.isOnline ? '<i class="fas fa-circle"></i>' : '<i class="fas fa-circle"></i>';
    statusElement.style.color = estadoApp.isOnline ? '#4CAF50' : '#FF5722';
    statusElement.title = estadoApp.isOnline ? 'Online' : 'Offline';
  }
  
  if (offlineBanner) {
    offlineBanner.style.display = estadoApp.isOnline ? 'none' : 'block';
  }
  
  if (!estadoApp.isOnline) {
    console.warn('📶 Aplicativo offline');
    mostrarNotificacao('📶 Modo Offline', 'Algumas funcionalidades podem não estar disponíveis');
  }
}

// ========== AVISOS ==========
function initAvisos() {
  const avisosBtn = document.getElementById('avisosBtn');
  if (avisosBtn) {
    avisosBtn.addEventListener('click', mostrarAvisos);
  }
}

window.mostrarAvisos = function() {
  const avisos = estadoApp.avisosAtivos || [];
  
  if (avisos.length === 0) {
    alert('📭 Nenhum aviso no momento');
    return;
  }
  
  const avisosHTML = avisos.filter(aviso => aviso.ativo).map(aviso => `
    <div class="aviso-item">
      <div class="aviso-header">
        <strong>${aviso.titulo}</strong>
        <small>${aviso.timestamp ? new Date(aviso.timestamp.toDate()).toLocaleDateString() : ''}</small>
      </div>
      <p>${aviso.mensagem}</p>
      <small class="aviso-destino">Para: ${aviso.destino || 'Todos'}</small>
    </div>
  `).join('');
  
  const modal = document.createElement('div');
  modal.className = 'modal-back';
  modal.innerHTML = `
    <div class="modal">
      <button class="close" onclick="this.parentElement.parentElement.remove()">✕</button>
      <h3>📢 Avisos e Comunicados</h3>
      <div class="avisos-list">
        ${avisosHTML}
      </div>
      <div style="margin-top:12px">
        <button class="btn" onclick="this.parentElement.parentElement.remove()">Fechar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.style.display = 'flex';
};

// ========== FUNÇÕES DE UTILIDADE ==========
function showLoading(message = 'Carregando...') {
  const overlay = document.getElementById('loadingOverlay');
  const text = document.getElementById('loadingText');
  
  if (overlay) overlay.style.display = 'flex';
  if (text) text.textContent = message;
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'none';
}

function initEventListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
  
  document.querySelectorAll('.modal-back').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  });
}

function closeAllModals() {
  document.querySelectorAll('.modal-back').forEach(modal => {
    modal.remove();
  });
}

// ========== SERVICE WORKER ==========
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => {
        console.log('✅ ServiceWorker registrado:', registration.scope);
      })
      .catch(error => {
        console.log('❌ Falha ao registrar ServiceWorker:', error);
      });
  });
}

// ========== SUPPORT - WHATSAPP ==========
window.abrirSuporteWhatsApp = function() {
  const telefone = '5593992059914';
  const mensagem = encodeURIComponent('Olá! Preciso de suporte no Portal de Transporte da AC Parceria.');
  const url = `https://wa.me/${telefone}?text=${mensagem}`;
  
  window.open(url, '_blank', 'noopener,noreferrer');
};

// ========== EXPORTAR FUNÇÕES PARA ESCOPO GLOBAL ==========
window.openModal = function(modalType) {
  const modalId = modalType === 'avisosModal' ? 'avisosModalBack' : 'ajudaModalBack';
  const modal = document.getElementById(modalId);
  
  if (modal) {
    modal.style.display = 'flex';
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
};

// Exportar todas as funções necessárias
window.mostrarTela = mostrarTela;
window.entrarNoPortal = entrarNoPortal;
window.selecionarPerfil = selecionarPerfil;
window.confirmarMatriculaMotorista = confirmarMatriculaMotorista;
window.selecionarOnibus = selecionarOnibus;
window.loginAdmin = loginAdmin;
window.logout = logout;
window.iniciarRota = iniciarRota;
window.pararRota = pararRota;
window.ativarEmergencia = ativarEmergencia;
window.abrirFeedback = abrirFeedback;
window.enviarFeedback = enviarFeedback;
window.abrirRotaNoMaps = abrirRotaNoMaps;
window.verLocalizacaoMotorista = verLocalizacaoMotorista;
window.verMapaAdmin = verMapaAdmin;
window.verMotoristasNaRota = verMotoristasNaRota;
window.enviarNotificacaoGeral = enviarNotificacaoGeral;
window.verFormsControle = verFormsControle;
window.gerenciarAvisos = gerenciarAvisos;
window.gerenciarEscalas = gerenciarEscalas;
window.abrirSuporteWhatsApp = abrirSuporteWhatsApp;

console.log('🚀 app.js carregado com sucesso!');

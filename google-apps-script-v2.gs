// ============================================================
// GOOGLE APPS SCRIPT — EMDA Banco de Talentos v2
// ============================================================

// >>> APÓS RODAR A FUNÇÃO "criarPlanilha" PELA PRIMEIRA VEZ,
// >>> COPIE O ID QUE APARECER NO LOG E COLE AQUI ABAIXO:
const SPREADSHEET_ID = '';

const SHEET_NAME = 'Currículos';

// ============================================================
// PASSO 1: Rode esta função primeiro para criar a planilha
// ============================================================

function criarPlanilha() {
  const ss = SpreadsheetApp.create('EMDA - Banco de Talentos');
  const sheet = ss.getActiveSheet();
  sheet.setName(SHEET_NAME);
  
  // Headers
  sheet.appendRow([
    'timestamp', 'nome', 'email', 'whatsapp', 'cidade', 'estado',
    'cursos', 'ano_conclusao', 'experiencia', 'instagram', 
    'portfolio', 'linkedin', 'sobre', 'foto', 'foto_base64'
  ]);
  
  // Formatar header
  const headerRange = sheet.getRange(1, 1, 1, 15);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#000000');
  headerRange.setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);
  
  Logger.log('========================================');
  Logger.log('PLANILHA CRIADA COM SUCESSO!');
  Logger.log('ID: ' + ss.getId());
  Logger.log('URL: ' + ss.getUrl());
  Logger.log('========================================');
  Logger.log('COPIE O ID ACIMA E COLE NA LINHA 6 DO CÓDIGO');
}

// ============================================================
// GET — Verificação de duplicatas
// ============================================================

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'check') {
      return handleDuplicateCheck(e);
    }
    
    return jsonResponse({ status: 'ok', message: 'EMDA Banco de Talentos API' });
    
  } catch (error) {
    return jsonResponse({ error: error.message });
  }
}

function handleDuplicateCheck(e) {
  const field = e.parameter.field;
  const value = (e.parameter.value || '').trim().toLowerCase();
  
  if (!field || !value) {
    return jsonResponse({ found: false });
  }
  
  const sheet = getSheet();
  if (!sheet) {
    return jsonResponse({ found: false, error: 'Planilha não configurada' });
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const colIndex = headers.indexOf(field);
  if (colIndex === -1) {
    return jsonResponse({ found: false });
  }
  
  for (let i = 1; i < data.length; i++) {
    let cellValue = String(data[i][colIndex] || '').trim().toLowerCase();
    
    if (field === 'whatsapp') {
      cellValue = cellValue.replace(/\D/g, '');
      const searchValue = value.replace(/\D/g, '');
      if (cellValue === searchValue && cellValue.length >= 10) {
        return jsonResponse({
          found: true,
          data: {
            nome: data[i][headers.indexOf('nome')] || '',
            timestamp: data[i][headers.indexOf('timestamp')] || ''
          }
        });
      }
    } else {
      if (cellValue === value) {
        return jsonResponse({
          found: true,
          data: {
            nome: data[i][headers.indexOf('nome')] || '',
            timestamp: data[i][headers.indexOf('timestamp')] || ''
          }
        });
      }
    }
  }
  
  return jsonResponse({ found: false });
}

// ============================================================
// POST — Salvar currículo
// ============================================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    const sheet = getSheet();
    if (!sheet) {
      return jsonResponse({ success: false, error: 'Planilha não configurada' });
    }
    
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.nome || '',
      data.email || '',
      data.whatsapp || '',
      data.cidade || '',
      data.estado || '',
      data.cursos || '',
      data.ano_conclusao || '',
      data.experiencia || '',
      data.instagram || '',
      data.portfolio || '',
      data.linkedin || '',
      data.sobre || '',
      data.foto || 'Não',
      '' // foto_base64 omitido (muito grande)
    ]);
    
    return jsonResponse({ success: true });
    
  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  }
}

// ============================================================
// Helpers
// ============================================================

function getSheet() {
  if (!SPREADSHEET_ID) {
    // Se não tem ID, tenta buscar por nome
    const files = DriveApp.getFilesByName('EMDA - Banco de Talentos');
    if (files.hasNext()) {
      const ss = SpreadsheetApp.open(files.next());
      return ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
    }
    return null;
  }
  
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// Teste
// ============================================================

function testar() {
  const sheet = getSheet();
  if (sheet) {
    Logger.log('Planilha encontrada! Linhas: ' + sheet.getLastRow());
    Logger.log('URL: ' + sheet.getParent().getUrl());
  } else {
    Logger.log('Planilha não encontrada. Rode a função "criarPlanilha" primeiro.');
  }
}

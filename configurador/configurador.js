/* Box do Conector — Configurador "Monte seu kit"
   Lê os produtos de catalogo.js (window.CATALOGO). Não depende de bibliotecas. */
(function () {
  'use strict';

  var C = window.CATALOGO;
  if (!C) { console.error('catalogo.js não carregou'); return; }

  var CHAVE_LS = 'bdc_orcamento_v1';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ================= Estado ================= */
  function novoEstado() {
    return { linha: null, vias: null, cor: 'cinza', montagem: null, terminal: null, extras: {}, kits: 1,
      fios: { ativo: false, lado: 'ambos', comp: (C.montagemFios && C.montagemFios.padrao) || '' } };
  }
  var st = novoEstado();
  var orcamento = carregarOrcamento();

  function L() { return st.linha ? C.linhas[st.linha] : null; }
  function viasDaLinha(l) { return Object.keys(l.vias).map(Number).sort(function (a, b) { return a - b; }); }

  function montagensDisponiveis() {
    var l = L();
    if (!l || !st.vias) return [];
    var v = l.vias[st.vias];
    return Object.keys(C.montagens).filter(function (k) {
      var m = C.montagens[k];
      return !m.flange || (v.recepFlange && st.cor === 'cinza');
    });
  }

  function extrasDisponiveis() {
    var l = L();
    var lista = [];
    if (l && l.chaveExtracao) {
      lista.push({ pn: l.chaveExtracao.pn, nome: l.chaveExtracao.nome, desc: 'Remove terminais tamanho ' + l.tamanhoTerminal + ' (' + l.awg + ') da linha ' + l.nome });
    }
    (C.adicionaisGerais || []).forEach(function (a) { lista.push(a); });
    return lista;
  }

  /* Remove escolhas que deixaram de ser válidas após uma mudança anterior */
  function validar() {
    var l = L();
    if (!l) { st.vias = null; st.montagem = null; st.extras = {}; return; }
    if (st.vias && !l.vias[st.vias]) st.vias = null;
    if (l.cores.indexOf(st.cor) < 0) st.cor = l.cores[0];
    if (st.montagem && montagensDisponiveis().indexOf(st.montagem) < 0) st.montagem = null;
    var lados = ladosFios();
    if (lados.indexOf(st.fios.lado) < 0) st.fios.lado = lados[lados.length - 1] || 'ambos';
    var validos = extrasDisponiveis().map(function (e) { return e.pn; });
    Object.keys(st.extras).forEach(function (pn) { if (validos.indexOf(pn) < 0) delete st.extras[pn]; });
  }

  /* Lados que podem ser montados com fios, conforme a montagem escolhida */
  function ladosFios() {
    if (!st.montagem) return ['ambos'];
    var m = C.montagens[st.montagem];
    if (m.plug && m.recep) return ['plug', 'recep', 'ambos'];
    return [m.plug ? 'plug' : 'recep'];
  }
  function ladoMontado(lado) {
    return st.fios.ativo && (st.fios.lado === 'ambos' || st.fios.lado === lado);
  }
  var NOME_LADO = { plug: 'plug', recep: 'receptáculo', ambos: 'os dois lados' };

  function completo() { return !!(st.linha && st.vias && st.cor && st.montagem && st.terminal); }

  function faltando() {
    var f = [];
    if (!st.linha) f.push('linha');
    if (!st.vias) f.push('vias');
    if (!st.montagem) f.push('montagem');
    if (!st.terminal) f.push('terminal');
    return f;
  }

  /* ================= Lista de peças ================= */
  function pecasDoKit() {
    var l = L();
    if (!completo()) return [];
    var v = l.vias[st.vias];
    var m = C.montagens[st.montagem];
    var t = l.terminais[st.terminal];
    var cor = C.cores[st.cor];
    var tNome = st.terminal === 'solido' ? 'sólido' : 'estampado';
    var preto = st.cor === 'preto' ? ' preto' : '';
    var p = [];
    if (m.plug) {
      p.push({ grupo: 'plug', tipo: 'plug', pn: v.plug + cor.sufixo, nome: 'Plug ' + st.vias + ' vias (terminal fêmea)' + preto, qtd: 1 });
      p.push({ grupo: 'plug', tipo: 'travaS', pn: v.travaPlug, nome: 'Trava (wedgelock) do plug ' + st.vias + ' vias', qtd: 1 });
      p.push({ grupo: 'plug', tipo: 'soquete', pn: t.soquete, nome: 'Terminal fêmea ' + tNome + ' ' + l.awg, qtd: st.vias });
      if (ladoMontado('plug')) p.push(servicoFios('plug', l));
    }
    if (m.recep) {
      if (m.flange) {
        p.push({ grupo: 'recep', tipo: 'recepFlange', pn: v.recepFlange, nome: 'Receptáculo ' + st.vias + ' vias (terminal macho) com flange', qtd: 1 });
      } else {
        p.push({ grupo: 'recep', tipo: 'recep', pn: v.recep + cor.sufixo, nome: 'Receptáculo ' + st.vias + ' vias (terminal macho)' + preto, qtd: 1 });
      }
      p.push({ grupo: 'recep', tipo: 'travaP', pn: v.travaRecep, nome: 'Trava (wedgelock) do receptáculo ' + st.vias + ' vias', qtd: 1 });
      p.push({ grupo: 'recep', tipo: 'pino', pn: t.pino, nome: 'Terminal macho ' + tNome + ' ' + l.awg, qtd: st.vias });
      if (ladoMontado('recep')) p.push(servicoFios('recep', l));
    }
    p.forEach(function (x) { x.vias = st.vias; x.cor = st.cor; });
    return p;
  }

  function servicoFios(lado, l) {
    return { grupo: lado, tipo: 'servico', pn: 'Serviço', servico: true, qtd: 1,
      nome: 'Montagem do ' + NOME_LADO[lado] + ' com ' + st.vias + ' fios ' + l.awg + ' de ' + st.fios.comp };
  }

  /* PN da foto da carcaça de um lado (para a vitrine) */
  function pnLado(lado) {
    var l = L(), v = l.vias[st.vias];
    var m = st.montagem ? C.montagens[st.montagem] : { flange: false };
    var suf = C.cores[st.cor].sufixo;
    if (lado === 'plug') return { pn: v.plug + suf, tipo: 'plug', cor: st.cor };
    return m.flange ? { pn: v.recepFlange, tipo: 'recepFlange', cor: 'cinza' } : { pn: v.recep + suf, tipo: 'recep', cor: st.cor };
  }

  function extrasEscolhidos() {
    return extrasDisponiveis().filter(function (e) { return st.extras[e.pn] > 0; })
      .map(function (e) { return { pn: e.pn, nome: e.nome, qtd: st.extras[e.pn], tipo: 'ferramenta' }; });
  }

  /* ================= Fotos (por PN) com desenho de reserva ================= */
  var extOk = {};       // pn -> extensão encontrada
  var semFoto = {};     // pn -> true quando nenhuma extensão existe

  function caminho(pn, ext) { return C.config.pastaImagens + encodeURIComponent(pn) + '.' + ext; }

  /* alt: PN usado se a foto de "pn" não existir */
  function foto(pn, tipo, vias, cor, classe, alt) {
    if (tipo === 'servico') {
      return '<div class="foto ' + (classe || '') + '"><img src="' + esc(C.montagemFios.fotoExemplo) + '" alt="Montagem com fios"></div>';
    }
    if (alt && semFoto[pn]) return foto(alt, tipo, vias, cor, classe);
    var attrs = ' data-pn="' + esc(pn) + '" data-tipo="' + esc(tipo) + '" data-vias="' + (vias || '') + '" data-cor="' + esc(cor || 'cinza') + '"' +
      (alt ? ' data-alt="' + esc(alt) + '"' : '');
    var inner;
    if (semFoto[pn]) {
      inner = desenho(tipo, vias, cor);
    } else {
      var i = extOk[pn] ? C.config.extensoes.indexOf(extOk[pn]) : 0;
      inner = '<img class="foto-img" alt="' + esc(pn) + '" data-i="' + i + '" src="' + caminho(pn, C.config.extensoes[i]) + '"' + attrs + '>';
    }
    return '<div class="foto ' + (classe || '') + '"' + attrs + '>' + inner + '</div>';
  }

  document.addEventListener('error', function (ev) {
    var img = ev.target;
    if (!img || !img.classList || !img.classList.contains('foto-img')) return;
    var exts = C.config.extensoes;
    var i = Number(img.dataset.i) + 1;
    if (i < exts.length) {
      img.dataset.i = i;
      img.src = caminho(img.dataset.pn, exts[i]);
    } else if (img.dataset.alt) {
      semFoto[img.dataset.pn] = true;
      var alt = img.dataset.alt;
      delete img.dataset.alt;
      img.dataset.pn = alt;
      img.dataset.i = extOk[alt] ? exts.indexOf(extOk[alt]) : 0;
      if (semFoto[alt]) img.outerHTML = desenho(img.dataset.tipo, Number(img.dataset.vias), img.dataset.cor);
      else img.src = caminho(alt, exts[Number(img.dataset.i)]);
    } else {
      semFoto[img.dataset.pn] = true;
      img.outerHTML = desenho(img.dataset.tipo, Number(img.dataset.vias), img.dataset.cor);
    }
  }, true);

  document.addEventListener('load', function (ev) {
    var img = ev.target;
    if (img && img.classList && img.classList.contains('foto-img')) {
      extOk[img.dataset.pn] = C.config.extensoes[Number(img.dataset.i)];
    }
  }, true);

  var GRADE = { 1: [1, 1], 2: [1, 2], 3: [1, 3], 4: [2, 2], 6: [2, 3], 8: [2, 4], 12: [3, 4] };

  function desenho(tipo, vias, cor) {
    var corpo = cor === 'preto' ? '#2b2b2b' : '#aab0b6';
    var corpoEsc = cor === 'preto' ? '#111' : '#8a9096';
    var s = '<svg viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ilustração">';
    if (tipo === 'plug' || tipo === 'recep' || tipo === 'recepFlange') {
      if (tipo === 'recepFlange') {
        s += '<rect x="4" y="28" width="152" height="54" rx="6" fill="' + corpoEsc + '"/>';
        s += '<circle cx="15" cy="55" r="5" fill="#f4f2ee"/><circle cx="145" cy="55" r="5" fill="#f4f2ee"/>';
      }
      s += '<rect x="22" y="16" width="116" height="80" rx="12" fill="' + corpo + '"/>';
      if (tipo === 'plug') s += '<rect x="58" y="6" width="44" height="16" rx="4" fill="' + corpoEsc + '"/>';
      else s += '<rect x="30" y="24" width="100" height="64" rx="8" fill="none" stroke="' + corpoEsc + '" stroke-width="3"/>';
      var g = GRADE[vias] || [2, 3];
      var linhas = g[0], cols = g[1];
      var r = Math.min(9, 40 / cols, 22 / linhas);
      for (var a = 0; a < linhas; a++) {
        for (var b = 0; b < cols; b++) {
          var cx = 34 + (92 / cols) * (b + 0.5);
          var cy = 28 + (56 / linhas) * (a + 0.5);
          if (tipo === 'plug') s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#efece6" stroke="' + corpoEsc + '" stroke-width="1.5"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.38) + '" fill="#555"/>';
          else s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + corpoEsc + '"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.4) + '" fill="#d8d8d8"/>';
        }
      }
    } else if (tipo === 'travaS' || tipo === 'travaP') {
      var c = tipo === 'travaS' ? '#f28c28' : '#3a9b4f';
      s += '<rect x="20" y="32" width="120" height="46" rx="6" fill="' + c + '"/>';
      var n = Math.min(vias || 4, 12);
      for (var k = 0; k < n; k++) {
        var x = 28 + (104 / n) * k + (104 / n) * 0.2;
        s += '<rect x="' + x + '" y="42" width="' + (104 / n) * 0.6 + '" height="26" rx="3" fill="rgba(0,0,0,.22)"/>';
      }
    } else if (tipo === 'pino') {
      s += '<rect x="14" y="48" width="56" height="16" rx="3" fill="#b9bcc0"/><rect x="70" y="51" width="62" height="10" rx="5" fill="#d3d6d9"/><path d="M132 51 l14 5 l-14 5z" fill="#d3d6d9"/>';
    } else if (tipo === 'soquete') {
      s += '<rect x="14" y="48" width="56" height="16" rx="3" fill="#b9bcc0"/><rect x="70" y="45" width="74" height="22" rx="4" fill="#d3d6d9"/><rect x="132" y="50" width="12" height="12" rx="2" fill="#9ea2a6"/>';
    } else {
      s += '<rect x="18" y="48" width="72" height="18" rx="9" fill="#141414"/><rect x="90" y="53" width="56" height="8" rx="3" fill="#c8cbce"/><rect x="18" y="48" width="20" height="18" rx="9" fill="#f26a1b"/>';
    }
    return s + '</svg>';
  }

  /* ================= Renderização dos passos ================= */
  function opc(acao, valor, conteudo, ativo, classe) {
    return '<button type="button" class="opc ' + (classe || '') + '" data-acao="' + acao + '" data-valor="' + esc(valor) + '" aria-pressed="' + (ativo ? 'true' : 'false') + '">' + conteudo + '</button>';
  }

  function passo(num, titulo, feito, bloqueado, atual, corpo, dica, msgBloq) {
    var cls = 'passo' + (feito ? ' passo--feito' : '') + (bloqueado ? ' passo--bloq' : '') + (atual ? ' passo--atual' : '');
    return '<section class="' + cls + '" id="passo-' + num + '">' +
      '<div class="passo__topo"><span class="passo__num">' + (num < 10 ? '0' + num : num) + '</span><h2 class="passo__tit">' + titulo + '</h2></div>' +
      (bloqueado ? '<p class="passo__bloq-msg">' + msgBloq + '</p>' : (dica ? '<p class="passo__dica">' + dica + '</p>' : '') + corpo) +
      '</section>';
  }

  function renderPassos() {
    var l = L();
    var atual = !st.linha ? 1 : !st.vias ? 2 : !st.montagem ? 4 : !st.terminal ? 5 : 0;
    var h = '';

    // 1. Linha
    var linhasHtml = Object.keys(C.linhas).map(function (k) {
      var x = C.linhas[k];
      return opc('linha', k,
        '<span class="opc__tit">' + esc(x.nome) + '</span><span class="opc__desc">' + esc(x.resumo) + '</span>' +
        '<span class="opc__specs"><span class="chip">' + esc(x.awg) + '</span><span class="chip">' + esc(x.corrente) + '</span><span class="chip">' + viasDaLinha(x).join(', ') + ' vias</span></span>',
        st.linha === k);
    }).join('');
    h += passo(1, 'Linha', !!st.linha, false, atual === 1, '<div class="opcoes opcoes--linhas">' + linhasHtml + '</div>', 'Amphenol linha A. Compatível com Deutsch DT, DTM e DTP.');

    // 2. Vias
    var viasHtml = l ? viasDaLinha(l).map(function (n) {
      return opc('vias', n, '<span class="opc__tit">' + n + '</span><span class="opc__desc">vias</span>', st.vias === n, 'opc--via');
    }).join('') : '';
    h += passo(2, 'Quantidade de vias', !!st.vias, !l, atual === 2, '<div class="opcoes opcoes--vias">' + viasHtml + '</div>', 'Número de fios que passam pelo conector.', 'Escolha a linha primeiro.');

    // 3. Cor
    var coresHtml = l ? l.cores.map(function (k) {
      var c = C.cores[k];
      return opc('cor', k, '<span class="amostra" style="background:' + c.hex + '"></span><span class="opc__tit">' + esc(c.nome) + '</span>', st.cor === k, 'opc--cor');
    }).join('') : '';
    var dicaCor = l && l.cores.length > 1 ? 'O preto não encaixa no cinza: use a mesma cor nos dois lados.' : 'Esta linha está disponível somente em cinza.';
    h += passo(3, 'Cor', !!st.vias, !st.vias, false, '<div class="opcoes">' + coresHtml + '</div>', dicaCor, 'Escolha as vias primeiro.');

    // 4. Montagem
    var mHtml = montagensDisponiveis().map(function (k) {
      var m = C.montagens[k];
      return opc('montagem', k, '<span class="opc__tit">' + esc(m.nome) + '</span><span class="opc__desc">' + esc(m.desc) + '</span>', st.montagem === k);
    }).join('');
    var dicaM = st.cor === 'preto' ? 'Opções com flange disponíveis somente em cinza.' : 'O plug é o lado fêmea e leva terminais fêmea; o receptáculo é o lado macho e leva terminais macho.';
    h += passo(4, 'O que você precisa', !!st.montagem, !st.vias, atual === 4, '<div class="opcoes">' + mHtml + '</div>', dicaM, 'Escolha as vias primeiro.');

    // 5. Terminal
    var tHtml = Object.keys(C.terminais).map(function (k) {
      var t = C.terminais[k];
      return opc('terminal', k, '<span class="opc__tit">' + esc(t.nome) + '</span><span class="opc__desc">' + esc(t.desc) + '</span>' +
        (l ? '<span class="opc__specs"><span class="chip">' + esc(l.awg) + '</span><span class="chip">Níquel</span><span class="chip">Tam. ' + l.tamanhoTerminal + '</span></span>' : ''), st.terminal === k);
    }).join('');
    var dicaT = st.vias ? 'A quantidade de terminais é calculada automaticamente: ' + st.vias + ' por lado.' : '';
    h += passo(5, 'Terminal', !!st.terminal, !st.montagem, atual === 5, '<div class="opcoes">' + tHtml + '</div>', dicaT, 'Escolha o que você precisa primeiro.');

    // 6. Adicionais
    var eHtml = extrasDisponiveis().map(function (e) {
      var q = st.extras[e.pn] || 0;
      return '<div class="extra' + (q ? ' extra--on' : '') + '">' + foto(e.pn, 'ferramenta', 0, '', 'extra__foto') +
        '<div class="extra__info"><div class="extra__nome">' + esc(e.nome) + '</div><div class="extra__pn">' + esc(e.pn) + '</div>' +
        (e.desc ? '<div class="opc__desc">' + esc(e.desc) + '</div>' : '') + '</div>' +
        contador('extra', e.pn, q, 0) + '</div>';
    }).join('');
    h += passo(6, 'Adicionais (opcional)', Object.keys(st.extras).length > 0, !st.linha, false, '<div class="extras">' + eHtml + '</div>', 'Ferramentas para montagem e manutenção. Não são multiplicadas pela quantidade de kits.', 'Escolha a linha primeiro.');

    // 7. Montado com fios
    if (C.montagemFios) {
      var mf = C.montagemFios;
      var fHtml = '<div class="opcoes">' +
        opc('fiosAtivo', 'nao', '<span class="opc__tit">Somente as peças</span><span class="opc__desc">Você monta: recebe carcaças, travas e terminais soltos</span>', !st.fios.ativo) +
        opc('fiosAtivo', 'sim', '<span class="opc__tit">Montado com fios</span><span class="opc__desc">Entregamos o conector pronto, com os fios ' + (l ? esc(l.awg) + ' ' : '') + 'crimpados</span>', st.fios.ativo) +
        '</div>';
      if (st.fios.ativo) {
        var lados = ladosFios();
        if (lados.length > 1) {
          fHtml += '<p class="sub-tit">Qual lado montar?</p><div class="opcoes">' + lados.map(function (k) {
            var t = k === 'ambos' ? 'Os dois lados' : k === 'plug' ? 'Só o plug' : 'Só o receptáculo';
            return opc('fiosLado', k, '<span class="opc__tit">' + t + '</span>', st.fios.lado === k);
          }).join('') + '</div>';
        }
        fHtml += '<p class="sub-tit">Comprimento dos fios</p><div class="opcoes opcoes--vias">' + mf.comprimentos.map(function (c) {
          return opc('fiosComp', c, '<span class="opc__tit" style="font-size:20px">' + esc(c) + '</span>', st.fios.comp === c, 'opc--via');
        }).join('') + '</div><p class="passo__aviso">' + esc(mf.aviso) + '</p>';
      }
      h += passo(7, 'Montado com fios (opcional)', st.fios.ativo, !st.terminal, false, fHtml,
        'Prefere receber o conector já montado? Crimpamos os terminais nos fios e montamos para você.', 'Escolha o terminal primeiro.');
    }

    $('#passos').innerHTML = h;
  }

  function contador(acao, chave, valor, min) {
    return '<div class="qtd" data-acao="' + acao + '" data-chave="' + esc(chave) + '" data-min="' + min + '">' +
      '<button type="button" data-delta="-1" aria-label="Diminuir">−</button>' +
      '<input type="number" inputmode="numeric" min="' + min + '" value="' + valor + '" aria-label="Quantidade">' +
      '<button type="button" data-delta="1" aria-label="Aumentar">+</button></div>';
  }

  /* ================= Painel do kit ================= */
  function renderKit() {
    var l = L();
    var h = '<div class="kit__topo"><h2>SEU KIT</h2>' + (st.linha ? '<button class="kit__reset" type="button" data-acao="recomecar">Recomeçar</button>' : '') + '</div>';

    // Vitrine
    h += '<div class="kit__vitrine">';
    if (!l || !st.vias) {
      h += '<p class="kit__vazio">' + (l ? 'Escolha a quantidade de vias para ver o conector.' : 'Escolha uma linha para começar a montar.') + '</p>';
    } else {
      var m = st.montagem ? C.montagens[st.montagem] : { plug: true, recep: true, flange: false };
      ['plug', 'recep'].forEach(function (lado) {
        if (!m[lado]) return;
        var f = pnLado(lado);
        if (ladoMontado(lado)) {
          h += '<div class="vit-item">' + foto(f.pn, f.tipo, st.vias, f.cor) + '<span class="selo">Montado com fios</span></div>';
        } else {
          h += foto(f.pn, f.tipo, st.vias, f.cor);
        }
      });
    }
    h += '</div>';
    if (st.fios.ativo && st.vias) {
      h += '<div class="kit__exemplo"><img src="' + esc(C.montagemFios.fotoExemplo) + '" alt="Exemplo de conector montado com fios">' +
        '<p><strong>Exemplo de conector montado.</strong> O seu vem com ' + st.vias + ' fios de ' + esc(st.fios.comp) + ', no modelo escolhido.</p></div>';
    }

    // Resumo
    if (l) {
      var chips = [l.nome];
      if (st.vias) chips.push(st.vias + ' vias', C.cores[st.cor].nome);
      if (st.montagem) chips.push(C.montagens[st.montagem].nome);
      if (st.terminal) chips.push('Terminal ' + C.terminais[st.terminal].nome.split(' ')[0].toLowerCase());
      if (st.fios.ativo && st.terminal) chips.push('Montado: ' + NOME_LADO[st.fios.lado] + ', ' + st.fios.comp);
      h += '<div class="kit__resumo">' + chips.map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('') + '</div>';
    }

    // Lista
    var pecas = pecasDoKit();
    var extras = extrasEscolhidos();
    if (pecas.length || extras.length) {
      h += '<ul class="kit__lista">';
      var grupoAtual = null;
      var nomes = { plug: 'Lado plug (terminal fêmea)', recep: 'Lado receptáculo (terminal macho)' };
      pecas.forEach(function (p) {
        if (p.grupo !== grupoAtual) { grupoAtual = p.grupo; h += '<li class="kit__grupo">' + nomes[p.grupo] + '</li>'; }
        h += linhaPeca(p, p.qtd * st.kits);
      });
      if (extras.length) {
        h += '<li class="kit__grupo">Adicionais</li>';
        extras.forEach(function (e) { h += linhaPeca(e, e.qtd); });
      }
      h += '</ul>';
    }

    // Rodapé
    h += '<div class="kit__rodape">';
    h += '<div class="kit__qtdlinha"><label>Quantidade de kits</label>' + contador('kits', 'kits', st.kits, 1) + '</div>';
    h += '<button class="btn btn--pri" type="button" data-acao="adicionar"' + (completo() ? '' : ' disabled') + '>Adicionar ao orçamento</button>';
    if (!completo()) h += '<p class="kit__aviso">Falta escolher: ' + faltando().join(', ') + '.</p>';
    else if (st.kits > 1) h += '<p class="kit__aviso">Quantidades já multiplicadas por ' + st.kits + ' kits.</p>';
    h += '</div>';

    $('#kit').innerHTML = h;
    renderBarraMob();
  }

  function renderBarraMob() {
    var bar = $('#barraMob');
    var l = L();
    if (!l || !st.vias) { bar.hidden = true; return; }
    var m = st.montagem ? C.montagens[st.montagem] : { plug: true, recep: true, flange: false };
    var lado = m.plug ? 'plug' : 'recep';
    var f = pnLado(lado);
    var principal = foto(f.pn, f.tipo, st.vias, f.cor);
    var n = pecasDoKit().length + extrasEscolhidos().length;
    bar.innerHTML = principal + '<div class="barra-mob__txt"><strong>' + esc(l.nome + ' ' + st.vias + ' vias') + '</strong>' +
      (completo() ? n + ' itens no kit' : 'Falta: ' + faltando().join(', ')) + '</div>' +
      '<button class="btn ' + (completo() ? 'btn--pri' : 'btn--sec') + '" type="button" data-acao="verKit">Ver kit</button>';
    bar.hidden = false;
  }

  function linhaPeca(p, qtd) {
    return '<li class="peca' + (p.servico ? ' peca--serv' : '') + '">' + foto(p.pn, p.tipo, p.vias, p.cor, 'peca__foto') +
      '<div class="peca__info"><div class="peca__nome">' + esc(p.nome) + '</div><div class="peca__pn">' + esc(p.pn) + '</div></div>' +
      '<div class="peca__qtd">× ' + qtd + '</div></li>';
  }

  /* ================= Orçamento (carrinho) ================= */
  function carregarOrcamento() {
    try { return JSON.parse(localStorage.getItem(CHAVE_LS)) || []; } catch (e) { return []; }
  }
  function salvarOrcamento() {
    try { localStorage.setItem(CHAVE_LS, JSON.stringify(orcamento)); } catch (e) { /* navegação privada */ }
    $('#contadorOrc').textContent = orcamento.length;
  }

  function adicionarAoOrcamento() {
    if (!completo()) return;
    var l = L();
    var m = C.montagens[st.montagem];
    var pecas = pecasDoKit();
    orcamento.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      titulo: l.nome + ' ' + st.vias + ' vias — ' + m.nome + (st.fios.ativo ? ' + montado com fios' : ''),
      sub: 'Terminal ' + C.terminais[st.terminal].nome.toLowerCase() + ' · ' + l.awg + ' · ' + C.cores[st.cor].nome +
        (st.fios.ativo ? ' · Fios de ' + st.fios.comp + ' (' + NOME_LADO[st.fios.lado] + ')' : ''),
      principal: { pn: pecas[0].pn, tipo: pecas[0].tipo, vias: st.vias, cor: st.cor },
      kits: st.kits,
      pecas: pecas.map(function (p) { return { pn: p.pn, nome: p.nome, qtd: p.qtd, tipo: p.tipo, vias: p.vias, cor: p.cor, servico: !!p.servico }; }),
      extras: extrasEscolhidos()
    });
    salvarOrcamento();
    toast('Kit adicionado ao orçamento.', [
      ['Ver orçamento', abrirGaveta],
      ['Montar outro', recomecar]
    ]);
  }

  function consolidado() {
    var mapa = {}, ordem = [];
    orcamento.forEach(function (it) {
      it.pecas.forEach(function (p) { somar(p.pn, p.nome, p.qtd * it.kits); });
      (it.extras || []).forEach(function (e) { somar(e.pn, e.nome, e.qtd); });
    });
    function somar(pn, nome, q) {
      var k = pn + '|' + nome;
      if (!mapa[k]) { mapa[k] = { pn: pn, nome: nome, qtd: 0 }; ordem.push(k); }
      mapa[k].qtd += q;
    }
    return ordem.map(function (k) { return mapa[k]; });
  }

  var estadoEnvio = null; // null | 'enviando' | {ok, msg}

  function renderGaveta() {
    var h = '';
    if (estadoEnvio && estadoEnvio.ok) {
      $('#gavetaCorpo').innerHTML = '<div class="msg msg--ok"><strong>Solicitação enviada!</strong><br>' + esc(estadoEnvio.msg) + '</div>' +
        '<button class="btn btn--pri" type="button" data-fechar>Voltar ao configurador</button>';
      return;
    }
    if (!orcamento.length) {
      $('#gavetaCorpo').innerHTML = '<div class="vazio"><p>Seu orçamento está vazio.</p><button class="btn btn--pri" type="button" data-fechar>Montar um conector</button></div>';
      return;
    }
    orcamento.forEach(function (it) {
      var p = it.principal;
      h += '<article class="item"><div class="item__topo">' + foto(p.pn, p.tipo, p.vias, p.cor, 'item__foto', p.alt) +
        '<div class="item__info"><div class="item__tit">' + esc(it.titulo) + '</div><div class="item__sub">' + esc(it.sub) + '</div></div></div>' +
        '<details><summary>Peças deste item</summary><table class="tabela"><thead><tr><th>PN</th><th>Descrição</th><th style="text-align:right">Qtd</th></tr></thead><tbody>' +
        it.pecas.map(function (x) { return '<tr><td class="mono">' + esc(x.pn) + '</td><td>' + esc(x.nome) + '</td><td class="n">' + (x.qtd * it.kits) + '</td></tr>'; }).join('') +
        (it.extras || []).map(function (x) { return '<tr><td class="mono">' + esc(x.pn) + '</td><td>' + esc(x.nome) + '</td><td class="n">' + x.qtd + '</td></tr>'; }).join('') +
        '</tbody></table></details>' +
        '<div class="item__acoes"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:14px;font-weight:600">Kits</span>' + contador('itemKits', it.id, it.kits, 1) + '</div>' +
        '<button class="link link--rem" type="button" data-acao="remover" data-valor="' + it.id + '">Remover</button></div></article>';
    });

    h += '<button class="btn btn--sec" type="button" data-fechar>+ Montar outro conector</button>';

    var cons = consolidado();
    h += '<section class="bloco"><h3>Lista de peças</h3><table class="tabela"><thead><tr><th>PN</th><th>Descrição</th><th style="text-align:right">Total</th></tr></thead><tbody>' +
      cons.map(function (x) { return '<tr><td class="mono">' + esc(x.pn) + '</td><td>' + esc(x.nome) + '</td><td class="n">' + x.qtd + '</td></tr>'; }).join('') +
      '</tbody></table></section>';

    var erro = estadoEnvio && estadoEnvio.ok === false ? '<div class="msg msg--erro cheio">' + esc(estadoEnvio.msg) + '</div>' : '';
    var enviando = estadoEnvio === 'enviando';
    h += '<section class="bloco"><h3>Seus dados</h3><form class="form" id="formOrc" novalidate>' +
      campo('nome', 'Nome *', 'text', 'name', true) +
      campo('empresa', 'Empresa', 'text', 'organization') +
      campo('documento', 'CNPJ / CPF', 'text', 'off') +
      campo('cidade', 'Cidade / UF', 'text', 'address-level2') +
      campo('email', 'E-mail *', 'email', 'email', true) +
      campo('telefone', 'WhatsApp / Telefone *', 'tel', 'tel', true) +
      '<label class="cheio">Observações<textarea name="observacoes" placeholder="Aplicação, prazo, dúvidas…"></textarea></label>' +
      erro +
      '<div class="botoes cheio"><button class="btn btn--pri" type="submit"' + (enviando ? ' disabled' : '') + '>' + (enviando ? 'Enviando…' : 'Solicitar orçamento') + '</button>' +
      (C.config.whatsapp ? '<button class="btn btn--zap" type="button" data-acao="whatsapp">Enviar pelo WhatsApp</button>' : '') +
      '</div></form></section>';

    var dados = lerFormSalvo();
    $('#gavetaCorpo').innerHTML = h;
    var f = $('#formOrc');
    Object.keys(dados).forEach(function (k) { if (f.elements[k]) f.elements[k].value = dados[k]; });
  }

  function campo(nome, rotulo, tipo, auto, obrig) {
    return '<label>' + rotulo + '<input name="' + nome + '" type="' + tipo + '" autocomplete="' + auto + '"' + (obrig ? ' required' : '') + '></label>';
  }

  var formSalvo = {};
  function lerFormSalvo() { return formSalvo; }
  function guardarForm() {
    var f = $('#formOrc');
    if (!f) return;
    formSalvo = {};
    Array.prototype.forEach.call(f.elements, function (el) { if (el.name) formSalvo[el.name] = el.value; });
  }

  function textoPedido() {
    var t = '';
    orcamento.forEach(function (it, i) {
      t += 'ITEM ' + (i + 1) + ': ' + it.titulo + ' (' + it.sub + ') — ' + it.kits + ' kit(s)\n';
      it.pecas.forEach(function (p) { t += '   ' + p.pn + '  ' + p.nome + '  x' + (p.qtd * it.kits) + '\n'; });
      (it.extras || []).forEach(function (e) { t += '   ' + e.pn + '  ' + e.nome + '  x' + e.qtd + '\n'; });
      t += '\n';
    });
    return t.trim();
  }
  function textoConsolidado() {
    return consolidado().map(function (x) { return x.pn + '  ' + x.nome + '  x' + x.qtd; }).join('\n');
  }

  function enviar(form) {
    guardarForm();
    var d = formSalvo;
    var faltam = [];
    if (!d.nome || !d.nome.trim()) faltam.push('nome');
    if (!d.email || !/^\S+@\S+\.\S+$/.test(d.email)) faltam.push('e-mail válido');
    if (!d.telefone || d.telefone.replace(/\D/g, '').length < 10) faltam.push('WhatsApp/telefone com DDD');
    if (faltam.length) { estadoEnvio = { ok: false, msg: 'Preencha: ' + faltam.join(', ') + '.' }; renderGaveta(); return; }

    var destino = C.config.emailDestino;
    if (!destino || /SEU-EMAIL/i.test(destino)) {
      estadoEnvio = { ok: false, msg: 'E-mail de destino não configurado. Defina config.emailDestino em configurador/catalogo.js.' };
      renderGaveta();
      return;
    }

    estadoEnvio = 'enviando';
    renderGaveta();

    var payload = {
      _subject: C.config.assuntoEmail,
      _template: 'table',
      _captcha: 'false',
      Nome: d.nome, Empresa: d.empresa || '-', 'CNPJ/CPF': d.documento || '-', 'Cidade/UF': d.cidade || '-',
      email: d.email, 'WhatsApp/Telefone': d.telefone, 'Observações': d.observacoes || '-',
      'Itens montados': textoPedido(),
      'Lista consolidada de peças': textoConsolidado()
    };

    fetch('https://formsubmit.co/ajax/' + encodeURIComponent(destino), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (res) {
        if (String(res.success) === 'true') {
          orcamento = []; salvarOrcamento();
          estadoEnvio = { ok: true, msg: 'Recebemos seu pedido e retornaremos em breve pelo e-mail ou WhatsApp informado.' };
        } else {
          estadoEnvio = { ok: false, msg: 'Não foi possível enviar agora' + (res.message ? ' (' + res.message + ')' : '') + '. Tente novamente ou fale conosco pelo WhatsApp.' };
        }
        renderGaveta();
      })
      .catch(function () {
        estadoEnvio = { ok: false, msg: 'Falha de conexão. Verifique sua internet e tente novamente.' };
        renderGaveta();
      });
  }

  function enviarWhatsapp() {
    guardarForm();
    var d = formSalvo;
    var txt = 'Olá! Gostaria de um orçamento:\n\n' + textoPedido() + '\n\nLISTA CONSOLIDADA\n' + textoConsolidado() +
      (d.nome ? '\n\nNome: ' + d.nome : '') + (d.empresa ? '\nEmpresa: ' + d.empresa : '');
    window.open('https://wa.me/' + C.config.whatsapp + '?text=' + encodeURIComponent(txt), '_blank', 'noopener');
  }

  /* ================= Gaveta / toast ================= */
  function abrirGaveta() {
    if (estadoEnvio && estadoEnvio.ok) estadoEnvio = null;
    renderGaveta();
    $('#gaveta').hidden = false;
    document.body.style.overflow = 'hidden';
    var t = $('#toast'); t.hidden = true;
    setTimeout(function () { var b = $('.fechar'); if (b) b.focus(); }, 30);
  }
  function fecharGaveta() {
    guardarForm();
    $('#gaveta').hidden = true;
    document.body.style.overflow = '';
    if (estadoEnvio && estadoEnvio.ok) estadoEnvio = null;
  }

  var timerToast;
  function toast(msg, acoes) {
    var t = $('#toast');
    t.innerHTML = '<span>' + esc(msg) + '</span>' + (acoes || []).map(function (a, i) {
      return '<button class="link" type="button" data-toast="' + i + '">' + esc(a[0]) + '</button>';
    }).join('');
    t.hidden = false;
    t.onclick = function (ev) {
      var b = ev.target.closest('[data-toast]');
      if (b) { t.hidden = true; acoes[Number(b.dataset.toast)][1](); }
    };
    clearTimeout(timerToast);
    timerToast = setTimeout(function () { t.hidden = true; }, 6000);
  }

  function recomecar() {
    st = novoEstado();
    render();
    $('#passo-1').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ================= Eventos ================= */
  function render() {
    validar();
    var foco = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset : null;
    var chaveFoco = foco && foco.acao ? foco.acao + '|' + foco.valor : null;
    renderPassos();
    renderKit();
    if (chaveFoco) {
      var p = chaveFoco.split('|');
      var el = document.querySelector('[data-acao="' + p[0] + '"][data-valor="' + p[1] + '"]');
      if (el) el.focus({ preventScroll: true });
    }
  }

  function irParaProximo(antes) {
    var depois = !st.linha ? 1 : !st.vias ? 2 : !st.montagem ? 4 : !st.terminal ? 5 : 6;
    if (depois !== antes) {
      var el = $('#passo-' + depois);
      if (!el) return;
      var r = el.getBoundingClientRect();
      if (r.top < 70 || r.top > window.innerHeight * 0.7) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function passoAtual() { return !st.linha ? 1 : !st.vias ? 2 : !st.montagem ? 4 : !st.terminal ? 5 : 6; }

  document.addEventListener('click', function (ev) {
    var fechar = ev.target.closest('[data-fechar]');
    if (fechar) { fecharGaveta(); return; }

    var delta = ev.target.closest('[data-delta]');
    if (delta) {
      var box = delta.closest('.qtd');
      var inp = box.querySelector('input');
      inp.value = Math.max(Number(box.dataset.min), (Number(inp.value) || 0) + Number(delta.dataset.delta));
      aplicarContador(box, Number(inp.value));
      return;
    }

    var b = ev.target.closest('[data-acao]');
    if (!b || b.classList.contains('qtd')) return;
    var acao = b.dataset.acao, valor = b.dataset.valor;
    var antes = passoAtual();
    switch (acao) {
      case 'linha': st.linha = valor; break;
      case 'vias': st.vias = Number(valor); break;
      case 'cor': st.cor = valor; break;
      case 'montagem': st.montagem = valor; break;
      case 'terminal': st.terminal = valor; break;
      case 'fiosAtivo': st.fios.ativo = valor === 'sim'; break;
      case 'fiosLado': st.fios.lado = valor; break;
      case 'fiosComp': st.fios.comp = valor; break;
      case 'recomecar': recomecar(); return;
      case 'adicionar': adicionarAoOrcamento(); return;
      case 'remover':
        orcamento = orcamento.filter(function (it) { return it.id !== valor; });
        salvarOrcamento(); guardarForm(); renderGaveta(); return;
      case 'whatsapp': enviarWhatsapp(); return;
      case 'verKit': $('#kit').scrollIntoView({ behavior: 'smooth', block: 'start' }); return;
      default: return;
    }
    render();
    irParaProximo(antes);
  });

  document.addEventListener('change', function (ev) {
    var box = ev.target.closest('.qtd');
    if (!box) return;
    var v = Math.max(Number(box.dataset.min), Math.floor(Number(ev.target.value) || 0));
    ev.target.value = v;
    aplicarContador(box, v);
  });

  function aplicarContador(box, v) {
    var acao = box.dataset.acao, chave = box.dataset.chave;
    if (acao === 'kits') { st.kits = Math.max(1, v); renderKit(); }
    else if (acao === 'extra') {
      if (v > 0) st.extras[chave] = v; else delete st.extras[chave];
      renderPassos(); renderKit();
    } else if (acao === 'itemKits') {
      orcamento.forEach(function (it) { if (it.id === chave) it.kits = Math.max(1, v); });
      salvarOrcamento(); guardarForm(); renderGaveta();
    }
  }

  document.addEventListener('submit', function (ev) {
    if (ev.target.id === 'formOrc') { ev.preventDefault(); enviar(ev.target); }
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !$('#gaveta').hidden) fecharGaveta();
  });

  $('#abrirOrcamento').addEventListener('click', abrirGaveta);

  /* ================= Início ================= */
  salvarOrcamento();
  render();
})();

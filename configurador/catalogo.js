/* =====================================================================
   BOX DO CONECTOR — Catálogo do configurador "Monte seu conector"
   ---------------------------------------------------------------------
   Este é o ÚNICO arquivo que precisa ser editado para adicionar/alterar
   produtos. O código do configurador lê tudo daqui.

   Fotos: coloque em /img/pn/ com o nome exatamente igual ao PN.
   Ex.: img/pn/AT06-4S.webp  (aceita .webp, .jpg ou .png)

   ===================================================================== */

window.CATALOGO = {

  /* ---------- Configurações gerais ---------- */
  config: {
    pastaImagens: "img/pn/",
    extensoes: ["webp", "jpg", "png"],

    // E-mail que recebe as solicitações (via FormSubmit.co).
    // Na 1ª solicitação o FormSubmit envia um e-mail de ativação para este endereço.
    emailDestino: "boxdoconector@gmail.com",
    assuntoEmail: "Nova solicitação de orçamento — Monte seu conector",
    whatsapp: "5548991429569" // mostra o botão "Enviar pelo WhatsApp" (deixe "" para esconder)
  },

  /* ---------- Cores ---------- */
  cores: {
    cinza: { nome: "Cinza", hex: "#9aa0a6", sufixo: "" },
    preto: { nome: "Preto", hex: "#1c1c1c", sufixo: "-BLK" }
  },

  /* ---------- Tipos de montagem ---------- */
  montagens: {
    par:           { nome: "Par completo",              desc: "Plug + receptáculo, com travas e terminais dos dois lados", plug: true,  recep: true,  flange: false },
    plug:          { nome: "Somente plug (terminal fêmea)",      desc: "Carcaça plug + trava + terminais fêmea",                  plug: true,  recep: false, flange: false },
    recep:         { nome: "Somente receptáculo (terminal macho)", desc: "Carcaça receptáculo + trava + terminais macho",           plug: false, recep: true,  flange: false },
    parFlange:     { nome: "Par com flange",            desc: "Plug + receptáculo com flange para fixação em painel",      plug: true,  recep: true,  flange: true  },
    recepFlange:   { nome: "Somente receptáculo com flange", desc: "Receptáculo flangeado + trava + terminais macho",       plug: false, recep: true,  flange: true  }
  },

  /* ---------- Tipos de terminal ---------- */
  terminais: {
    solido:    { nome: "Sólido (usinado)", desc: "Maior robustez. Crimpagem com alicate de 4 identações." },
    estampado: { nome: "Estampado",        desc: "Mais econômico. Crimpagem com alicate de terminal estampado." }
  },

  /* ---------- Linhas ---------- */
  linhas: {

    AT: {
      nome: "AT",
      resumo: "Linha padrão, a mais usada em máquinas agrícolas",
      tamanhoTerminal: 16,
      awg: "16 AWG",
      corrente: "13 A",
      cores: ["cinza", "preto"],
      vias: {
        2:  { plug: "AT06-2S",   travaPlug: "AW2S",  recep: "AT04-2P",   travaRecep: "AW2P",  recepFlange: "AT04-2P-L012" },
        3:  { plug: "AT06-3S",   travaPlug: "AW3S",  recep: "AT04-3P",   travaRecep: "AW3P",  recepFlange: "AT04-3P-L012" },
        4:  { plug: "AT06-4S",   travaPlug: "AW4S",  recep: "AT04-4P",   travaRecep: "AW4P",  recepFlange: "AT04-4P-L012" },
        6:  { plug: "AT06-6S",   travaPlug: "AW6S",  recep: "AT04-6P",   travaRecep: "AW6P",  recepFlange: "AT04-6P-L012" },
        8:  { plug: "AT06-08SA", travaPlug: "AW8S",  recep: "AT04-08PA", travaRecep: "AW8P",  recepFlange: "AT04-08PA-L012" },
        12: { plug: "AT06-12SA", travaPlug: "AW12S", recep: "AT04-12PA", travaRecep: "AW12P", recepFlange: "AT04-12PA-L012" }
      },
      terminais: {
        solido:    { pino: "AT60-202-16141", soquete: "AT62-201-16141" },
        estampado: { pino: "AT60-16-0122",   soquete: "AT62-16-0122" }
      },
      chaveExtracao: { pn: "AT11-310-1605", nome: "Chave de extração tamanho 16" }
    },

    ATM: {
      nome: "ATM",
      resumo: "Linha compacta, para fios mais finos e sinais",
      tamanhoTerminal: 20,
      awg: "20 AWG",
      corrente: "7,5 A",
      cores: ["cinza"],
      vias: {
        2:  { plug: "ATM06-2S",   travaPlug: "AWM-2S",  recep: "ATM04-2P",   travaRecep: "AWM-2P" },
        3:  { plug: "ATM06-3S",   travaPlug: "AWM-3S",  recep: "ATM04-3P",   travaRecep: "AWM-3P" },
        4:  { plug: "ATM06-4S",   travaPlug: "AWM-4S",  recep: "ATM04-4P",   travaRecep: "AWM-4P" },
        6:  { plug: "ATM06-6S",   travaPlug: "AWM-6S",  recep: "ATM04-6P",   travaRecep: "AWM-6P" },
        8:  { plug: "ATM06-08SA", travaPlug: "AWM-8S",  recep: "ATM04-08PA", travaRecep: "AWM-8P" },
        12: { plug: "ATM06-12SA", travaPlug: "AWM-12S", recep: "ATM04-12PA", travaRecep: "AWM-12P" }
      },
      terminais: {
        solido:    { pino: "AT60-202-20141", soquete: "AT62-201-20141" },
        estampado: { pino: "AT60-20-0122",   soquete: "AT62-20-0122" }
      },
      chaveExtracao: { pn: "AT11-240-2005", nome: "Chave de extração tamanho 20" }
    },

    ATP: {
      nome: "ATP",
      resumo: "Linha de potência, para cargas maiores",
      tamanhoTerminal: 12,
      awg: "12 AWG",
      corrente: "25 A",
      cores: ["cinza"],
      vias: {
        2: { plug: "ATP06-2S", travaPlug: "AWP-2S", recep: "ATP04-2P", travaRecep: "AWP-2P" },
        4: { plug: "ATP06-4S", travaPlug: "AWP-4S", recep: "ATP04-4P", travaRecep: "AWP-4P" }
      },
      terminais: {
        solido:    { pino: "AT60-204-12141", soquete: "AT62-203-12141" },
        estampado: { pino: "AT60-12-0166",   soquete: "AT62-12-0166" }
      },
      chaveExtracao: { pn: "AT11-337-1205", nome: "Chave de extração tamanho 12" }
    }
  },

  /* ---------- Conector montado com fios ---------- */
  montagemFios: {
    comprimentos: ["20 cm", "40 cm", "1 m"],
    padrao: "40 cm",
    fotoExemplo: "img/exemplos/montado-exemplo.webp",
    aviso: "Fios já crimpados nos terminais, em cores padrão. Precisa de outro comprimento ou de cores específicas? Informe nas observações do orçamento."
  },

  /* ---------- Adicionais comuns a todas as linhas ---------- */
  adicionaisGerais: [
    { pn: "ATRT-100", nome: "Chave ATRT-100", desc: "Ferramenta de remoção de terminais e travas (AT, ATM e ATP)" }
  ]
};

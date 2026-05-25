/**
 * Exportar Anotações — Legislação Institucional do PJSC
 *
 * Cole este script no console do navegador enquanto o dashboard
 * (index.html) estiver aberto. Ele usa os dados já carregados
 * em memória pelo app e faz o download de um .txt organizado.
 */
(async () => {
  // ── 1. Buscar as notas (re-faz a requisição para garantir dados frescos) ──
  const SUPA_URL = 'https://plwspyrxxygpkqhvzvkc.supabase.co/rest/v1/analista_tjsc';
  const SUPA_KEY = 'sb_publishable_5Dkhtq3HcMjNyAHdv5zATA_STS6OjU9';
  const MATERIA  = 'Legislação Institucional do PJSC';

  let notas;
  try {
    const res = await fetch(
      SUPA_URL + '?select=*&materia_anl=eq.' + encodeURIComponent(MATERIA) + '&order=assunto_anl.asc,id.asc',
      { headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY } }
    );
    notas = await res.json();
  } catch (err) {
    alert('Erro ao buscar notas: ' + err.message);
    return;
  }

  if (!Array.isArray(notas) || notas.length === 0) {
    alert('Nenhuma anotação encontrada para ' + MATERIA);
    return;
  }

  // ── 2. Agrupar por assunto ──
  const grupos = {};
  notas.forEach(n => {
    const ass = (n.assunto_anl || 'Sem assunto').trim();
    if (!grupos[ass]) grupos[ass] = [];
    grupos[ass].push(n);
  });

  // ── 3. Montar o documento de texto ──
  const SEP  = '═'.repeat(72);
  const SEP2 = '─'.repeat(72);
  const hoje = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });

  let doc = [];
  doc.push(SEP);
  doc.push('  ANOTAÇÕES DE ESTUDO — LEGISLAÇÃO INSTITUCIONAL DO PJSC');
  doc.push('  Exportado em: ' + hoje);
  doc.push('  Total de anotações: ' + notas.length);
  doc.push(SEP);
  doc.push('');

  const assuntos = Object.keys(grupos).sort();
  assuntos.forEach((ass, idx) => {
    const itens = grupos[ass];
    doc.push(`[${idx + 1}] ${ass.toUpperCase()}`);
    doc.push(SEP2);
    itens.forEach((n, i) => {
      // Converte **bold** e *italic* para texto puro
      const texto = (n.topicos_anl || '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .trim();
      const ref = n.ref_anl ? ` [${n.ref_anl}]` : '';
      doc.push(`${i + 1}. (ID #${n.id}${ref})`);
      // Indenta cada linha do texto
      texto.split('\n').forEach(linha => doc.push('   ' + linha));
      if (i < itens.length - 1) doc.push('');
    });
    doc.push('');
    doc.push('');
  });

  doc.push(SEP);
  doc.push('  Fim do documento');
  doc.push(SEP);

  // ── 4. Download ──
  const conteudo = doc.join('\n');
  const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'Anotacoes_LegislacaoPJSC_' + new Date().toISOString().slice(0,10) + '.txt';
  a.click();
  URL.revokeObjectURL(url);

  console.log(`✅ Exportadas ${notas.length} anotações em ${assuntos.length} assunto(s).`);
  console.table(assuntos.map(a => ({ assunto: a, qtd: grupos[a].length })));
})();

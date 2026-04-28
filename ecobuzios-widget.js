// EcoBuzios KPIs - Scriptable widget
// iPhone + macOS. Tamanhos: small, medium, large.

const API = "https://ixgujnhdjrgoakqzdkgx.supabase.co/functions/v1/public-stats-api";
const API_KEY = "c04248b422b59e718e8115a66286b1f9a56f5f447b44354128ad7406ebb50752";

async function fetchStats() {
  const req = new Request(API);
  req.headers = { "x-api-key": API_KEY };
  return await req.loadJSON();
}

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

async function buildWidget() {
  const w = new ListWidget();
  w.backgroundColor = new Color("#f8f9fa");
  w.setPadding(14, 14, 14, 14);

  let data;
  try {
    data = await fetchStats();
  } catch (e) {
    const err = w.addText("Erro ao carregar");
    err.textColor = Color.red();
    return w;
  }

  // Header
  const header = w.addStack();
  header.layoutHorizontally();
  const title = header.addText("ECOBUZIOS");
  title.font = Font.boldSystemFont(14);
  title.textColor = new Color("#0891b2");
  header.addSpacer();
  const time = header.addText(fmtTime(data.gerado_em));
  time.font = Font.systemFont(9);
  time.textColor = new Color("#94a3b8");

  w.addSpacer(6);

  // Big number — total alunos
  const big = w.addText(String(data.total_alunos_em_turmas));
  big.font = Font.boldRoundedSystemFont(38);
  big.textColor = new Color("#0891b2");

  const sub = w.addText("alunos em turmas");
  sub.font = Font.systemFont(11);
  sub.textColor = new Color("#64748b");

  w.addSpacer(8);

  // % Escolas Públicas (agregado)
  const instit = data.instituicao?.find(i => i.name === "Pública");
  const pctPublico = instit ? Math.round((instit.value / data.total_alunos_em_turmas) * 100) : 0;

  const pubRow = w.addStack();
  pubRow.layoutHorizontally();
  const pubLabel = pubRow.addText("Escolas Públicas");
  pubLabel.font = Font.systemFont(10);
  pubLabel.textColor = new Color("#475569");
  pubRow.addSpacer();
  const pubPct = pubRow.addText(`${pctPublico}% (${instit?.value || 0})`);
  pubPct.font = Font.semiboldSystemFont(10);
  pubPct.textColor = new Color("#f59e0b");

  // Per-project breakdown (medium / large)
  if (config.widgetFamily !== "small" && data.por_projeto?.length) {
    w.addSpacer(6);
    const projTitle = w.addText("Por Projeto");
    projTitle.font = Font.semiboldSystemFont(10);
    projTitle.textColor = new Color("#0891b2");

    w.addSpacer(3);

    for (const p of data.por_projeto.slice(0, 2)) {
      const r = w.addStack();
      r.layoutHorizontally();
      const n = r.addText(p.name.substring(0, 20));
      n.font = Font.systemFont(9);
      n.textColor = new Color("#1e293b");
      n.lineLimit = 1
      r.addSpacer();
      const v = r.addText(String(p.value));
      v.font = Font.semiboldSystemFont(9);
      v.textColor = new Color("#f59e0b");
    }
  }

  w.url = "https://a-pi-eco-buzios.vercel.app/";
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  return w;
}

const widget = await buildWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentMedium();
}
Script.complete();

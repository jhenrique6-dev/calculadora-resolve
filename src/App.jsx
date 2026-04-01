import React, { useMemo, useState } from 'react';

const bancosFinanceiras = [
  'Banco do Brasil',
  'Caixa Econômica Federal',
  'Bradesco',
  'Itaú',
  'Santander',
  'Banco Safra',
  'Banco PAN',
  'BV Financeira',
  'Banco Inter',
  'C6 Bank',
  'Daycoval',
  'Banco GM',
  'Banco Volkswagen',
  'Banco Toyota',
  'Aymoré',
  'Omni',
  'Creditas',
  'Porto Bank',
  'Banco Honda',
  'Banco Yamaha',
  'Banco Mercedes-Benz',
  'Banco RCI',
  'Banco PSA',
  'Losango',
  'Mercantil',
  'Sicredi',
  'Sicoob',
  'BTG Pactual',
  'Agibank',
  'Outros'
];

function parseBR(value) {
  if (typeof value === 'number') return value;
  const normalized = String(value)
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .replace(/[^\d.-]/g, '');
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number.isFinite(value) ? value : 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0);
}

function formatCurrencyInput(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  const number = Number(digits) / 100;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
      />
    </label>
  );
}

function Card({ title, children, className = '' }) {
  return (
    <section className={`card ${className}`.trim()}>
      {title ? <h3 className="card-title">{title}</h3> : null}
      {children}
    </section>
  );
}

export default function App() {
  const [banco, setBanco] = useState('Banco do Brasil');
  const [valorParcela, setValorParcela] = useState('10,00');
  const [parcelasTotais, setParcelasTotais] = useState('48');
  const [parcelasPagas, setParcelasPagas] = useState('10');
  const [situacaoContrato, setSituacaoContrato] = useState('Em dia');
  const [descontoQuitacao, setDescontoQuitacao] = useState(90);
  const [parcelasEntrada, setParcelasEntrada] = useState('2');
  const [percentualHonorario, setPercentualHonorario] = useState('10');

  const bancosFiltrados = bancosFinanceiras.filter((item) =>
    item.toLowerCase().includes(String(banco).toLowerCase())
  );

  const data = useMemo(() => {
    const parcela = parseBR(valorParcela);
    const total = Math.max(0, Math.floor(parseBR(parcelasTotais)));
    const pagas = Math.max(0, Math.min(total, Math.floor(parseBR(parcelasPagas))));
    const restantes = Math.max(0, total - pagas);
    const saldoDevedor = parcela * restantes;
    const desconto = Math.max(0, Math.min(100, Number(descontoQuitacao) || 0));
    const valorQuitacao = saldoDevedor * (1 - desconto / 100);
    const economiaTotal = saldoDevedor - valorQuitacao;
    const entrada = parcela * Math.max(0, Math.floor(parseBR(parcelasEntrada)));
    const honorario = economiaTotal * (Math.max(0, parseBR(percentualHonorario)) / 100);
    const ganhoLiquido = economiaTotal - entrada - honorario;

    return {
      parcela,
      total,
      pagas,
      restantes,
      saldoDevedor,
      valorQuitacao,
      economiaTotal,
      entrada,
      honorario,
      ganhoLiquido,
      desconto
    };
  }, [valorParcela, parcelasTotais, parcelasPagas, descontoQuitacao, parcelasEntrada, percentualHonorario]);

  const mensagemCliente = `Olá! Analisamos seu financiamento com o ${banco} e temos uma ótima notícia. 🎉\n\n❌ *Sem a revisional:* ${data.restantes}x de ${formatCurrency(data.parcela)} = *${formatCurrency(data.saldoDevedor)}*\n✅ *Com a revisional:* você quita por apenas *${formatCurrency(data.valorQuitacao)}* (${data.desconto}% de desconto)\n\n🎉 *Parcela a partir de hoje:* ${formatCurrency(0)}\n\n💰 *Economia total:* ${formatCurrency(data.economiaTotal)}\n🏆 *Seu ganho líquido:* ${formatCurrency(data.ganhoLiquido)}\n\nInvestimento:\n• Entrada agora: *${formatCurrency(data.entrada)}* (${parseBR(parcelasEntrada)} parcelas)\n• Honorário: *${formatCurrency(data.honorario)}* — só no final, após o resultado\n\nA Resolve Brasil cuida de tudo. Vamos resolver isso? 💪`;

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(mensagemCliente);
      alert('Mensagem copiada com sucesso.');
    } catch {
      alert('Não foi possível copiar automaticamente. Selecione e copie manualmente.');
    }
  }

  function compartilharWhatsApp() {
    const texto = encodeURIComponent(mensagemCliente);
    window.open(`https://wa.me/?text=${texto}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="page-shell">
      <div className="container">
        <header className="hero">
          <div className="brand-mark">RB</div>
          <div>
            <h1>Resolve Brasil</h1>
            <p>Calculadora de Revisional de Financiamento Veicular</p>
          </div>
        </header>

        <main className="layout">
          <div className="left-column">
            <Card title="Dados do financiamento">
              <div className="grid two-columns">
                <label className="field">
                  <span className="field-label">Banco / Financeira</span>
                  <input
                    type="text"
                    value={banco}
                    onChange={(e) => setBanco(e.target.value)}
                    placeholder="Digite ou selecione um banco"
                    list="lista-bancos-financeiras"
                    className="input"
                  />
                  <datalist id="lista-bancos-financeiras">
                    {bancosFiltrados.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </label>

                <Field
                  label="Valor da parcela (R$)"
                  value={valorParcela}
                  onChange={(value) => setValorParcela(formatCurrencyInput(value))}
                  placeholder="Ex.: 850,00"
                />
                <Field
                  label="Total de parcelas contratadas"
                  value={parcelasTotais}
                  onChange={setParcelasTotais}
                  type="number"
                  placeholder="Ex.: 48"
                />
                <Field
                  label="Parcelas já pagas"
                  value={parcelasPagas}
                  onChange={setParcelasPagas}
                  type="number"
                  placeholder="Ex.: 10"
                />
              </div>

              <div className="notice-box">
                Parcelas restantes: <strong>{data.restantes} parcelas</strong>
                <span> | Saldo calculado automaticamente</span>
              </div>

              <div className="grid two-columns stats-grid">
                <div className="metric-box">
                  <span className="field-label">Parcelas restantes</span>
                  <div className="metric-value">{data.restantes}</div>
                  <small>calculado automaticamente</small>
                </div>
                <div className="metric-box">
                  <span className="field-label">Saldo devedor atual (R$)</span>
                  <div className="metric-value">{formatNumber(data.saldoDevedor)}</div>
                  <small>parcela × restantes</small>
                </div>
              </div>

              <div className="grid two-columns">
                <label className="field">
                  <span className="field-label">Situação do contrato</span>
                  <select
                    value={situacaoContrato}
                    onChange={(e) => setSituacaoContrato(e.target.value)}
                    className="input"
                  >
                    <option>Em dia</option>
                    <option>Atrasado</option>
                    <option>Em cobrança</option>
                    <option>Busca e apreensão</option>
                  </select>
                </label>

                <div className="field">
                  <div className="range-header">
                    <span className="field-label">Desconto na quitação</span>
                    <strong>{data.desconto}%</strong>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    step="1"
                    value={descontoQuitacao}
                    onChange={(e) => setDescontoQuitacao(e.target.value)}
                    className="range"
                  />
                  <div className="range-scale">
                    <span>30%</span>
                    <span>90%</span>
                  </div>
                </div>
              </div>

              <div className="grid two-columns">
                <Field
                  label="Quantidade de parcelas de entrada"
                  value={parcelasEntrada}
                  onChange={setParcelasEntrada}
                  type="number"
                  placeholder="Ex.: 2"
                />
                <Field
                  label="Honorário sobre proveito econômico (%)"
                  value={percentualHonorario}
                  onChange={setPercentualHonorario}
                  type="number"
                  placeholder="Ex.: 10"
                />
              </div>
            </Card>
          </div>

          <div className="right-column">
            <div className="pill-success">Caso viável — vantagem confirmada</div>

            <div className="grid summary-grid">
              <Card className="danger-card">
                <div className="summary-label danger">Sem a revisional</div>
                <div className="summary-value danger-text">{formatCurrency(data.saldoDevedor)}</div>
                <div className="summary-subtext">{data.restantes}x de {formatCurrency(data.parcela)}</div>
              </Card>

              <Card className="success-card">
                <div className="summary-label success">Com a revisional</div>
                <div className="summary-value">{formatCurrency(data.valorQuitacao)}</div>
                <div className="summary-subtext">até {data.desconto}% de desconto — dívida encerrada</div>
              </Card>
            </div>

            <div className="grid summary-grid">
              <Card>
                <div className="summary-label muted">A partir de hoje sua parcela vira</div>
                <div className="summary-value success-text">{formatCurrency(0)}</div>
                <div className="summary-subtext">Você para de pagar ao banco imediatamente após assinar com a Resolve Brasil.</div>
              </Card>

              <Card>
                <div className="benefits-list">
                  <div>🎉 Nenhuma parcela ao banco</div>
                  <div>📁 A Resolve Brasil assume o processo</div>
                  <div>🔒 Você fica livre da dívida</div>
                  <div>✅ Nome limpo e contrato encerrado</div>
                </div>
              </Card>
            </div>

            <Card className="economy-card">
              <div className="economy-title">Economia total da revisional</div>
              <div className="economy-value">{formatCurrency(data.economiaTotal)}</div>
              <div className="summary-subtext">
                Diferença entre o total das parcelas ({formatCurrency(data.saldoDevedor)}) e a quitação ({formatCurrency(data.valorQuitacao)})
              </div>
            </Card>
          </div>
        </main>

        <section className="bottom-layout">
          <Card title="Investimento e ganho real do cliente">
            <div className="table-like">
              <div className="table-row">
                <div>
                  <div className="row-title">Valor de quitação (pago ao banco)</div>
                  <div className="row-subtitle">até {data.desconto}% de desconto sobre o saldo devedor</div>
                </div>
                <div className="row-value">{formatCurrency(data.valorQuitacao)}</div>
              </div>

              <div className="table-row">
                <div>
                  <div className="row-title">Entrada — {parseBR(parcelasEntrada)} parcelas do financiamento</div>
                  <div className="row-subtitle">cobradas no início do processo</div>
                </div>
                <div className="row-value">{formatCurrency(data.entrada)}</div>
              </div>

              <div className="table-row">
                <div>
                  <div className="row-title">Honorário Resolve Brasil — {parseBR(percentualHonorario)}% do proveito econômico</div>
                  <div className="row-subtitle">{parseBR(percentualHonorario)}% de {formatCurrency(data.economiaTotal)} — proveito econômico com {data.desconto}% de desconto</div>
                </div>
                <div className="row-value">{formatCurrency(data.honorario)}</div>
              </div>

              <div className="table-row highlight-row">
                <div>
                  <div className="row-title highlight-text">Ganho líquido do cliente</div>
                  <div className="row-subtitle light-text">economia real após todos os custos</div>
                </div>
                <div className="row-value highlight-text">{formatCurrency(data.ganhoLiquido)}</div>
              </div>
            </div>
          </Card>

          <Card title="Mensagem para enviar ao cliente">
            <textarea readOnly value={mensagemCliente} className="message-box" />
            <div className="button-group">
              <button onClick={copyMessage} className="button button-primary">Copiar mensagem</button>
              <button onClick={compartilharWhatsApp} className="button button-secondary">Compartilhar no WhatsApp</button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

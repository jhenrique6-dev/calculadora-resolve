import React, { useMemo, useState } from 'react'

const bancosFinanceiras = [
  'Banco do Brasil','Caixa Econômica Federal','Bradesco','Itaú','Santander','Banco Safra','Banco PAN','BV Financeira','Banco Inter','C6 Bank','Daycoval','Banco GM','Banco Volkswagen','Banco Toyota','Aymoré','Omni','Creditas','Porto Bank','Banco Honda','Banco Yamaha','Banco Mercedes-Benz','Banco RCI','Banco PSA','Losango','Mercantil','Sicredi','Sicoob','BTG Pactual','Agibank','Outros'
]

const parseBR = (value) => {
  if (typeof value === 'number') return value
  const normalized = String(value).replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.-]/g, '')
  const num = Number(normalized)
  return Number.isFinite(num) ? num : 0
}

const formatCurrencyInput = (value) => {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  const number = Number(digits) / 100
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number)
}

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL'
}).format(Number.isFinite(value) ? value : 0)

const formatNumber = (value) => new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2, maximumFractionDigits: 2
}).format(Number.isFinite(value) ? value : 0)

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
  )
}

function Card({ title, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {title ? <h3 className="card-title">{title}</h3> : null}
      {children}
    </div>
  )
}

export default function App() {
  const [banco, setBanco] = useState('Banco do Brasil')
  const [valorParcela, setValorParcela] = useState('10,00')
  const [parcelasTotais, setParcelasTotais] = useState('48')
  const [parcelasPagas, setParcelasPagas] = useState('10')
  const [situacaoContrato, setSituacaoContrato] = useState('Em dia')
  const [descontoQuitacao, setDescontoQuitacao] = useState(90)
  const [parcelasEntrada, setParcelasEntrada] = useState('2')
  const [percentualHonorario, setPercentualHonorario] = useState('10')

  const bancosFiltrados = bancosFinanceiras.filter((item) =>
    item.toLowerCase().includes(String(banco).toLowerCase())
  )

  const data = useMemo(() => {
    const parcela = parseBR(valorParcela)
    const total = Math.max(0, Math.floor(parseBR(parcelasTotais)))
    const pagas = Math.max(0, Math.min(total, Math.floor(parseBR(parcelasPagas))))
    const restantes = Math.max(0, total - pagas)
    const saldoDevedor = parcela * restantes
    const desconto = Math.max(0, Math.min(100, Number(descontoQuitacao) || 0))
    const valorQuitacao = saldoDevedor * (1 - desconto / 100)
    const economiaTotal = saldoDevedor - valorQuitacao
    const entrada = parcela * Math.max(0, Math.floor(parseBR(parcelasEntrada)))
    const honorario = economiaTotal * (Math.max(0, parseBR(percentualHonorario)) / 100)
    const ganhoLiquido = economiaTotal - entrada - honorario
    return { parcela, total, pagas, restantes, saldoDevedor, desconto, valorQuitacao, economiaTotal, entrada, honorario, ganhoLiquido }
  }, [valorParcela, parcelasTotais, parcelasPagas, descontoQuitacao, parcelasEntrada, percentualHonorario])

  const mensagemCliente = `Olá! Analisamos seu financiamento com o ${banco} e temos uma ótima notícia. 🎉\n\n❌ *Sem a revisional:* ${data.restantes}x de ${formatCurrency(data.parcela)} = *${formatCurrency(data.saldoDevedor)}*\n✅ *Com a revisional:* você quita por apenas *${formatCurrency(data.valorQuitacao)}* (${data.desconto}% de desconto)\n\n🎉 *Parcela a partir de hoje:* ${formatCurrency(0)}\n\n💰 *Economia total:* ${formatCurrency(data.economiaTotal)}\n🏆 *Seu ganho líquido:* ${formatCurrency(data.ganhoLiquido)}\n\nInvestimento:\n• Entrada agora: *${formatCurrency(data.entrada)}* (${parseBR(parcelasEntrada)} parcelas)\n• Honorário: *${formatCurrency(data.honorario)}* — só no final, após o resultado\n\nA Resolve Brasil cuida de tudo. Vamos resolver isso? 💪`

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(mensagemCliente)
      alert('Mensagem copiada com sucesso.')
    } catch {
      alert('Não foi possível copiar automaticamente.')
    }
  }

  const compartilharWhatsApp = () => {
    const texto = encodeURIComponent(mensagemCliente)
    window.open(`https://wa.me/?text=${texto}`, '_blank')
  }

  return (
    <div className="page">
      <div className="container">
        <header className="hero">
          <div className="brand-wrap">
            <div className="logo-box">RB</div>
            <div>
              <h1 className="brand-title">Resolve Brasil</h1>
              <p className="brand-subtitle">Calculadora de Revisional de Financiamento Veicular</p>
            </div>
          </div>
        </header>

        <div className="layout-grid">
          <Card title="Dados do financiamento">
            <div className="form-grid">
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
                  {bancosFiltrados.map((item) => <option key={item} value={item} />)}
                </datalist>
              </label>

              <Field label="Valor da parcela (R$)" value={valorParcela} onChange={(value) => setValorParcela(formatCurrencyInput(value))} placeholder="Ex.: 850,00" />
              <Field label="Total de parcelas contratadas" value={parcelasTotais} onChange={setParcelasTotais} type="number" placeholder="Ex.: 48" />
              <Field label="Parcelas já pagas" value={parcelasPagas} onChange={setParcelasPagas} type="number" placeholder="Ex.: 10" />
            </div>

            <div className="highlight-bar">Parcelas restantes: <strong>{data.restantes} parcelas</strong> | Saldo calculado automaticamente</div>

            <div className="stats-grid two">
              <div className="stat-box">
                <span className="field-label">Parcelas restantes</span>
                <div className="big-green">{data.restantes}</div>
                <p className="helper">calculado automaticamente</p>
              </div>
              <div className="stat-box">
                <span className="field-label">Saldo devedor atual (R$)</span>
                <div className="big-green">{formatNumber(data.saldoDevedor)}</div>
                <p className="helper">parcela x restantes</p>
              </div>
            </div>

            <div className="form-grid lower-gap">
              <label className="field">
                <span className="field-label">Situação do contrato</span>
                <select value={situacaoContrato} onChange={(e) => setSituacaoContrato(e.target.value)} className="input">
                  <option>Em dia</option>
                  <option>Atrasado</option>
                  <option>Em cobrança</option>
                  <option>Busca e apreensão</option>
                </select>
              </label>

              <div className="field">
                <div className="range-head">
                  <span className="field-label">Desconto na quitação</span>
                  <span className="range-value">{data.desconto}%</span>
                </div>
                <input type="range" min="30" max="90" step="1" value={descontoQuitacao} onChange={(e) => setDescontoQuitacao(e.target.value)} className="range" />
                <div className="range-scale"><span>30%</span><span>90%</span></div>
              </div>

              <Field label="Quantidade de parcelas de entrada" value={parcelasEntrada} onChange={setParcelasEntrada} type="number" />
              <Field label="Honorário sobre proveito econômico (%)" value={percentualHonorario} onChange={setPercentualHonorario} type="number" />
            </div>
          </Card>

          <div className="right-column">
            <div className="pill">Caso viável — vantagem confirmada</div>

            <div className="right-grid">
              <Card className="red-card">
                <div className="mini-title red">Sem a revisional</div>
                <div className="price-big red-text">{formatCurrency(data.saldoDevedor)}</div>
                <div className="sub-value">{data.restantes}x de {formatCurrency(data.parcela)}</div>
              </Card>
              <Card className="green-card">
                <div className="mini-title green">Com a revisional</div>
                <div className="price-big white-text">{formatCurrency(data.valorQuitacao)}</div>
                <div className="sub-value">até {data.desconto}% de desconto — dívida encerrada</div>
              </Card>
            </div>

            <div className="right-grid">
              <Card>
                <div className="mini-title muted">A partir de hoje sua parcela vira</div>
                <div className="price-big green-text">{formatCurrency(0)}</div>
                <div className="sub-value">Você para de pagar ao banco imediatamente após assinar com a Resolve Brasil.</div>
              </Card>
              <Card>
                <div className="benefits">
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
              <div className="sub-value center">Diferença entre o total das parcelas ({formatCurrency(data.saldoDevedor)}) e a quitação ({formatCurrency(data.valorQuitacao)})</div>
            </Card>
          </div>
        </div>

        <div className="bottom-grid">
          <Card title="Investimento e ganho real do cliente">
            <div className="invest-list">
              <div className="invest-row"><div><div className="invest-name">Valor de quitação (pago ao banco)</div><div className="sub-value">até {data.desconto}% de desconto sobre o saldo devedor</div></div><div className="yellow-value">{formatCurrency(data.valorQuitacao)}</div></div>
              <div className="invest-row"><div><div className="invest-name">Entrada — {parseBR(parcelasEntrada)} parcelas do financiamento</div><div className="sub-value">cobradas no início do processo</div></div><div className="yellow-value">{formatCurrency(data.entrada)}</div></div>
              <div className="invest-row"><div><div className="invest-name">Honorário Resolve Brasil — {parseBR(percentualHonorario)}% do proveito econômico</div><div className="sub-value">{parseBR(percentualHonorario)}% de {formatCurrency(data.economiaTotal)}</div></div><div className="yellow-value">{formatCurrency(data.honorario)}</div></div>
              <div className="invest-row green-final"><div><div className="invest-name green-text">🏆 Ganho líquido do cliente</div><div className="sub-value">economia real após todos os custos</div></div><div className="green-total">{formatCurrency(data.ganhoLiquido)}</div></div>
            </div>
          </Card>

          <Card title="Mensagem para enviar ao cliente">
            <textarea readOnly value={mensagemCliente} className="message-box" />
            <div className="button-grid">
              <button onClick={copyMessage} className="btn btn-primary">Copiar mensagem</button>
              <button onClick={compartilharWhatsApp} className="btn btn-secondary">Compartilhar no WhatsApp</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

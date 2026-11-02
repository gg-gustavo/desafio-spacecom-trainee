import { useEffect, useState } from 'react'

const sections = [
  ['desafio', 'O desafio'],
  ['datasets', 'Datasets'],
  ['dificuldade', 'A dificuldade'],
  ['solucao', 'A solução'],
  ['execucao', 'Execução'],
] as const

const datasets = [
  { id: '01', size: '0,26 MB', encounters: '4' },
  { id: '02', size: '1,3 MB', encounters: '6' },
  { id: '03', size: '5,3 MB', encounters: '10' },
  { id: '04', size: '21 MB', encounters: '15' },
  { id: '05', size: '53 MB', encounters: '21' },
  { id: '06', size: '423 MB', encounters: '27' },
  { id: '07', size: '638 MB', encounters: '35' },
]

const pipeline = [
  { n: '01', title: 'Leitura em fluxo', copy: 'Processo os arquivos CSV de forma incremental, sem carregar o conjunto inteiro na memória.' },
  { n: '02', title: 'Recorte temporal', copy: 'Agrupo os registros por timestamp exato e comparo apenas instantes separados por 5 segundos.' },
  { n: '03', title: 'Poda espacial', copy: 'Uso um grid espacial para restringir a busca aos pontos vizinhos que podem estar dentro do limite.' },
  { n: '04', title: 'Distância geodésica', copy: 'Calculo a distância final com Haversine e raio terrestre R = 6.371.000 m.' },
  { n: '05', title: 'Pares e validação', copy: 'Normalizo as chaves dos pares, removo duplicidades e comparo os resultados bit a bit com os dois gabaritos oficiais.' },
]

function Mark({ className = '' }: { className?: string }) {
  return <span className={`mark ${className}`} aria-hidden="true"><i /><i /><i /><i /></span>
}

function Arrow() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="none"><path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function App() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(theme)
    localStorage.setItem('spacecom-theme', theme)
  }, [theme])

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Gustavo Ripka, início"><Mark /><span>GR<span className="brand-separator">/</span>SPACECOM</span></a>
        <nav className="main-nav" aria-label="Navegação principal">
          {sections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
        <button className="theme-toggle" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Ativar tema ${theme === 'dark' ? 'claro' : 'escuro'}`}>
          <span className="theme-symbol" aria-hidden="true">{theme === 'dark' ? '◐' : '◑'}</span><span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
        </button>
      </header>

      <main id="inicio">
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy">
            <div className="eyebrow"><span className="live-dot" /> DESAFIO TÉCNICO <span className="eyebrow-divider">/</span> SPACEcom</div>
            <h1>Gustavo<br /><span>Ripka</span></h1>
            <p className="hero-title">Detecção de encontros<br />em dados de telemetria</p>
            <div className="hero-meta"><span>PROCESSAMENTO GEOESPACIAL</span><span className="meta-line" /><span>TRAINEE TECH 2027</span></div>
          </div>
          <div className="hero-aside">
            <div className="radar" aria-label="Ilustração abstrata de pontos de telemetria">
              <div className="radar-ring ring-one" /><div className="radar-ring ring-two" /><div className="radar-ring ring-three" />
              <div className="radar-cross cross-x" /><div className="radar-cross cross-y" />
              <span className="radar-point point-a" /><span className="radar-point point-b" /><span className="radar-point point-c" /><span className="radar-point point-d" />
              <span className="radar-center" /><span className="radar-label label-a">LAT −25.43</span><span className="radar-label label-b">LON −49.27</span>
            </div>
            <div className="hero-aside-caption"><span className="mono">FIG. 01</span><span>Recorte espacial<br />de registros pareados</span></div>
          </div>
          <a href="#desafio" className="scroll-cue"><span>EXPLORAR PROJETO</span><span className="scroll-track" /></a>
          <div className="hero-index mono">01 <span>/</span> 05</div>
        </section>

        <section className="section challenge section-grid" id="desafio">
          <div className="section-heading">
            <p className="kicker"><span>01</span> ESPECIFICAÇÃO</p>
            <h2>O desafio,<br /><em>em termos exatos.</em></h2>
          </div>
          <div className="challenge-content">
            <p className="intro">Implementei a identificação de encontros entre dispositivos a partir de registros de localização. Cada resultado precisa respeitar simultaneamente as condições temporais, espaciais e de classificação definidas no enunciado.</p>
            <div className="rules-grid">
              <article className="rule-card"><span className="rule-index">A / CLASSES</span><h3>Três tipos de encontro</h3><p>O resultado distingue os três tipos definidos no desafio: <code className="mono">generico</code>, <code className="mono">faccao</code> e <code className="mono">protetiva</code>.</p></article>
              <article className="rule-card"><span className="rule-index">B / DISTÂNCIA</span><h3>Limite de 20 metros</h3><p>Considero um encontro somente quando a distância calculada atende ao limite de 20 m, sem arredondamento usado para alterar a decisão.</p></article>
              <article className="rule-card"><span className="rule-index">C / TEMPO</span><h3>Instantes exatos</h3><p>Comparo posições apenas nos timestamps esperados, em intervalos exatos de 5 segundos. Não aproximo nem interpolo horários.</p></article>
              <article className="rule-card score-card"><span className="rule-index">D / MÉTRICA</span><h3>Score do encontro</h3><p>A regra de classificação do score segue a fórmula do enunciado:</p><div className="formula"><code className="mono">{'Score = soma_ec - soma_ei'}</code></div></article>
            </div>
            <div className="metric-strip"><div><span className="metric-value">20<span> m</span></span><span className="metric-label">distância máxima</span></div><div><span className="metric-value">05<span> s</span></span><span className="metric-label">passo entre timestamps</span></div><div><span className="metric-value">6.371<span> km</span></span><span className="metric-label">raio usado no Haversine</span></div></div>
          </div>
        </section>

        <section className="section datasets" id="datasets">
          <div className="section-heading dataset-heading">
            <p className="kicker"><span>02</span> ENTRADAS E RESULTADOS</p>
            <h2>Sete arquivos.<br /><em>Uma regra consistente.</em></h2>
            <p className="section-note">Registrei o volume de cada entrada e o total de encontros encontrados pelo processamento.</p>
          </div>
          <div className="table-wrap">
            <div className="table-topline"><span>INVENTÁRIO DE DATASETS</span><span className="table-status"><i /> 07 ARQUIVOS</span></div>
            <table><thead><tr><th scope="col">ARQUIVO</th><th scope="col">TAMANHO</th><th scope="col">ENCONTROS DETECTADOS</th><th scope="col" className="th-state">ESTADO</th></tr></thead><tbody>
              {datasets.map((item) => <tr key={item.id} className={item.id === '07' ? 'largest-row' : ''}><th scope="row"><span className="file-icon">TXT</span>dataset{item.id}.txt</th><td className="mono">{item.size}</td><td className="mono result-value">{item.encounters}</td><td className="row-state"><span className="state-dot" /> processado</td></tr>)}
            </tbody></table>
            <div className="table-foot"><span>FORMATO DE ORIGEM <b>.TXT / CSV</b></span><span>MAIOR ENTRADA <b>638 MB</b></span></div>
          </div>
        </section>

        <section className="section difficulty section-grid" id="dificuldade">
          <div className="section-heading">
            <p className="kicker"><span>03</span> RESTRIÇÕES</p>
            <h2>Onde a escala<br /><em>cobra precisão.</em></h2>
          </div>
          <div className="difficulty-content">
            <p className="intro">O ponto crítico não é apenas percorrer muitos registros. É preservar exatamente a semântica do desafio enquanto o volume cresce.</p>
            <div className="risk-list">
              <article className="risk-item"><span className="risk-no">01</span><div><h3>Volume de entrada</h3><p>Um arquivo de 638 MB torna inviável depender de uma leitura integral em memória. A leitura em fluxo mantém o uso de memória controlado.</p></div><span className="risk-tag">ESCALA</span></article>
              <article className="risk-item"><span className="risk-no">02</span><div><h3>Precisão de distância</h3><p>O limiar de 20 m exige cálculo geodésico consistente. A poda espacial reduz candidatos, mas a decisão final é sempre feita pelo Haversine.</p></div><span className="risk-tag">EXATIDÃO</span></article>
              <article className="risk-item"><span className="risk-no">03</span><div><h3>Pares únicos</h3><p>O mesmo par pode surgir em mais de uma consulta local. Chaves normalizadas garantem identidade estável e impedem contagens duplicadas.</p></div><span className="risk-tag">UNICIDADE</span></article>
              <article className="risk-item"><span className="risk-no">04</span><div><h3>Zero falsos positivos</h3><p>A grade serve para poda, não para aceitar encontros. Só entram no resultado pares que passam pelas regras exatas e pela validação.</p></div><span className="risk-tag">CONFIANÇA</span></article>
            </div>
          </div>
        </section>

        <section className="solution" id="solucao">
          <div className="solution-inner">
            <div className="section-heading solution-heading">
              <p className="kicker"><span>04</span> MÉTODO</p>
              <h2>Da linha ao<br /><em>resultado validado.</em></h2>
              <p className="section-note">Organizei o processamento em etapas para separar eficiência de correção: a otimização encontra candidatos, as regras confirmam cada encontro.</p>
            </div>
            <div className="pipeline">
              {pipeline.map((step, index) => <article className="pipeline-step" key={step.n}>
                <div className="pipeline-marker"><span>{step.n}</span>{index < pipeline.length - 1 && <i />}</div>
                <div className="pipeline-copy"><h3>{step.title}</h3><p>{step.copy}</p></div>
                <span className="pipeline-arrow"><Arrow /></span>
              </article>)}
              <div className="validation-box"><Mark /><div><span className="validation-label">CRITÉRIO DE ACEITE</span><strong>Comparação bit a bit com os 2 gabaritos oficiais</strong></div><span className="validation-result">aprovada: 2 de 2 byte-idênticos</span></div>
            </div>
          </div>
        </section>

        <section className="section execution section-grid" id="execucao">
          <div className="section-heading">
            <p className="kicker"><span>05</span> AMBIENTE</p>
            <h2>Reproduzível<br /><em>do início ao fim.</em></h2>
            <p className="section-note">Desenvolvi o processamento em Node.js com TypeScript. Os comandos abaixo partem da pasta do projeto.</p>
          </div>
          <div className="execution-content">
            <div className="stack-tags"><span>NODE.JS</span><span>TYPESCRIPT</span><span>STREAMING CSV</span><span>JSON</span></div>
            <div className="terminal">
              <div className="terminal-bar"><span className="terminal-dots"><i /><i /><i /></span><span>TERMINAL / PROCESSAMENTO</span><span className="terminal-live">LOCAL</span></div>
              <div className="terminal-body"><p><span className="terminal-prompt">$</span> npm ci</p><p className="terminal-comment"># executar a análise dos datasets</p><p><span className="terminal-prompt">$</span> npm run start -- --input ./datasets</p><p className="terminal-comment"># site estático em preview, porta 8088</p><p><span className="terminal-prompt">$</span> npm run build && npm run preview</p></div>
              <div className="terminal-output"><span>OUTPUT</span><code>./outputs/dataset{`{1..7}`}.json</code></div>
            </div>
            <p className="execution-note"><span className="note-mark">i</span>Os dados dos datasets e o comando de execução devem corresponder ao pacote entregue com o algoritmo. Este site é publicado como conteúdo estático em <span className="mono">dist/</span>.</p>
          </div>
        </section>

        <section className="closing">
          <div className="closing-content"><p className="kicker"><span>FIM</span> DESAFIO SPACEcom / TRAINEE TECH 2027</p><h2>Obrigado<br />pela <em>avaliação.</em></h2><p>Apresentei neste espaço as regras, as decisões de implementação e os critérios usados para conferir os resultados.</p><a className="back-top" href="#inicio">VOLTAR AO INÍCIO <Arrow /></a></div>
          <div className="closing-mark"><Mark /><span>GR</span><span className="closing-coordinate mono">25°25' S<br />49°16' W</span></div>
        </section>
      </main>

      <footer className="footer"><a className="footer-name" href="#inicio">GUSTAVO RIPKA</a><span className="footer-note">DESAFIO TÉCNICO · 2027</span><div className="footer-links"><a href="https://www.inf.ufpr.br/ggr20" target="_blank" rel="noreferrer">Portfólio <Arrow /></a><a href="https://github.com/gg-gustavo/desafio-spacecom-trainee" target="_blank" rel="noreferrer">GitHub do desafio <Arrow /></a></div><span className="footer-credit">PR · BR</span></footer>
    </>
  )
}

export default App

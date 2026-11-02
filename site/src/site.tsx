import { useEffect, useState } from 'react'

const sections = [
  ['desafio', 'Como funciona'],
  ['historico', 'Dados da execução'],
  ['datasets', 'Datasets'],
  ['dificuldade', 'A dificuldade'],
  ['solucao', 'A solução'],
  ['execucao', 'Execução'],
] as const

const datasets = [
  { id: '01', size: '0,26 MB', sizeValue: 0.26, time: '27 ms', timeValue: 27, encounters: '4' },
  { id: '02', size: '1,3 MB', sizeValue: 1.3, time: '50 ms', timeValue: 50, encounters: '6' },
  { id: '03', size: '5,3 MB', sizeValue: 5.3, time: '180 ms', timeValue: 180, encounters: '10' },
  { id: '04', size: '21 MB', sizeValue: 21, time: '669 ms', timeValue: 669, encounters: '15' },
  { id: '05', size: '53 MB', sizeValue: 53, time: '1.634 ms', timeValue: 1634, encounters: '21' },
  { id: '06', size: '423 MB', sizeValue: 423, time: '13.131 ms', timeValue: 13131, encounters: '27' },
  { id: '07', size: '638 MB', sizeValue: 638, time: '19.893 ms', timeValue: 19893, encounters: '35' },
]

const encounterExamples = [
  { type: 'generico', label: 'ENCONTRO GENÉRICO', example: '{\n  "tipo": "generico",\n  "monitoradosEncontro": [4, 6],\n  "timestamp": "2024-01-01 00:05:15"\n}' },
  { type: 'faccao', label: 'ENCONTRO DE FACÇÃO', example: '{\n  "tipo": "faccao",\n  "monitoradosEncontro": [7, 8],\n  "timestamp": "2024-01-01 00:36:00",\n  "distanciaMetros": 8.895594131622975\n}' },
  { type: 'protetiva', label: 'MEDIDA PROTETIVA', example: '{\n  "tipo": "protetiva",\n  "monitoradosEncontro": [9, 10],\n  "timestamp": "2024-01-01 00:16:45",\n  "posicoes": { "9": { "lat": 1.83355, "lon": -69.5461 }, "10": { "lat": 1.83351, "lon": -69.54618 } },\n  "distanciaMetros": 9.941503149375345\n}' },
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

function BrainIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" /><path d="M17.599 6.5a3 3 0 0 0 .399-1.375" /><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" /><path d="M3.477 10.896a4 4 0 0 1 .585-.396" /><path d="M19.938 10.5a4 4 0 0 1 .585.396" /><path d="M6 18a4 4 0 0 1-1.967-.516" /><path d="M19.967 17.484A4 4 0 0 1 18 18" /></svg>
}

function GithubIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.75-1.32-3.75-1.32-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.75 2.42 3.52 1.72.1-.72.4-1.22.72-1.5-2.47-.28-5.07-1.23-5.07-5.5 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.28-2.6 5.22-5.08 5.49.4.35.76 1.02.76 2.06v3.05c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" /></svg>
}

function PortfolioIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9.25" /><path d="M2.9 12h18.2M12 2.75c2.3 2.5 3.45 5.58 3.45 9.25S14.3 18.75 12 21.25C9.7 18.75 8.55 15.67 8.55 12S9.7 5.25 12 2.75Z" /></svg>
}

function DownloadLink({ className = '' }: { className?: string }) {
  return <a className={`download-link ${className}`} href="./entrega.zip" download><span className="download-icon" aria-hidden="true"><svg viewBox="0 0 18 18" fill="none"><path d="M9 2.5v8m0 0 3-3m-3 3-3-3M3.5 12v2.5h11V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span><span className="download-copy"><strong>Baixar entrega (.zip)</strong><small>contém código, README e outputs em JSON</small></span><Arrow /></a>
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
        <a className="brand" href="#inicio" aria-label="Gustavo Ripka, início"><Mark /><span>TRAINEE TECH <span className="brand-separator">/</span> 2027</span></a>
        <nav className="main-nav" aria-label="Navegação principal">
          {sections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
        <div className="author-links" aria-label="Links de autoria">
          <a href="https://github.com/gg-gustavo/desafio-spacecom-trainee" target="_blank" rel="noreferrer" aria-label="Repositório com a solução do desafio" title="Código do desafio"><BrainIcon /></a>
          <a href="https://github.com/gg-gustavo" target="_blank" rel="noreferrer" aria-label="GitHub de Gustavo Ripka" title="GitHub"><GithubIcon /></a>
          <a href="https://www.inf.ufpr.br/ggr20/" target="_blank" rel="noreferrer" aria-label="Portfólio de Gustavo Ripka" title="Portfólio"><PortfolioIcon /></a>
        </div>
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
            <DownloadLink className="hero-download" />
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
          <div className="hero-index mono">01 <span>/</span> 06</div>
        </section>

        <section className="section challenge section-grid" id="desafio">
          <div className="section-heading">
            <p className="kicker"><span>01</span> ESPECIFICAÇÃO</p>
            <h2>Como o desafio<br /><em>funciona.</em></h2>
          </div>
          <div className="challenge-content">
            <p className="intro">O sistema cruza a localização de tornozeleiras eletrônicas usadas por agressores com a de rastreadores portáteis entregues a vítimas com medida protetiva. O objetivo é detectar quando os dispositivos estão próximos no mesmo instante registrado. Eu implementei as regras do enunciado para classificar cada ocorrência e produzir resultados verificáveis.</p>
            <div className="rules-grid">
              <article className="rule-card"><span className="rule-index">01 / RAIO</span><h3>Menos de 20 metros</h3><p>Classifico proximidade apenas quando a distância entre os dispositivos é estritamente menor que 20 m. Distância igual a 20 m não é encontro.</p></article>
              <article className="rule-card"><span className="rule-index">02 / TEMPO</span><h3>Timestamp idêntico</h3><p>Comparo posições registradas no mesmo timestamp. Os dados são amostrados a cada 5 segundos, sem aproximação entre instantes.</p></article>
              <article className="rule-card"><span className="rule-index">03 / DISTÂNCIA</span><h3>Fórmula de Haversine</h3><p>Calculo a distância geodésica entre coordenadas com o raio terrestre definido no desafio.</p><div className="formula"><code className="mono">R = 6.371.000 m</code></div></article>
              <article className="rule-card"><span className="rule-index">04 / UNICIDADE</span><h3>Um par por timestamp</h3><p>Um encontro é único pela combinação do par de monitorados e do timestamp. Ordeno os IDs antes de formar a chave.</p></article>
              <article className="rule-card"><span className="rule-index">05 / PARES</span><h3>Ordem dos IDs não impacta</h3><p>Os pares <code className="mono">[4, 6]</code> e <code className="mono">[6, 4]</code> representam o mesmo encontro. A normalização evita duplicatas.</p></article>
              <article className="rule-card score-card"><span className="rule-index">06 / SCORE</span><h3>Falsos positivos descontam</h3><p>O score combina os encontros corretos e incorretos. Cada falso positivo reduz a pontuação final.</p><div className="formula"><code className="mono">Score = soma_ec - soma_ei</code></div></article>
            </div>
            <div className="encounter-examples">
              <div className="examples-heading"><span className="kicker"><span>07</span> TIPOS DE ENCONTRO</span><p>Estes exemplos foram extraídos do formato de saída gerado para o dataset 1.</p></div>
              <div className="example-grid">{encounterExamples.map((item) => <article className={`example-card example-${item.type}`} key={item.type}><div className="example-card-head"><span className="example-dot" /><span>{item.label}</span></div><pre><code>{item.example}</code></pre></article>)}</div>
            </div>
            <div className="metric-strip"><div><span className="metric-value">20<span> m</span></span><span className="metric-label">distância máxima</span></div><div><span className="metric-value">05<span> s</span></span><span className="metric-label">passo entre timestamps</span></div><div><span className="metric-value">6.371<span> km</span></span><span className="metric-label">raio usado no Haversine</span></div></div>
          </div>
        </section>

        <section className="section history" id="historico">
          <div className="history-heading"><div className="section-heading"><p className="kicker"><span>02</span> REGISTRO DE EXECUÇÃO</p><h2>O desafio<br /><em>em números.</em></h2></div><p className="section-note">Acompanhei a janela de entrega, os tempos medidos por dataset e o resultado agregado da execução.</p></div>
          <div className="history-content">
            <div className="timeline"><div className="timeline-line" /><article className="timeline-event"><span className="timeline-point" /><span className="timeline-date">30 OUT / 18:00</span><h3>Desafio liberado</h3><p>Início do período de resolução.</p></article><article className="timeline-event deadline"><span className="timeline-point" /><span className="timeline-date">03 NOV / 23:59:59</span><h3>Prazo de entrega</h3><p>Entrega conferida com os datasets oficiais.</p></article><div className="timeline-checks"><span><i /> Validação com 2 gabaritos</span><span><i /> 7 datasets oficiais</span></div></div>
            <div className="run-chart"><div className="chart-heading"><div><span className="chart-kicker">VOLUME E TEMPO</span><h3>O custo cresce com a entrada</h3></div><span className="chart-unit">MB / ms</span></div><div className="chart-legend"><span><i className="size-legend" />Tamanho</span><span><i className="time-legend" />Tempo de processamento</span></div><div className="chart-rows">{datasets.map((item) => <div className={`chart-row ${item.id === '07' ? 'chart-row-highlight' : ''}`} key={item.id}><span className="chart-dataset">D{item.id}</span><div className="chart-bars"><span className="chart-bar size-bar" style={{ width: `${Math.max(2, item.sizeValue / 638 * 100)}%` }} /><span className="chart-bar time-bar" style={{ width: `${Math.max(2, item.timeValue / 19893 * 100)}%` }} /></div><span className="chart-values">{item.size}<small>{item.time}</small></span></div>)}</div><div className="chart-axis"><span>0</span><span>50%</span><span>100% da escala</span></div></div>
            <div className="summary-stats"><article><span className="stat-label">COMMITS NO PERÍODO</span><strong>08</strong><span className="stat-caption">commits registrados</span></article><article className="stat-total"><span className="stat-label">ENCONTROS DETECTADOS</span><strong>118</strong><span className="stat-caption">somatório dos 7 datasets</span></article><article><span className="stat-label">POR TIPO</span><div className="type-counts"><span><i className="type-generic" />54 <small>genérico</small></span><span><i className="type-faction" />39 <small>facção</small></span><span><i className="type-protective" />25 <small>protetiva</small></span></div></article></div>
          </div>
        </section>

        <section className="section datasets" id="datasets">
          <div className="section-heading dataset-heading">
            <p className="kicker"><span>03</span> ENTRADAS E RESULTADOS</p>
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
            <p className="kicker"><span>04</span> RESTRIÇÕES</p>
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
              <p className="kicker"><span>05</span> MÉTODO</p>
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
            <p className="kicker"><span>06</span> AMBIENTE</p>
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

      <footer className="footer"><a className="footer-name" href="#inicio">GUSTAVO RIPKA</a><span className="footer-note">DESAFIO TÉCNICO · 2027</span><div className="footer-links"><a className="footer-author-link" href="https://github.com/gg-gustavo" target="_blank" rel="noreferrer" aria-label="GitHub de Gustavo Ripka" title="GitHub"><GithubIcon /><span>GitHub</span></a><a className="footer-author-link" href="https://www.inf.ufpr.br/ggr20/" target="_blank" rel="noreferrer" aria-label="Portfólio de Gustavo Ripka" title="Portfólio"><PortfolioIcon /><span>Portfólio</span></a><a href="https://github.com/gg-gustavo/desafio-spacecom-trainee" target="_blank" rel="noreferrer">Código do desafio <Arrow /></a></div><DownloadLink className="footer-download" /><span className="footer-credit">PR · BR</span></footer>
    </>
  )
}

export default App

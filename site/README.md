# Apresentação do desafio Spacecom

Site estático em React, Vite e TypeScript para apresentar o desafio técnico de Gustavo Ripka, Trainee Tech 2027.

## Instalação e build

```bash
npm ci
npm run build
```

O build é gerado em `dist/`.

## Servir na VPS

Na pasta `site/`, execute:

```bash
npx serve dist -l 8088
```

O preview do Vite também está fixado na porta 8088: `npm run preview`.

Os campos entre chaves duplas no conteúdo são placeholders para os números e nomes finais do desafio.

# gtuner

Afinador web para violão e ukulele. Instalável como PWA, funciona offline,
detecta tom em tempo real sem backend.

## Stack

- Vue 3 + TypeScript (script setup, composables, Pinia)
- Vite 5 com `vite-plugin-pwa` (Workbox, offline-first)
- Detecção de pitch com [pitchy](https://github.com/ianprime0509/pitchy) rodando dentro de um `AudioWorklet` (fora da main thread)
- Tailwind CSS
- Vitest para testes unitários

## Scripts

```bash
npm install
npm run dev         # dev server (porta 5173)
npm run build       # build de produção (vue-tsc + vite build)
npm run preview     # servir o build
npm run typecheck   # vue-tsc --noEmit
npm run test        # vitest run
npm run lint        # eslint .
npm run format      # prettier --write
npm run icons       # regenera PNGs a partir de public/icons/icon.svg
```

Base path padrão: `/gtuner/` (ajustado no `vite.config.ts`). Pode ser
sobrescrito em build com `VITE_BASE=/meu-path/ npm run build`.

## Arquitetura

```
src/
├── App.vue                  # shell que compõe os componentes
├── main.ts                  # bootstrap + Pinia + registro do SW
├── pwa.ts                   # registro do service worker
├── audio/
│   ├── engine.ts            # TunerEngine: estados, permissão, analyser
│   ├── pitch-worklet.ts     # AudioWorkletProcessor com pitchy (self-contained)
│   └── smoother.ts          # median filter + gates (clarity, rms, faixa)
├── composables/
│   ├── useTuner.ts          # reatividade em cima do TunerEngine
│   ├── useTheme.ts
│   ├── useReferenceTone.ts  # oscilador para tocar a nota alvo
│   ├── useToast.ts
│   └── usePwaInstall.ts     # beforeinstallprompt / standalone
├── stores/
│   └── settings.ts          # Pinia: A4, tema, afinação, modo auto
├── lib/
│   ├── instruments.ts       # presets de violão e ukulele
│   └── cents.ts             # classificação de afinação e rotação do ponteiro
├── components/              # NavBar, TunerMeter, NoteDisplay, ...
└── utils/
    ├── notes.ts             # MIDI ↔ nome/octave/freq (SPN)
    └── frequency-bars.ts    # canvas renderer do espectro
```

## PWA

O build gera `sw.js`, `workbox-*.js`, `manifest.webmanifest` e os ícones em
`dist/icons/`. Tudo é precached, incluindo o chunk do worklet, então o app
funciona 100% offline depois da primeira visita.

Para instalar: abra a app pelo Chrome/Edge/Safari em HTTPS, o banner de
install aparece quando `beforeinstallprompt` dispara. No iOS, use o botão
"Adicionar à tela de início" do Safari.

## Afinações suportadas

**Violão**: Padrão (EADGBE), Drop D, DADGAD
**Ukulele**: Padrão GCEA (re-entrante), Low G

Novas afinações podem ser adicionadas em `src/lib/instruments.ts` sem
mexer em mais nada.

## Deploy

GitHub Pages é o destino padrão (workflow em `.github/workflows/deploy.yml`).
Para outro host, ajuste `VITE_BASE`.

Baseado em [@qiuxiang/tuner](https://github.com/qiuxiang/tuner).

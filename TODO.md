# TODO

## Pesquisa

- [ ] **Filtros de som / isolamento do instrumento.** Estudar melhor técnicas de
      processamento de sinal para que o afinador separe o som real do
      instrumento da voz e dos ruídos do ambiente/usuário. Hoje o pitch
      detection pega qualquer fonte sonora dominante. Investigar:
  - Filtro passa-banda limitado à faixa de frequências do instrumento
    selecionado (violão/ukulele).
  - Gate por nível/energia e por clareza (confiança do autocorrelation/YIN)
    para descartar transientes de voz e ruído.
  - Possível detecção de harmônicos/timbre para distinguir corda de voz.
  - Referências: ver [[research-before-iterating]] — estudar soluções já
    comprovadas (Web Audio, projetos de tuner existentes) antes de iterar.

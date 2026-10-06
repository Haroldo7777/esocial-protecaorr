# Auditor eSocial — Proteção RR

Plataforma de gestão e auditoria de SST da Proteção RR (eventos S-2210, S-2220,
S-2221 e S-2240), que vai viver em **esocial.protecaorr.net**.

Estado atual: página provisória "em construção" (`index.html`), publicada como site
estático no Render. O sistema real será construído conforme `PLANO_FASE_1_AUDITOR.md`
(contexto completo em `HANDOFF_AUDITOR_ESOCIAL.md`).

## Publicar no Render (esocial.protecaorr.net)

1. **Render → New → Static Site**
   - Connect repository: `Haroldo7777/esocial-protecaorr`
   - Branch: `main`
   - Build Command: *(deixar vazio)*
   - Publish Directory: `.`
   - Create Static Site. Em ~1 min sai no ar num endereço `*.onrender.com`.

2. **Custom Domain** (dentro do serviço → Settings → Custom Domains)
   - Add Custom Domain: `esocial.protecaorr.net`
   - O Render mostra um alvo de **CNAME** (algo como `esocial-protecaorr.onrender.com`).

3. **DNS** (no painel onde está o domínio `protecaorr.net`)
   - Criar registro: **CNAME** | Host/Nome: `esocial` | Valor: o alvo `*.onrender.com`
     indicado pelo Render.
   - Propaga em minutos; o Render emite o certificado HTTPS automático.

Pronto: `https://esocial.protecaorr.net`.

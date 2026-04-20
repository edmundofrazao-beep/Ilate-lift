# ILATE Lift Site

Base nova e limpa para a rota `/lift/` do `ilate.pt`.

Objetivo:

- separar totalmente o Lift do CV e do ORCS
- manter esta rota simples e controlada pelo GitHub
- publicar por GitHub Actions via FTP para `/public_html/lift`

## Estrutura

- `index.html`
- `styles.css`
- `app.js`

## Deploy

O deploy é feito pelo workflow:

- `.github/workflows/deploy-lift.yml`

Secrets esperados no GitHub:

- `ILATE_FTP_SERVER`
- `ILATE_FTP_USERNAME`
- `ILATE_FTP_PASSWORD`

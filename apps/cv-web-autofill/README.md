# CV Web Autofill

App web local para preencher templates Word (`.docx`, `.docm`, `.dotx`) com blocos `CAMPO_...`.

## Arrancar

```bash
cd "/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/-- ILATE  --/AIProjeto/cv_web_autofill"
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py --server.port 8511
```

Ou usa o launcher:

```bash
./Run_CV_Web_Autofill.command
```

## Como usar

1. Carrega o template:
   - `CV2026-Edmundo_Frazao_PT_AUTOMACAO_TEMPLATE.docx` nesta pasta
   - ou a versão `.docm`
2. Cola o texto `CAMPO_...` no campo grande.
3. Clica `Gerar ficheiro`.
4. Clica `Descarregar ficheiro`.

## Ficheiros esperados

- `CV2026-Edmundo_Frazao_PT_AUTOMACAO_TEMPLATE.docx`
- `CV_INPUT_EXEMPLO_TRM.txt`
- `app.py`
- `requirements.txt`

## Campos suportados

- `CAMPO_NOME`
- `CAMPO_TITULO`
- `CAMPO_SUBTITULO`
- `CAMPO_CONTACTOS`
- `CAMPO_IDIOMAS`
- `CAMPO_SUMARIO`
- `CAMPO_COMP_TECNICAS`
- `CAMPO_FORMACAO`
- `CAMPO_CERTIFICACOES`
- `CAMPO_EXPERIENCIA`
- `CAMPO_REFERENCIAS`

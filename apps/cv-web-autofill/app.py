import copy
import io
import zipfile
from pathlib import Path
from typing import Dict, List

import streamlit as st
from lxml import etree

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W_NS}
BASE_DIR = Path(__file__).resolve().parent


def first_existing_path(candidates: List[Path]) -> Path:
    for path in candidates:
        if path.exists():
            return path
    return candidates[0]


DEFAULT_TEMPLATE_PATH = first_existing_path(
    [
        BASE_DIR / "CV2026-Edmundo_Frazao_PT_AUTOMACAO_TEMPLATE.docx",
        Path("/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/00. CVs/cv_web_autofill/CV2026-Edmundo_Frazao_PT_AUTOMACAO_TEMPLATE.docx"),
        Path("/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/00. CVs/CV2026-Edmundo_Frazao_PT.docx"),
    ]
)
EXAMPLE_INPUT_PATH = first_existing_path(
    [
        BASE_DIR / "CV_INPUT_EXEMPLO_TRM.txt",
        Path("/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/00. CVs/cv_web_autofill/CV_INPUT_EXEMPLO_TRM.txt"),
    ]
)


def qn(tag: str) -> str:
    return f"{{{W_NS}}}{tag}"


def parse_campos(raw: str) -> Dict[str, str]:
    data: Dict[str, List[str]] = {}
    current = None
    for line in raw.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        stripped = line.strip()
        if stripped.startswith("CAMPO_") and stripped.endswith(":"):
            current = stripped[:-1]
            data.setdefault(current, [])
        elif current is not None:
            data[current].append(line)
    return {k: "\n".join(v).strip("\n") for k, v in data.items()}


def paragraph_text(p: etree._Element) -> str:
    return "".join(p.xpath('.//w:t/text()', namespaces=NS)).strip()


def paragraph_style(p: etree._Element) -> str:
    vals = p.xpath('./w:pPr/w:pStyle/@w:val', namespaces=NS)
    return vals[0] if vals else ""


def set_paragraph_text(p: etree._Element, text: str) -> None:
    # Remove all runs and recreate one run preserving paragraph style/numbering.
    first_r = p.find(qn("r"))
    rpr = None
    if first_r is not None:
        first_rpr = first_r.find(qn("rPr"))
        if first_rpr is not None:
            rpr = copy.deepcopy(first_rpr)

    for ch in list(p):
        if ch.tag != qn("pPr"):
            p.remove(ch)

    if text == "":
        return

    r = etree.SubElement(p, qn("r"))
    if rpr is not None:
        r.append(rpr)
    t = etree.SubElement(r, qn("t"))
    if text.startswith(" ") or text.endswith(" "):
        t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    t.text = text


def normalize_lines(text: str, strip_dash: bool, drop_empty: bool) -> List[str]:
    out: List[str] = []
    for line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        clean = line.strip()
        if strip_dash and clean.startswith("- "):
            clean = clean[2:]
        if drop_empty and clean == "":
            continue
        out.append(clean)
    return out


def fill_span(paragraphs: List[etree._Element], start: int, end: int, lines: List[str]) -> None:
    slots = paragraphs[start : end + 1]
    for i, p in enumerate(slots):
        set_paragraph_text(p, lines[i] if i < len(lines) else "")


def fill_experience_span(paragraphs: List[etree._Element], start: int, end: int, raw_text: str) -> None:
    slots = paragraphs[start : end + 1]
    active_slots = [p for p in slots if paragraph_text(p) != ""]
    normal_slots = [p for p in active_slots if paragraph_style(p) != "ListBullet"]
    bullet_slots = [p for p in active_slots if paragraph_style(p) == "ListBullet"]

    # Parse experience into blocks: TITLE + bullet lines.
    blocks: List[Dict[str, List[str] | str]] = []
    current_title = ""
    current_bullets: List[str] = []
    for line in raw_text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        clean = line.strip()
        if not clean:
            continue
        if clean.startswith("- "):
            if current_title:
                current_bullets.append(clean[2:].strip())
            continue
        # new title starts
        if current_title:
            blocks.append({"title": current_title, "bullets": current_bullets[:]})
        current_title = clean
        current_bullets = []
    if current_title:
        blocks.append({"title": current_title, "bullets": current_bullets[:]})

    # Template-fixed experience layout slots: title1 + 5 bullets, title2 + 6 bullets, title3 + 3 bullets.
    # This prevents section drift in this specific CV template.
    target_title_count = min(len(normal_slots), 3)
    bullet_plan = [5, 6, 3]

    titles = [str(b["title"]) for b in blocks][:target_title_count]
    for i, p in enumerate(normal_slots):
        set_paragraph_text(p, titles[i] if i < len(titles) else "")

    flat_bullets: List[str] = []
    for bi, limit in enumerate(bullet_plan):
        if bi < len(blocks):
            bl = list(blocks[bi]["bullets"])  # type: ignore[index]
            flat_bullets.extend(bl[:limit])
        else:
            flat_bullets.extend([])

    for i, p in enumerate(bullet_slots):
        set_paragraph_text(p, flat_bullets[i] if i < len(flat_bullets) else "")

    # Keep structural empty lines empty so layout doesn't shift.
    for p in slots:
        if paragraph_text(p) == "":
            set_paragraph_text(p, "")


def fill_header_textboxes(root: etree._Element, campos: Dict[str, str]) -> None:
    textboxes = root.xpath('.//w:txbxContent', namespaces=NS)
    for tx in textboxes:
        paras = tx.xpath('./w:p', namespaces=NS)
        if len(paras) < 5:
            continue
        set_paragraph_text(paras[0], campos.get("CAMPO_NOME", ""))
        set_paragraph_text(paras[1], campos.get("CAMPO_TITULO", ""))
        set_paragraph_text(paras[2], campos.get("CAMPO_SUBTITULO", ""))
        set_paragraph_text(paras[3], campos.get("CAMPO_CONTACTOS", ""))
        set_paragraph_text(paras[4], campos.get("CAMPO_IDIOMAS", ""))


def fill_rigid_template(body_paras: List[etree._Element], campos: Dict[str, str]) -> None:
    # Fixed layout map for CV2026-Edmundo_Frazao_PT template (60 body paragraphs).
    # We only touch known content slots and keep all structural spacers as-is.
    sumario_idx = [4, 5, 6, 7, 8]
    comp_idx = list(range(10, 25))  # 15 bullets
    form_idx = [27, 28, 29, 30]

    exp_title_idx = [33, 39, 46]
    exp_bullet_idx = [34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 47, 48, 49]
    ref_idx = 51

    # Summary
    sum_lines = normalize_lines(campos.get("CAMPO_SUMARIO", ""), strip_dash=False, drop_empty=True)
    for i, pidx in enumerate(sumario_idx):
        set_paragraph_text(body_paras[pidx], sum_lines[i] if i < len(sum_lines) else "")

    # Rename section heading in output.
    set_paragraph_text(body_paras[9], "COMPETÊNCIAS CHAVE")

    # Technical skills
    comp_lines = normalize_lines(campos.get("CAMPO_COMP_TECNICAS", ""), strip_dash=True, drop_empty=True)
    for i, pidx in enumerate(comp_idx):
        set_paragraph_text(body_paras[pidx], comp_lines[i] if i < len(comp_lines) else "")

    # Education + certifications
    form_cert = "\n".join([campos.get("CAMPO_FORMACAO", ""), campos.get("CAMPO_CERTIFICACOES", "")]).strip("\n")
    form_lines = normalize_lines(form_cert, strip_dash=True, drop_empty=True)
    for i, pidx in enumerate(form_idx):
        set_paragraph_text(body_paras[pidx], form_lines[i] if i < len(form_lines) else "")

    # Experience parsed in fixed 3 blocks
    blocks: List[Dict[str, List[str] | str]] = []
    current_title = ""
    current_bullets: List[str] = []
    for line in campos.get("CAMPO_EXPERIENCIA", "").replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        clean = line.strip()
        if not clean:
            continue
        if clean.startswith("- "):
            if current_title:
                current_bullets.append(clean[2:].strip())
            continue
        if current_title:
            blocks.append({"title": current_title, "bullets": current_bullets[:]})
        current_title = clean
        current_bullets = []
    if current_title:
        blocks.append({"title": current_title, "bullets": current_bullets[:]})

    bullet_plan = [5, 6, 3]

    for i, pidx in enumerate(exp_title_idx):
        title = ""
        if i < len(blocks):
            title = str(blocks[i]["title"])
        set_paragraph_text(body_paras[pidx], title)

    flat_bullets: List[str] = []
    for bi, limit in enumerate(bullet_plan):
        if bi < len(blocks):
            bl = list(blocks[bi]["bullets"])  # type: ignore[index]
            flat_bullets.extend(bl[:limit])
    for i, pidx in enumerate(exp_bullet_idx):
        set_paragraph_text(body_paras[pidx], flat_bullets[i] if i < len(flat_bullets) else "")

    # References line
    set_paragraph_text(body_paras[ref_idx], campos.get("CAMPO_REFERENCIAS", "Disponíveis mediante pedido."))


def generate_document(template_bytes: bytes, campos_raw: str) -> bytes:
    campos = parse_campos(campos_raw)

    with zipfile.ZipFile(io.BytesIO(template_bytes), "r") as zin:
        files = {i.filename: zin.read(i.filename) for i in zin.infolist()}

    root = etree.fromstring(files["word/document.xml"])

    fill_header_textboxes(root, campos)

    body_paras = root.xpath('.//w:body/w:p', namespaces=NS)
    texts = [paragraph_text(p) for p in body_paras]

    if len(body_paras) < 52:
        raise RuntimeError("Template incompatível: número de parágrafos inferior ao esperado.")
    # Guard-rails to avoid writing to wrong template.
    expected = {
        3: "SUMÁRIO PROFISSIONAL",
        9: "COMPETÊNCIAS TÉCNICAS",
        26: "FORMAÇÃO E CERTIFICAÇÕES",
        31: "EXPERIÊNCIA PROFISSIONAL",
        50: "REFERÊNCIAS",
    }
    for idx, txt in expected.items():
        if paragraph_text(body_paras[idx]) != txt:
            raise RuntimeError("Template incompatível: usa o CV2026-Edmundo_Frazao_PT original.")

    fill_rigid_template(body_paras, campos)

    files["word/document.xml"] = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone="yes")

    out_io = io.BytesIO()
    with zipfile.ZipFile(out_io, "w", zipfile.ZIP_DEFLATED) as zout:
        for name, data in files.items():
            zout.writestr(name, data)
    return out_io.getvalue()


def campos_to_raw(campos: Dict[str, str]) -> str:
    order = [
        "CAMPO_NOME",
        "CAMPO_TITULO",
        "CAMPO_SUBTITULO",
        "CAMPO_CONTACTOS",
        "CAMPO_IDIOMAS",
        "CAMPO_SUMARIO",
        "CAMPO_COMP_TECNICAS",
        "CAMPO_FORMACAO",
        "CAMPO_CERTIFICACOES",
        "CAMPO_EXPERIENCIA",
        "CAMPO_REFERENCIAS",
    ]
    chunks: List[str] = []
    for key in order:
        chunks.append(f"{key}:")
        chunks.append(campos.get(key, ""))
        chunks.append("")
    return "\n".join(chunks).strip() + "\n"


def main() -> None:
    st.set_page_config(page_title="CV Web Autofill", page_icon="📄", layout="wide")
    st.title("CV Web Autofill")
    st.write("Template fixo ativo. Só precisas de colar o bloco CAMPO_... (ou carregar um .txt).")

    col1, col2 = st.columns([1, 1])
    with col1:
        use_default = st.checkbox("Usar template guardado (recomendado)", value=True)
        template = None
        template_bytes = None
        if use_default:
            if DEFAULT_TEMPLATE_PATH.exists():
                template_bytes = DEFAULT_TEMPLATE_PATH.read_bytes()
                st.caption(f"Template: {DEFAULT_TEMPLATE_PATH}")
            else:
                st.error(f"Template não encontrado: {DEFAULT_TEMPLATE_PATH}")
        else:
            template = st.file_uploader("Template (.docx, .docm, .dotx)", type=["docx", "docm", "dotx"])
        output_name = st.text_input("Nome do ficheiro de saída", value="CV_preenchido.docx")

    st.markdown(
        "Instruções rápidas:\n"
        "1. Mantém `Usar template guardado` ativo.\n"
        "2. Preenche o formulário (ou importa TXT).\n"
        "3. Clica `Gerar ficheiro` e depois `Descarregar ficheiro`."
    )

    if "prefill_campos" not in st.session_state:
        st.session_state["prefill_campos"] = {}

    abar1, abar2 = st.columns([1, 1])
    with abar1:
        if st.button("Carregar Exemplo", use_container_width=True):
            if EXAMPLE_INPUT_PATH.exists():
                st.session_state["prefill_campos"] = parse_campos(EXAMPLE_INPUT_PATH.read_text(encoding="utf-8"))
                st.success("Exemplo carregado no formulário.")
                st.rerun()
            else:
                st.error(f"Exemplo não encontrado: {EXAMPLE_INPUT_PATH}")
    with abar2:
        if st.button("Limpar Formulário", use_container_width=True):
            st.session_state["prefill_campos"] = {}
            st.rerun()

    txt_upload = st.file_uploader("Importar TXT CAMPO_... (opcional)", type=["txt"])
    if txt_upload is not None:
        st.session_state["prefill_campos"] = parse_campos(txt_upload.read().decode("utf-8", errors="ignore"))
        st.success("TXT importado. Revê/ajusta os campos no formulário.")
    imported_campos: Dict[str, str] = st.session_state.get("prefill_campos", {})

    with st.form("cv_form", clear_on_submit=False):
        st.subheader("Formulário")
        fcol1, fcol2 = st.columns(2)
        with fcol1:
            nome = st.text_input("Nome", value=imported_campos.get("CAMPO_NOME", ""))
            titulo = st.text_input("Título", value=imported_campos.get("CAMPO_TITULO", ""))
            subtitulo = st.text_input("Subtítulo", value=imported_campos.get("CAMPO_SUBTITULO", ""))
            contactos = st.text_input("Contactos", value=imported_campos.get("CAMPO_CONTACTOS", ""))
            idiomas = st.text_input("Idiomas", value=imported_campos.get("CAMPO_IDIOMAS", ""))
            referencias = st.text_input(
                "Referências",
                value=imported_campos.get("CAMPO_REFERENCIAS", "Disponíveis mediante pedido."),
            )
        with fcol2:
            sumario = st.text_area("Sumário (1 linha por parágrafo)", value=imported_campos.get("CAMPO_SUMARIO", ""), height=120)
            comp_tecnicas = st.text_area(
                "Competências chave (1 linha por bullet)",
                value=imported_campos.get("CAMPO_COMP_TECNICAS", ""),
                height=120,
            )
            formacao = st.text_area("Formação", value=imported_campos.get("CAMPO_FORMACAO", ""), height=90)
            certificacoes = st.text_area("Certificações", value=imported_campos.get("CAMPO_CERTIFICACOES", ""), height=90)
            experiencia = st.text_area(
                "Experiência (Título + bullets com '- ')",
                value=imported_campos.get("CAMPO_EXPERIENCIA", ""),
                height=220,
            )
        submitted = st.form_submit_button("Gerar ficheiro", type="primary")

    if submitted:
        if template_bytes is None:
            if template is None:
                st.error("Template indisponível. Ativa o template guardado ou carrega um template Word.")
                return
            template_bytes = template.read()
        campos_raw = campos_to_raw(
            {
                "CAMPO_NOME": nome,
                "CAMPO_TITULO": titulo,
                "CAMPO_SUBTITULO": subtitulo,
                "CAMPO_CONTACTOS": contactos,
                "CAMPO_IDIOMAS": idiomas,
                "CAMPO_SUMARIO": sumario,
                "CAMPO_COMP_TECNICAS": comp_tecnicas,
                "CAMPO_FORMACAO": formacao,
                "CAMPO_CERTIFICACOES": certificacoes,
                "CAMPO_EXPERIENCIA": experiencia,
                "CAMPO_REFERENCIAS": referencias,
            }
        )

        try:
            out_bytes = generate_document(template_bytes, campos_raw)
        except Exception as e:
            st.exception(e)
            return

        st.success("Ficheiro gerado com sucesso.")
        st.download_button(
            label="Descarregar ficheiro",
            data=out_bytes,
            file_name=output_name,
            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )


if __name__ == "__main__":
    main()

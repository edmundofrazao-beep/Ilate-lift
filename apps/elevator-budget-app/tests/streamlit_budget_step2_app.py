from __future__ import annotations

from elevator_budget_app import app as orcs_app
from elevator_budget_app.catalog_loader import load_catalogs


catalogs = load_catalogs()
payload = orcs_app.default_state(catalogs)
payload["project"]["cliente"] = "Cliente Teste"
payload["project"]["obra"] = "Elevador Bloco A"
payload["project"]["local"] = "Lisboa"
payload["project"]["numero_proposta"] = "PT-TEST-001"
payload["current_step"] = 2


def _fake_load_autosave():
    return {"payload": payload, "hash": "step2-test-hash", "saved_at": "ui-test-step2"}


def _fake_save_autosave(payload):
    return "ui-test-step2"


orcs_app.load_autosave = _fake_load_autosave
orcs_app.save_autosave = _fake_save_autosave
orcs_app.main()

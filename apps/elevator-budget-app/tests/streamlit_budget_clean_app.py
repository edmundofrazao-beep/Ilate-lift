from __future__ import annotations

from elevator_budget_app import app as orcs_app


def _fake_load_autosave():
    return None


def _fake_save_autosave(payload):
    return "ui-test-autosave"


orcs_app.load_autosave = _fake_load_autosave
orcs_app.save_autosave = _fake_save_autosave
orcs_app.main()

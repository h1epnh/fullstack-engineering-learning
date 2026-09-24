#!/usr/bin/env python3
"""Sanity-check data/*.json against DESIGN.md's schema and known totals.

Not a full jsonschema validator (see DESIGN.md "Định hướng tiếp theo" — deliberately deferred
until there's enough data to justify it). This just catches the mistakes most likely when
hand-editing the JSON: wrong counts, missing required fields, duplicate ids.
"""
import json
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def fail(msg: str) -> None:
    print(f"FAIL: {msg}")
    sys.exit(1)


def check_unique_ids(items: list[dict], label: str) -> None:
    ids = [item["id"] for item in items]
    dupes = {i for i in ids if ids.count(i) > 1}
    if dupes:
        fail(f"{label}: duplicate id(s) {dupes}")


def check_central_agencies() -> None:
    data = json.loads((DATA_DIR / "central_agencies.json").read_text())
    items = data["items"]
    check_unique_ids(items, "central_agencies")

    bo = [i for i in items if i["loai"] == "bo"]
    co_quan = [i for i in items if i["loai"] == "co_quan_ngang_bo"]
    if len(bo) != 14:
        fail(f"central_agencies: expected 14 'bo', found {len(bo)}")
    if len(co_quan) != 3:
        fail(f"central_agencies: expected 3 'co_quan_ngang_bo', found {len(co_quan)}")
    if not data.get("nguon"):
        fail("central_agencies: missing top-level 'nguon'")
    print(f"OK  central_agencies.json — {len(bo)} bộ + {len(co_quan)} cơ quan ngang bộ")


def check_department_framework() -> None:
    data = json.loads((DATA_DIR / "department_framework.json").read_text())
    items = data["items"]
    check_unique_ids(items, "department_framework")

    bat_buoc = [i for i in items if i["nhom"] == "bat_buoc"]
    dac_thu = [i for i in items if i["nhom"] == "dac_thu"]
    if len(bat_buoc) != 12:
        fail(f"department_framework: expected 12 'bat_buoc', found {len(bat_buoc)}")
    if len(dac_thu) != 4:
        fail(f"department_framework: expected 4 'dac_thu', found {len(dac_thu)}")
    if not data.get("nguon"):
        fail("department_framework: missing top-level 'nguon'")
    print(f"OK  department_framework.json — {len(bat_buoc)} bắt buộc + {len(dac_thu)} đặc thù")


def check_state_budget() -> None:
    data = json.loads((DATA_DIR / "state_budget.json").read_text())
    items = data["items"]
    years = [i["nam"] for i in items]
    if len(years) != len(set(years)):
        fail("state_budget: duplicate 'nam' entries")

    for item in items:
        if item["don_vi"] != "ty_dong":
            fail(f"state_budget: năm {item['nam']} — 'don_vi' phải là 'ty_dong', thấy {item['don_vi']!r}")
        thu, chi, boi_chi = item["tong_thu"], item["tong_chi"], item["boi_chi"]
        if thu["trung_uong"] + thu["dia_phuong"] != thu["tong"]:
            fail(f"state_budget: năm {item['nam']} — tong_thu trung_uong+dia_phuong != tong")
        if chi["trung_uong"] + chi["dia_phuong"] != chi["tong"]:
            fail(f"state_budget: năm {item['nam']} — tong_chi trung_uong+dia_phuong != tong")
        if boi_chi["trung_uong"] + boi_chi["dia_phuong"] != boi_chi["tong"]:
            fail(f"state_budget: năm {item['nam']} — boi_chi trung_uong+dia_phuong != tong")
        if not item.get("nguon"):
            fail(f"state_budget: năm {item['nam']} — missing 'nguon'")
    print(f"OK  state_budget.json — {len(items)} năm ({', '.join(str(y) for y in years)})")


ALLOWED_HEAD_ITEM_KEYS = {"co_quan_id", "chuc_danh", "ten_nguoi_dung_dau", "ghi_chu"}


def check_agency_heads() -> None:
    data = json.loads((DATA_DIR / "agency_heads.json").read_text())
    agencies = json.loads((DATA_DIR / "central_agencies.json").read_text())
    valid_ids = {a["id"] for a in agencies["items"]}

    items = data["items"]
    if len(items) != 17:
        fail(f"agency_heads: expected 17 items (14 bộ + 3 cơ quan ngang bộ), found {len(items)}")

    seen_ids = set()
    for item in items:
        # Guardrail against accidental scope creep — this file must stay name+title+source only,
        # per the boundary confirmed with the user before collecting it (see DESIGN.md).
        extra_keys = set(item.keys()) - ALLOWED_HEAD_ITEM_KEYS
        if extra_keys:
            fail(f"agency_heads: {item.get('co_quan_id')} has out-of-scope field(s) {extra_keys} — biography/photo/relationship fields are explicitly excluded")
        if item["co_quan_id"] not in valid_ids:
            fail(f"agency_heads: co_quan_id {item['co_quan_id']!r} not found in central_agencies.json")
        seen_ids.add(item["co_quan_id"])

    missing = valid_ids - seen_ids
    if missing:
        fail(f"agency_heads: missing head for agencies {missing}")
    if not data.get("thu_tuong"):
        fail("agency_heads: missing 'thu_tuong'")
    if not data.get("nguon"):
        fail("agency_heads: missing top-level 'nguon'")
    print(f"OK  agency_heads.json — {len(items)}/17 agencies covered, Thủ tướng: {data['thu_tuong']}")


def check_provinces() -> None:
    data = json.loads((DATA_DIR / "provinces.json").read_text())
    items = data["items"]
    check_unique_ids(items, "provinces")

    if len(items) != 34:
        fail(f"provinces: expected 34 units, found {len(items)}")

    sap_nhap = [i for i in items if i["sap_nhap"]]
    giu_nguyen = [i for i in items if not i["sap_nhap"]]
    if len(sap_nhap) != 23:
        fail(f"provinces: expected 23 sáp nhập, found {len(sap_nhap)}")
    if len(giu_nguyen) != 11:
        fail(f"provinces: expected 11 giữ nguyên, found {len(giu_nguyen)}")

    for item in sap_nhap:
        if not item.get("don_vi_cu"):
            fail(f"provinces: {item['id']} is sap_nhap=true but has no don_vi_cu")
    for item in giu_nguyen:
        if item.get("don_vi_cu") is not None:
            fail(f"provinces: {item['id']} is sap_nhap=false but don_vi_cu is not null")

    if not data.get("nguon"):
        fail("provinces: missing top-level 'nguon'")
    print(f"OK  provinces.json — 34 units ({len(sap_nhap)} sáp nhập, {len(giu_nguyen)} giữ nguyên)")


if __name__ == "__main__":
    check_central_agencies()
    check_agency_heads()
    check_department_framework()
    check_state_budget()
    check_provinces()
    print("All checks passed.")

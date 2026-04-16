from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from zipfile import ZipFile
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
SOURCE_XLSX = ROOT / 'data.local' / 'ข้อมูลยา.xlsx'
OUTPUT_TS = ROOT / 'src' / 'lib' / 'imported-drugs.ts'

NS = {
    'a': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    'p': 'http://schemas.openxmlformats.org/package/2006/relationships',
}

DOSAGE_FORM_MAP = {
    'TABLETS': 'tablet',
    'CAPSULES': 'capsule',
    'CAP': 'capsule',
    'INJECTIONS': 'injection',
    'SOLUTIONS': 'solution',
    'ORAL  SOLUTION': 'solution',
    'ORAL SOLUTION': 'solution',
    'VISCOUS SOLUTION': 'solution',
    'EYE SOLUTION': 'eye_drops',
    'IRRIGATION': 'solution',
    'LIQUID': 'other',
    'SUSPENSIONS': 'suspension',
    'CREAM': 'cream',
    'OINTMENT': 'ointment',
    'EYE OINTMENT': 'ointment',
    'TRANSDERMAL PATCH': 'patch',
    'INHALER': 'inhaler',
    'TURBUHALER': 'inhaler',
    'SUPPOSITORY': 'suppository',
    'SYRUPS': 'other',
    'POWDERS': 'other',
    'GEL': 'other',
    'NASAL SPRAY': 'other',
    'EAR DROP': 'ear_drops',
    'EYE DROP': 'eye_drops',
    'EYE GEL': 'other',
    'OIL': 'other',
    'MIXTURE': 'other',
    'LOTION': 'other',
    'ELIXIR': 'other',
    'NEBULE': 'other',
    'SHAMPOO': 'other',
    'ENEMA': 'other',
    'PASTE': 'other',
    'VAGINAL TABLET': 'tablet',
    'EMULSIONS': 'other',
    'NASAL DROP': 'drops',
    'IMPLANT.': 'other',
    '': 'other',
}

ROUTE_MAP = {
    'TABLETS': ['oral'],
    'CAPSULES': ['oral'],
    'CAP': ['oral'],
    'INJECTIONS': ['IV'],
    'SOLUTIONS': ['oral'],
    'ORAL  SOLUTION': ['oral'],
    'ORAL SOLUTION': ['oral'],
    'VISCOUS SOLUTION': ['oral'],
    'EYE SOLUTION': ['ophthalmic'],
    'IRRIGATION': ['other'],
    'LIQUID': ['oral'],
    'SUSPENSIONS': ['oral'],
    'CREAM': ['topical'],
    'OINTMENT': ['topical'],
    'EYE OINTMENT': ['ophthalmic'],
    'TRANSDERMAL PATCH': ['topical'],
    'INHALER': ['inhalation'],
    'TURBUHALER': ['inhalation'],
    'SUPPOSITORY': ['rectal'],
    'SYRUPS': ['oral'],
    'POWDERS': ['oral'],
    'GEL': ['topical'],
    'NASAL SPRAY': ['other'],
    'EAR DROP': ['other'],
    'EYE DROP': ['ophthalmic'],
    'EYE GEL': ['ophthalmic'],
    'OIL': ['topical'],
    'MIXTURE': ['oral'],
    'LOTION': ['topical'],
    'ELIXIR': ['oral'],
    'NEBULE': ['inhalation'],
    'SHAMPOO': ['topical'],
    'ENEMA': ['rectal'],
    'PASTE': ['topical'],
    'VAGINAL TABLET': ['other'],
    'EMULSIONS': ['oral'],
    'NASAL DROP': ['other'],
    'IMPLANT.': ['other'],
    '': ['other'],
}

STATUS_MAP = {
    'ยาที่เป็น High alert drugs (HAD)': 'had',
    'จ่ายฟรีเฉพาะสิทธิ UC': 'uc_free',
    'รายการยาที่ staff สั่งใช้-จ่ายได้เลย หรือ สั่งใช้ได้แต่ต้องมีใบกำกับ': 'staff_order',
    'ยาในบัญชียาหลักแห่งชาติ จ2': 'ned_national',
    'จ่ายได้ทุกสิทธิ': 'all_rights',
    'รายการยา OCPA, รายการยาที่มีมูลค่าสูง': 'ocpa',
    'ยา NED เฉพาะเบิกได้ (ไม่จ่ายฟรี)': 'ned_only',
    'Restrict drugs (ATB)': 'restrict_atb',
    'ยาที่ต้องชำระเงินเองทุกสิทธิ': 'self_pay',
}

STATUS_BY_COLOR = {
    '#0000FF': 'had',
    '#004080': 'uc_free',
    '#008000': 'staff_order',
    '#008080': 'ned_national',
    '#1C1C1C': 'all_rights',
    '#800080': 'ocpa',
    '#FF0000': 'ned_only',
    '#FF00FF': 'restrict_atb',
    '#FF8000': 'self_pay',
    '#FF8040': 'self_pay2',
}


def parse_shared_strings(zf: ZipFile) -> list[str]:
    if 'xl/sharedStrings.xml' not in zf.namelist():
        return []
    root = ET.fromstring(zf.read('xl/sharedStrings.xml'))
    values: list[str] = []
    for si in root.findall('a:si', NS):
        values.append(''.join(node.text or '' for node in si.iterfind('.//a:t', NS)))
    return values


def parse_sheet_rows(path: Path) -> list[list[str]]:
    with ZipFile(path) as zf:
        shared_strings = parse_shared_strings(zf)
        workbook = ET.fromstring(zf.read('xl/workbook.xml'))
        rels = ET.fromstring(zf.read('xl/_rels/workbook.xml.rels'))
        rel_map = {
            rel.attrib['Id']: rel.attrib['Target'].lstrip('/')
            for rel in rels.findall('p:Relationship', NS)
        }
        first_sheet = workbook.find('a:sheets', NS)[0]
        target = rel_map[first_sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]
        sheet = ET.fromstring(zf.read(target))
        rows: list[list[str]] = []
        for row in sheet.find('a:sheetData', NS).findall('a:row', NS):
            values: list[str] = []
            for cell in row.findall('a:c', NS):
                inline = cell.find('a:is', NS)
                if inline is not None:
                    values.append(''.join(node.text or '' for node in inline.iterfind('.//a:t', NS)))
                    continue
                value = cell.find('a:v', NS)
                if value is None:
                    values.append('')
                    continue
                if cell.attrib.get('t') == 's':
                    values.append(shared_strings[int(value.text)])
                else:
                    values.append(value.text or '')
            rows.append(values)
        return rows


def compact_text(value: str) -> str:
    return re.sub(r'\s+', ' ', value).strip()


def derive_trade_name(tmt_name: str, thai_name: str, generic_name: str) -> str:
    text = compact_text(tmt_name)
    if text:
        return re.split(r'\s+\(', text, maxsplit=1)[0].strip()
    if thai_name:
        return compact_text(thai_name)
    return generic_name


def derive_therapeutic_class(form_label: str) -> str:
    label = compact_text(form_label)
    if not label:
        return 'Imported formulary'
    return label.title()


def build_records(rows: list[list[str]]) -> list[dict[str, Any]]:
    if not rows:
        return []

    headers = [compact_text(item) for item in rows[0]]
    records: list[dict[str, Any]] = []
    imported_at = datetime.now(timezone.utc).isoformat()

    for index, row in enumerate(rows[1:], start=2):
        values = row + [''] * (len(headers) - len(row))
        data = dict(zip(headers, (compact_text(value) for value in values)))
        generic_name = data.get('ชื่อสามัญ', '')
        if not generic_name:
            continue

        dosage_label = data.get('Dosage Form', '').upper()
        status_label = data.get('สถานะ', '')
        color_label = data.get('สีตัว', '').upper()
        thai_name = data.get('ชื่อภาษาไทย', '')
        tmt_name = data.get('TMT TP Name', '')
        trade_name = derive_trade_name(tmt_name, thai_name, generic_name)
        dosage_form = DOSAGE_FORM_MAP.get(dosage_label, 'other')
        routes = ROUTE_MAP.get(dosage_label, ['other'])
        status = STATUS_MAP.get(status_label) or STATUS_BY_COLOR.get(color_label, 'all_rights')
        notes_parts = [
            f'Imported from Excel row {index}',
            f'TMT TP Name: {tmt_name}' if tmt_name else '',
            f'Color code: {color_label}' if color_label else '',
        ]

        records.append({
            'id': f'excel-{index - 1:04d}',
            'genericName': generic_name,
            'genericNameTH': thai_name,
            'tradeName': trade_name,
            'dosageForm': dosage_form,
            'strength': data.get('ความแรง', '') or '-',
            'route': routes,
            'therapeuticClass': derive_therapeutic_class(dosage_label),
            'indication': tmt_name or 'Imported from hospital formulary spreadsheet',
            'contraindication': '',
            'sideEffects': '',
            'interactions': '',
            'pregnancyCategory': 'N/A',
            'g6pdSafe': True,
            'storage': 'เก็บตามข้อกำหนดของโรงพยาบาล',
            'pricePerUnit': 0,
            'status': status,
            'notes': ' | '.join(part for part in notes_parts if part),
            'createdAt': imported_at,
            'updatedAt': imported_at,
            'updatedBy': 'excel-import',
        })

    return records


def write_module(records: list[dict[str, Any]]) -> None:
    payload = json.dumps(records, ensure_ascii=False, indent=2)
    content = (
        "import type { Drug } from '@/types';\n\n"
        "// Auto-generated from data.local/ข้อมูลยา.xlsx by scripts/import_drugs_from_xlsx.py\n"
        f'export const importedDrugs: Drug[] = {payload};\n'
    )
    OUTPUT_TS.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_TS.write_text(content, encoding='utf-8')


def main() -> None:
    rows = parse_sheet_rows(SOURCE_XLSX)
    records = build_records(rows)
    write_module(records)
    print(f'Generated {len(records)} drugs to {OUTPUT_TS.relative_to(ROOT)}')


if __name__ == '__main__':
    main()

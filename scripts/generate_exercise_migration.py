#!/usr/bin/env python3
"""Generate the Exercise catalog migration from the Functional Fitness XLSX."""

from __future__ import annotations

import argparse
import re
import unicodedata
import uuid
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PACKAGE_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
NS = {"m": MAIN_NS, "r": REL_NS, "p": PACKAGE_REL_NS}

DIFFICULTIES = {
    "Beginner": "BEGINNER",
    "Novice": "NOVICE",
    "Intermediate": "INTERMEDIATE",
    "Advanced": "ADVANCED",
    "Expert": "EXPERT",
    "Master": "MASTER",
    "Grand Master": "GRAND_MASTER",
    "Legendary": "LEGENDARY",
}

MUSCLE_GROUPS = {
    "Abdominals": "ABDOMINALS",
    "Abductors": "ABDUCTORS",
    "Adductors": "ADDUCTORS",
    "Back": "BACK",
    "Biceps": "BICEPS",
    "Calves": "CALVES",
    "Chest": "CHEST",
    "Forearms": "FOREARMS",
    "Glutes": "GLUTES",
    "Hamstrings": "HAMSTRINGS",
    "Hip Flexors": "HIP_FLEXORS",
    "Quadriceps": "QUADRICEPS",
    "Shins": "SHINS",
    "Shoulders": "SHOULDERS",
    "Trapezius": "TRAPEZIUS",
    "Triceps": "TRICEPS",
}

PRIME_MOVERS = {
    "Adductor Magnus": "ADDUCTOR_MAGNUS",
    "Anterior Deltoids": "ANTERIOR_DELTOID",
    "Biceps Brachii": "BICEPS_BRACHII",
    "Biceps Femoris": "BICEPS_FEMORIS",
    "Brachioradialis": "BRACHIORADIALIS",
    "Erector Spinae": "ERECTOR_SPINAE",
    "Gastrocnemius": "GASTROCNEMIUS",
    "Gluteus Maximus": "GLUTEUS_MAXIMUS",
    "Gluteus Medius": "GLUTEUS_MEDIUS",
    "Iliopsoas": "ILIOPSOAS",
    "Infraspinatus": "INFRASPINATUS",
    "Lateral Deltoids": "LATERAL_DELTOID",
    "Latissimus Dorsi": "LATISSIMUS_DORSI",
    "Obliques": "OBLIQUES",
    "Pectoralis Major": "PECTORALIS_MAJOR",
    "Posterior Deltoids": "POSTERIOR_DELTOID",
    "Quadriceps Femoris": "QUADRICEPS_FEMORIS",
    "Rectus Abdominis": "RECTUS_ABDOMINIS",
    "Soleus": "SOLEUS",
    "Subscapularis": "SUBSCAPULARIS",
    "Tibialis Anterior": "TIBIALIS_ANTERIOR",
    "Triceps Brachii": "TRICEPS_BRACHII",
    "Upper Trapezius": "UPPER_TRAPEZIUS",
    # The source workbook and schema both retain this spelling.
    "Vastus Mediais": "VASTUS_MEDIAS",
}

BODY_REGIONS = {
    "Core": "CORE",
    "Full Body": "FULL_BODY",
    "Upper Body": "UPPER_BODY",
    "Lower Body": "LOWER_BODY",
}

MECHANICS = {
    "Compound": "COMPOUND",
    "Isolation": "ISOLATION",
    "Pull": "PULL",
    # The model is non-null and declares COMPOUND as its default.
    "": "COMPOUND",
}

ENUMS = {
    "Difficulty": list(DIFFICULTIES.values()),
    "MuscleGroup": list(MUSCLE_GROUPS.values()),
    "PrimeMoverMuscle": list(PRIME_MOVERS.values()),
    "BodyRegion": list(BODY_REGIONS.values()),
    "Mechanics": ["COMPOUND", "ISOLATION", "PULL"],
}


def column_number(reference: str) -> int:
    letters = re.match(r"[A-Z]+", reference)
    if not letters:
        raise ValueError(f"Invalid cell reference: {reference}")
    result = 0
    for character in letters.group():
        result = result * 26 + ord(character) - 64
    return result


def sql_text(value: str | None) -> str:
    if value is None or value == "":
        return "NULL"
    return "'" + value.replace("'", "''") + "'"


def sql_array(values: list[str]) -> str:
    if not values:
        return "ARRAY[]::TEXT[]"
    return "ARRAY[" + ", ".join(sql_text(value) for value in values) + "]::TEXT[]"


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-")


def workbook_rows(path: Path) -> list[dict[str, object]]:
    with ZipFile(path) as archive:
        shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
        shared = [
            "".join(text.text or "" for text in item.iter(f"{{{MAIN_NS}}}t"))
            for item in shared_root.findall("m:si", NS)
        ]

        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        workbook_rels = ET.fromstring(
            archive.read("xl/_rels/workbook.xml.rels")
        )
        workbook_targets = {
            relation.attrib["Id"]: relation.attrib["Target"]
            for relation in workbook_rels
        }
        sheets = workbook.find("m:sheets", NS)
        if sheets is None:
            raise ValueError("Workbook has no sheets")
        exercise_sheet = next(
            sheet
            for sheet in sheets
            if sheet.attrib["name"] == "Exercises"
        )
        relationship_id = exercise_sheet.attrib[f"{{{REL_NS}}}id"]
        target = workbook_targets[relationship_id]
        sheet_path = target if target.startswith("xl/") else f"xl/{target.lstrip('/')}"
        sheet_root = ET.fromstring(archive.read(sheet_path))

        directory, filename = sheet_path.rsplit("/", 1)
        sheet_rels_path = f"{directory}/_rels/{filename}.rels"
        sheet_rels = ET.fromstring(archive.read(sheet_rels_path))
        link_targets = {
            relationship.attrib["Id"]: relationship.attrib.get("Target", "")
            for relationship in sheet_rels
        }
        hyperlinks: dict[str, str] = {}
        hyperlinks_root = sheet_root.find("m:hyperlinks", NS)
        if hyperlinks_root is not None:
            for hyperlink in hyperlinks_root:
                relation_id = hyperlink.attrib.get(f"{{{REL_NS}}}id")
                reference = hyperlink.attrib.get("ref")
                if relation_id and reference:
                    hyperlinks[reference] = link_targets.get(relation_id, "")

        result: list[dict[str, object]] = []
        sheet_data = sheet_root.find("m:sheetData", NS)
        if sheet_data is None:
            raise ValueError("Exercises sheet has no rows")
        for row in sheet_data:
            row_number = int(row.attrib["r"])
            if row_number < 17:
                continue

            cells: dict[int, str] = {}
            for cell in row.findall("m:c", NS):
                reference = cell.attrib["r"]
                value_node = cell.find("m:v", NS)
                value = "" if value_node is None else value_node.text or ""
                if cell.attrib.get("t") == "s" and value:
                    value = shared[int(value)]
                elif cell.attrib.get("t") == "inlineStr":
                    value = "".join(
                        text.text or ""
                        for text in cell.iter(f"{{{MAIN_NS}}}t")
                    )
                cells[column_number(reference)] = value.strip()

            name = cells.get(2, "")
            if not name:
                continue
            equipment = [
                item
                for item in (cells.get(10, ""), cells.get(12, ""))
                if item and item != "None"
            ]
            result.append(
                {
                    "row": row_number,
                    "name": name,
                    "short_demo": hyperlinks.get(f"C{row_number}"),
                    "in_depth_demo": hyperlinks.get(f"D{row_number}"),
                    "difficulty": DIFFICULTIES[cells.get(5, "")],
                    "muscle_group": MUSCLE_GROUPS[cells.get(6, "")],
                    "prime_mover": PRIME_MOVERS[cells.get(7, "")],
                    "equipment": list(dict.fromkeys(equipment)),
                    "body_region": BODY_REGIONS[cells.get(28, "")],
                    "mechanics": MECHANICS[cells.get(30, "")],
                }
            )
        return result


def enum_sql(name: str, values: list[str]) -> str:
    quoted_values = ", ".join(sql_text(value) for value in values)
    return (
        "DO $$ BEGIN\n"
        f'  CREATE TYPE "{name}" AS ENUM ({quoted_values});\n'
        "EXCEPTION\n"
        "  WHEN duplicate_object THEN NULL;\n"
        "END $$;"
    )


def generate_sql(rows: list[dict[str, object]]) -> str:
    slug_counts: dict[str, int] = {}
    values: list[str] = []
    for item in rows:
        name = str(item["name"])
        base_slug = slugify(name)
        slug_counts[base_slug] = slug_counts.get(base_slug, 0) + 1
        occurrence = slug_counts[base_slug]
        slug = base_slug if occurrence == 1 else f"{base_slug}-{occurrence}"
        exercise_id = str(
            uuid.uuid5(
                uuid.NAMESPACE_URL,
                f"functional-fitness-exercise-database-v2.9/{item['row']}/{name}",
            )
        )
        values.append(
            "("
            + ", ".join(
                [
                    sql_text(exercise_id),
                    sql_text(name),
                    sql_text(slug),
                    sql_text(item["short_demo"]),
                    sql_text(item["in_depth_demo"]),
                    sql_text(str(item["difficulty"])),
                    sql_text(str(item["muscle_group"])),
                    sql_text(str(item["prime_mover"])),
                    sql_array(item["equipment"]),
                    sql_text(str(item["body_region"])),
                    sql_text(str(item["mechanics"])),
                    "CURRENT_TIMESTAMP",
                    "CURRENT_TIMESTAMP",
                    "NULL",
                ]
            )
            + ")"
        )

    sections = [
        "-- Generated from Functional Fitness Exercise Database v2.9.",
        "-- Source terms state personal use; confirm licensing before commercial redistribution.",
        *[enum_sql(name, enum_values) for name, enum_values in ENUMS.items()],
        'ALTER TYPE "MuscleGroup" ADD VALUE IF NOT EXISTS \'ADDUCTORS\';',
        """
CREATE TABLE IF NOT EXISTS "exercise" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "shortDemo" TEXT,
  "inDepthDemo" TEXT,
  "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
  "muscleGroups" "MuscleGroup" NOT NULL,
  "primeMoverMuscle" "PrimeMoverMuscle" NOT NULL,
  "equipments" TEXT[] NOT NULL,
  "bodyRegion" "BodyRegion" NOT NULL DEFAULT 'FULL_BODY',
  "mechanics" "Mechanics" NOT NULL DEFAULT 'COMPOUND',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdById" TEXT,
  CONSTRAINT "exercise_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "exercise_slug_key" ON "exercise"("slug");

DO $$ BEGIN
  ALTER TABLE "exercise"
    ADD CONSTRAINT "exercise_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "user"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
""".strip(),
    ]

    columns = (
        '"id", "name", "slug", "shortDemo", "inDepthDemo", "difficulty", '
        '"muscleGroups", "primeMoverMuscle", "equipments", "bodyRegion", '
        '"mechanics", "createdAt", "updatedAt", "createdById"'
    )
    batch_size = 250
    for start in range(0, len(values), batch_size):
        batch = values[start : start + batch_size]
        sections.append(
            f'INSERT INTO "exercise" ({columns}) VALUES\n'
            + ",\n".join(batch)
            + '\nON CONFLICT ("slug") DO NOTHING;'
        )
    return "\n\n".join(sections) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("workbook", type=Path)
    parser.add_argument("schema_output", type=Path)
    parser.add_argument("seed_output", type=Path)
    args = parser.parse_args()

    rows = workbook_rows(args.workbook)
    if len(rows) != 3242:
        raise ValueError(f"Expected 3242 exercises, found {len(rows)}")

    sql = generate_sql(rows)
    insert_marker = 'INSERT INTO "exercise"'
    schema_sql, seed_remainder = sql.split(insert_marker, 1)
    seed_sql = (
        "-- Generated from Functional Fitness Exercise Database v2.9.\n"
        "-- Apply only after the Exercise enums and table migration commits.\n\n"
        f"{insert_marker}{seed_remainder}"
    )

    args.schema_output.parent.mkdir(parents=True, exist_ok=True)
    args.seed_output.parent.mkdir(parents=True, exist_ok=True)
    args.schema_output.write_text(schema_sql, encoding="utf-8")
    args.seed_output.write_text(seed_sql, encoding="utf-8")
    print(f"Wrote Exercise schema to {args.schema_output}")
    print(f"Wrote {len(rows)} exercises to {args.seed_output}")


if __name__ == "__main__":
    main()

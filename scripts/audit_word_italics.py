import glob
import json
import os
import re
import unicodedata
import xml.etree.ElementTree as ET
import zipfile

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def normalize(value):
    value = unicodedata.normalize("NFD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def word_italics(path):
    root = ET.fromstring(zipfile.ZipFile(path).read("word/document.xml"))
    result = {}
    for paragraph in root.findall(".//w:body/w:p", NS):
        runs = paragraph.findall(".//w:r", NS)
        text = "".join("".join(run.itertext()) for run in runs).strip()
        italic = []
        for run in runs:
            props = run.find("w:rPr", NS)
            if props is not None and props.find("w:i", NS) is not None:
                run_text = "".join(run.itertext())
                if run_text.strip():
                    italic.append(run_text)
        if text and italic:
            result.setdefault(normalize(text), []).append(italic)
    return result


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from strings(item)


reference = word_italics(r"C:\Users\USUARIO\Downloads\De agua viento y verdor 4.docx")
mapping = {}
for content_file in glob.glob("src/content/*.json"):
    name = os.path.basename(content_file)
    if name in {"territories.json", "territory-template.json"}:
        continue
    data = json.load(open(content_file, encoding="utf-8"))
    values = list(strings(data))
    matching = [value for value in values if normalize(value) in reference]
    for value in matching:
        key = normalize(value)
        terms = mapping.setdefault(key, [])
        for group in reference[key]:
            for term in group:
                if term not in terms:
                    terms.append(term)
    print(name, "strings", len(values), "matched", len(matching))

with open("assets/word-italics-map.js", "w", encoding="utf-8") as output:
    output.write("window.AudiotecaWordItalics = ")
    json.dump(mapping, output, ensure_ascii=False, separators=(",", ":"))
    output.write(";\n")

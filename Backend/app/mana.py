import re
import unicodedata

from app.schemas import CardCategory, ManaColor

COLOR_ORDER: tuple[ManaColor, ...] = ("W", "U", "B", "R", "G")

COLOR_NAMES: dict[str, ManaColor] = {
    "w": "W",
    "white": "W",
    "branco": "W",
    "branca": "W",
    "u": "U",
    "blue": "U",
    "azul": "U",
    "b": "B",
    "black": "B",
    "preto": "B",
    "preta": "B",
    "r": "R",
    "red": "R",
    "vermelho": "R",
    "vermelha": "R",
    "g": "G",
    "green": "G",
    "verde": "G",
}

CATEGORY_NAMES: dict[str, CardCategory] = {
    "creature": "creature",
    "criatura": "creature",
    "spell": "spell",
    "magica": "spell",
    "instantaneo": "spell",
    "instant": "spell",
    "sorcery": "spell",
    "feitiço": "spell",
    "feitico": "spell",
    "encantamento": "spell",
    "land": "land",
    "terreno": "land",
    "other": "other",
    "outro": "other",
    "outra": "other",
    "artefato": "other",
    "artifact": "other",
}


def fold_text(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value.strip())
    stripped = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
    return stripped.casefold()


def header_key(value: str) -> str:
    return " ".join(re.sub(r"[^a-z0-9]+", " ", fold_text(value)).split())


def cell_text(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return str(value)
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    if isinstance(value, int):
        return str(value)
    return str(value).strip()


def normalize_mana(cost: str) -> str:
    cleaned = cost.strip().upper().replace("{", "").replace("}", "").replace(" ", "")
    if not cleaned:
        return ""
    match = re.fullmatch(r"(\d+)?([WUBRGCX]*)", cleaned)
    if not match:
        raise ValueError(
            "Custo de mana inválido. Use o número dos genéricos e as letras W U B R G. Ex.: 2U, 1, 1WU."
        )
    generic, pips = match.groups()
    return f"{generic or ''}{pips or ''}"


def colors_from_mana(cost: str) -> list[ManaColor]:
    try:
        normalized = normalize_mana(cost)
    except ValueError:
        return []
    found: list[ManaColor] = []
    for symbol in normalized:
        if symbol in COLOR_ORDER and symbol not in found:
            found.append(symbol)  # type: ignore[arg-type]
    return [color for color in COLOR_ORDER if color in found]


def parse_colors(value: str, mana_cost: str = "") -> list[ManaColor]:
    raw = value.strip()
    if not raw:
        return colors_from_mana(mana_cost)
    folded = fold_text(raw)
    if folded in {"incolor", "incolore", "colorless", "-"}:
        return []
    compact = re.sub(r"[^a-z]", "", folded)
    if compact and all(ch in "wubrg" for ch in compact):
        found = {COLOR_NAMES[ch] for ch in compact}
        return [color for color in COLOR_ORDER if color in found]
    tokens = [token for token in re.split(r"[,;/|+]+|(?:\s+e\s+)|\s+", folded) if token]
    found: list[ManaColor] = []
    for token in tokens:
        color = COLOR_NAMES.get(token)
        if not color:
            raise ValueError("Cor inválida. Use W U B R G ou Branco, Azul, Preto, Vermelho, Verde.")
        if color not in found:
            found.append(color)
    return [color for color in COLOR_ORDER if color in found]


def parse_category(value: str, type_line: str = "") -> CardCategory:
    key = header_key(value)
    if key in CATEGORY_NAMES:
        return CATEGORY_NAMES[key]
    if key:
        raise ValueError("Categoria inválida. Use Criatura, Mágica, Terreno ou Outro.")
    type_key = fold_text(type_line)
    if "criatura" in type_key or "creature" in type_key:
        return "creature"
    if "terreno" in type_key or "land" in type_key:
        return "land"
    if any(word in type_key for word in ("instant", "sorcery", "magica", "encantamento", "feitico")):
        return "spell"
    return "other"


def parse_quantity(value: str) -> int:
    raw = value.strip()
    if not raw:
        return 1
    try:
        quantity = int(float(raw.replace(",", ".")))
    except ValueError as error:
        raise ValueError("Quantidade precisa ser um número.") from error
    if quantity < 1:
        raise ValueError("Quantidade mínima é 1.")
    return quantity

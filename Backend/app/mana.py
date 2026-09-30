import re
import unicodedata

from app.schemas import CardCategory, ManaColor

COLOR_ORDER: tuple[ManaColor, ...] = ("W", "U", "B", "R", "G")
COLOR_LETTERS = "WUBRG"
PIP_LETTERS = "WUBRGCX"

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

_MANA_ERROR = (
    "Custo de mana inválido. Use 2U, 1, 1WU. Híbrida (verde ou vermelha): 1R/G."
)


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


def _sort_hybrid(left: str, right: str) -> str:
    if left in COLOR_ORDER and right in COLOR_ORDER:
        ordered = [color for color in COLOR_ORDER if color in {left, right}]
        if len(ordered) == 2:
            return f"{ordered[0]}/{ordered[1]}"
    return f"{left}/{right}"


def _normalize_pip(raw: str) -> str:
    pip = raw.strip().upper()
    if re.fullmatch(r"\d+", pip):
        return pip
    if re.fullmatch(r"[WUBRG]/[WUBRG]", pip):
        left, right = pip.split("/")
        return _sort_hybrid(left, right)
    if re.fullmatch(r"2/[WUBRG]", pip):
        return pip
    if len(pip) == 1 and pip in PIP_LETTERS:
        return pip
    raise ValueError(_MANA_ERROR)


def tokenize_mana(cost: str) -> list[str]:
    compact = re.sub(r"\s+", "", cost.strip().upper())
    if not compact:
        return []
    braces = re.findall(r"\{([^}]+)\}", compact)
    if braces:
        return [_normalize_pip(part) for part in braces]
    body = compact.replace("{", "").replace("}", "")
    pips: list[str] = []
    index = 0
    while index < len(body):
        char = body[index]
        if char.isdigit():
            end = index
            while end < len(body) and body[end].isdigit():
                end += 1
            if end + 1 < len(body) and body[end] == "/" and body[end + 1] in COLOR_LETTERS:
                pips.append(_normalize_pip(body[index : end + 2]))
                index = end + 2
                continue
            pips.append(body[index:end])
            index = end
            continue
        if (
            char in COLOR_LETTERS
            and index + 2 < len(body)
            and body[index + 1] == "/"
            and body[index + 2] in COLOR_LETTERS
        ):
            pips.append(_normalize_pip(body[index : index + 3]))
            index += 3
            continue
        if char in PIP_LETTERS:
            pips.append(char)
            index += 1
            continue
        raise ValueError(_MANA_ERROR)
    return pips


def normalize_mana(cost: str) -> str:
    return "".join(tokenize_mana(cost))


def colors_from_mana(cost: str) -> list[ManaColor]:
    try:
        pips = tokenize_mana(cost)
    except ValueError:
        return []
    found: list[ManaColor] = []
    for pip in pips:
        for symbol in pip.replace("/", ""):
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

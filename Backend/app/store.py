import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.media import delete_image, public_url, save_image
from app.models import Card, Collection, Deck, DeckEntry, Game, GameInstance
from app.schemas import CardDraft, CollectionDraft, DeckDraft

GAME_ID = "current"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def new_id() -> str:
    return str(uuid.uuid4())


def normalize_number(value: str) -> str:
    digits = "".join(ch for ch in value if ch.isdigit())
    if not digits:
        return ""
    return str(int(digits))


def split_colors(value: str) -> list[str]:
    return [ch for ch in value if ch in "WUBRG"]


def join_colors(colors: list[str]) -> str:
    order = "WUBRG"
    unique = []
    for color in colors:
        if color in order and color not in unique:
            unique.append(color)
    return "".join(sorted(unique, key=order.index))


def dump_collection(item: Collection) -> dict:
    data = {
        "id": item.id,
        "name": item.name,
        "code": item.code,
        "description": item.description,
        "createdAt": item.created_at,
    }
    cover = public_url(item.cover_file)
    if cover:
        data["coverImage"] = cover
    return data


def dump_card(item: Card) -> dict:
    data = {
        "id": item.id,
        "name": item.name,
        "collectionId": item.collection_id,
        "number": item.number,
        "typeLine": item.type_line,
        "category": item.category,
        "manaCost": item.mana_cost,
        "colors": split_colors(item.colors),
        "quantity": item.quantity,
        "text": item.text,
        "createdAt": item.created_at,
    }
    image = public_url(item.image_file)
    if image:
        data["image"] = image
    return data


def dump_deck(item: Deck) -> dict:
    data = {
        "id": item.id,
        "name": item.name,
        "entries": [{"cardId": entry.card_id, "quantity": entry.quantity} for entry in item.entries],
        "createdAt": item.created_at,
    }
    if item.last_used_at:
        data["lastUsedAt"] = item.last_used_at
    return data


def dump_game(db: Session) -> dict | None:
    game = db.get(Game, GAME_ID)
    if not game:
        return None
    instances = db.scalars(
        select(GameInstance).where(GameInstance.game_id == GAME_ID).order_by(GameInstance.position, GameInstance.instance_id)
    ).all()
    zones = {"hand": [], "graveyard": [], "played": []}
    for instance in instances:
        zones.setdefault(instance.zone, []).append({"instanceId": instance.instance_id, "cardId": instance.card_id})
    return {
        "deckId": game.deck_id,
        "phase": game.phase,
        "hand": zones["hand"],
        "graveyard": zones["graveyard"],
        "played": zones["played"],
        "startedAt": game.started_at,
    }


def get_state(db: Session) -> dict:
    collections = db.scalars(select(Collection).order_by(Collection.created_at, Collection.name)).all()
    cards = db.scalars(select(Card).order_by(Card.collection_id, Card.number)).all()
    decks = db.scalars(select(Deck).options(selectinload(Deck.entries)).order_by(Deck.created_at.desc())).all()
    return {
        "collections": [dump_collection(item) for item in collections],
        "cards": [dump_card(item) for item in cards],
        "decks": [dump_deck(item) for item in decks],
        "game": dump_game(db),
    }


def mutation(db: Session, value=None) -> dict:
    payload = get_state(db)
    if value is not None:
        payload["value"] = value
    return payload


def _touch_deck(db: Session, deck_id: str, at: str) -> None:
    deck = db.get(Deck, deck_id)
    if deck:
        deck.last_used_at = at


def _require_game(db: Session) -> Game:
    game = db.get(Game, GAME_ID)
    if not game:
        raise HTTPException(status_code=400, detail="Nenhuma partida em andamento.")
    return game


def _replace_entries(db: Session, deck: Deck, entries: list) -> None:
    deck.entries.clear()
    db.flush()
    for entry in entries:
        if entry.quantity <= 0:
            continue
        if not db.get(Card, entry.cardId):
            raise HTTPException(status_code=400, detail="Uma das cartas do deck não existe.")
        deck.entries.append(DeckEntry(card_id=entry.cardId, quantity=entry.quantity))


def create_collection(db: Session, draft: CollectionDraft) -> dict:
    name = draft.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Dê um nome à coleção.")
    item = Collection(
        id=new_id(),
        name=name,
        code=draft.code.strip().upper(),
        description=draft.description.strip(),
        cover_file=save_image(draft.coverImage, "cover") if "coverImage" in draft.model_fields_set else None,
        created_at=now_iso(),
    )
    db.add(item)
    db.commit()
    return mutation(db, dump_collection(item))


def create_card(db: Session, draft: CardDraft) -> dict:
    return _upsert_card(db, None, draft)


def update_card(db: Session, card_id: str, draft: CardDraft) -> dict:
    current = db.get(Card, card_id)
    if not current:
        raise HTTPException(status_code=404, detail="Carta não encontrada.")
    return _upsert_card(db, current, draft)


def _upsert_card(db: Session, current: Card | None, draft: CardDraft) -> dict:
    name = draft.name.strip()
    number = normalize_number(draft.number)
    if not name or not draft.collectionId or not number:
        raise HTTPException(status_code=400, detail="Preencha nome, coleção e número.")
    if not db.get(Collection, draft.collectionId):
        raise HTTPException(status_code=400, detail="Coleção não encontrada.")
    duplicate = db.scalar(
        select(Card).where(
            Card.collection_id == draft.collectionId,
            Card.number == number,
            Card.id != (current.id if current else ""),
        )
    )
    if duplicate:
        raise HTTPException(status_code=400, detail="Já existe uma carta com esse número nesta coleção.")
    image_file = current.image_file if current else None
    if "image" in draft.model_fields_set:
        image_file = save_image(draft.image, "card")
    payload = {
        "name": name,
        "collection_id": draft.collectionId,
        "number": number,
        "type_line": draft.typeLine.strip(),
        "category": draft.category,
        "mana_cost": draft.manaCost.strip().upper(),
        "colors": join_colors(list(draft.colors)),
        "quantity": max(1, draft.quantity),
        "text": draft.text.strip(),
        "image_file": image_file,
    }
    if current:
        for key, value in payload.items():
            setattr(current, key, value)
        item = current
    else:
        item = Card(id=new_id(), created_at=now_iso(), **payload)
        db.add(item)
    db.commit()
    return mutation(db, dump_card(item))


def create_deck(db: Session, draft: DeckDraft) -> dict:
    return _upsert_deck(db, None, draft)


def update_deck(db: Session, deck_id: str, draft: DeckDraft) -> dict:
    current = db.get(Deck, deck_id)
    if not current:
        raise HTTPException(status_code=404, detail="Deck não encontrado.")
    return _upsert_deck(db, current, draft)


def _upsert_deck(db: Session, current: Deck | None, draft: DeckDraft) -> dict:
    name = draft.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Dê um nome ao deck.")
    if not draft.entries:
        raise HTTPException(status_code=400, detail="Adicione pelo menos uma carta.")
    if current:
        current.name = name
        _replace_entries(db, current, draft.entries)
        item = current
    else:
        item = Deck(id=new_id(), name=name, created_at=now_iso())
        db.add(item)
        db.flush()
        _replace_entries(db, item, draft.entries)
    db.commit()
    db.refresh(item)
    return mutation(db, dump_deck(item))


def adjust_deck_card(db: Session, deck_id: str, card_id: str, delta: int) -> dict:
    deck = db.get(Deck, deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck não encontrado.")
    if not db.get(Card, card_id):
        raise HTTPException(status_code=404, detail="Carta não encontrada.")
    entry = db.get(DeckEntry, (deck_id, card_id))
    next_quantity = (entry.quantity if entry else 0) + delta
    if next_quantity <= 0:
        if entry:
            db.delete(entry)
    elif entry:
        entry.quantity = next_quantity
    else:
        db.add(DeckEntry(deck_id=deck_id, card_id=card_id, quantity=next_quantity))
    db.commit()
    return mutation(db)


def start_setup(db: Session, deck_id: str) -> dict:
    if not db.get(Deck, deck_id):
        raise HTTPException(status_code=404, detail="Deck não encontrado.")
    at = now_iso()
    existing = db.get(Game, GAME_ID)
    if existing:
        db.delete(existing)
        db.flush()
    db.add(Game(id=GAME_ID, deck_id=deck_id, phase="setup", started_at=at))
    _touch_deck(db, deck_id, at)
    db.commit()
    return mutation(db)


def add_to_hand(db: Session, card_id: str) -> dict:
    game = _require_game(db)
    if not db.get(Card, card_id):
        raise HTTPException(status_code=404, detail="Carta não encontrada.")
    max_pos = db.scalar(select(GameInstance.position).where(GameInstance.game_id == GAME_ID).order_by(GameInstance.position.desc()))
    instance_id = new_id()
    db.add(
        GameInstance(
            instance_id=instance_id,
            game_id=game.id,
            card_id=card_id,
            zone="hand",
            position=(max_pos or 0) + 1,
        )
    )
    db.commit()
    payload = mutation(db, instance_id)
    payload["instanceId"] = instance_id
    return payload


def remove_from_hand(db: Session, instance_id: str) -> dict:
    _require_game(db)
    instance = db.get(GameInstance, instance_id)
    if instance and instance.zone == "hand":
        db.delete(instance)
        db.commit()
    return mutation(db)


def begin_match(db: Session) -> dict:
    game = _require_game(db)
    at = now_iso()
    game.phase = "active"
    _touch_deck(db, game.deck_id, at)
    db.commit()
    return mutation(db)


def _move_from_hand(db: Session, instance_id: str, zone: str) -> dict:
    _require_game(db)
    instance = db.get(GameInstance, instance_id)
    if not instance or instance.zone != "hand":
        raise HTTPException(status_code=400, detail="Carta não está na mão.")
    max_pos = db.scalar(
        select(GameInstance.position).where(GameInstance.game_id == GAME_ID, GameInstance.zone == zone).order_by(GameInstance.position.desc())
    )
    instance.zone = zone
    instance.position = (max_pos or 0) + 1
    db.commit()
    return mutation(db)


def play_card(db: Session, instance_id: str) -> dict:
    return _move_from_hand(db, instance_id, "played")


def discard_card(db: Session, instance_id: str) -> dict:
    return _move_from_hand(db, instance_id, "graveyard")


def restart_match(db: Session) -> dict:
    game = _require_game(db)
    for instance in db.scalars(select(GameInstance).where(GameInstance.game_id == GAME_ID)).all():
        db.delete(instance)
    game.phase = "setup"
    db.commit()
    return mutation(db)


def end_match(db: Session) -> dict:
    game = db.get(Game, GAME_ID)
    if game:
        at = now_iso()
        _touch_deck(db, game.deck_id, at)
        db.delete(game)
        db.commit()
    return mutation(db)


def _purge_card_usage(db: Session, card_id: str) -> None:
    db.execute(delete(GameInstance).where(GameInstance.card_id == card_id))
    db.execute(delete(DeckEntry).where(DeckEntry.card_id == card_id))


def delete_card(db: Session, card_id: str) -> dict:
    card = db.get(Card, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Carta não encontrada.")
    _purge_card_usage(db, card.id)
    delete_image(card.image_file)
    db.delete(card)
    db.commit()
    return mutation(db)


def delete_collection(db: Session, collection_id: str) -> dict:
    collection = db.get(Collection, collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Coleção não encontrada.")
    cards = db.scalars(select(Card).where(Card.collection_id == collection_id)).all()
    for card in cards:
        _purge_card_usage(db, card.id)
        delete_image(card.image_file)
        db.delete(card)
    delete_image(collection.cover_file)
    db.delete(collection)
    db.commit()
    return mutation(db)


def delete_deck(db: Session, deck_id: str) -> dict:
    deck = db.get(Deck, deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck não encontrado.")
    game = db.get(Game, GAME_ID)
    if game and game.deck_id == deck_id:
        db.delete(game)
        db.flush()
    db.delete(deck)
    db.commit()
    return mutation(db)

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import store
from app.config import CORS_ORIGINS
from app.database import Base, engine, get_db, wait_for_database
from app.media import media_response
from app.schemas import CardDraft, CardIdIn, CollectionDraft, DeckAdjustIn, DeckDraft, InstanceIn, SetupIn


@asynccontextmanager
async def lifespan(_app: FastAPI):
    wait_for_database()
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Magic Deck Tracker", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/state")
def read_state(db: Session = Depends(get_db)):
    return store.get_state(db)


@app.post("/api/collections")
def create_collection(draft: CollectionDraft, db: Session = Depends(get_db)):
    return store.create_collection(db, draft)


@app.delete("/api/collections/{collection_id}")
def remove_collection(collection_id: str, db: Session = Depends(get_db)):
    return store.delete_collection(db, collection_id)


@app.post("/api/cards")
def create_card(draft: CardDraft, db: Session = Depends(get_db)):
    return store.create_card(db, draft)


@app.put("/api/cards/{card_id}")
def update_card(card_id: str, draft: CardDraft, db: Session = Depends(get_db)):
    return store.update_card(db, card_id, draft)


@app.delete("/api/cards/{card_id}")
def remove_card(card_id: str, db: Session = Depends(get_db)):
    return store.delete_card(db, card_id)


@app.post("/api/decks")
def create_deck(draft: DeckDraft, db: Session = Depends(get_db)):
    return store.create_deck(db, draft)


@app.put("/api/decks/{deck_id}")
def update_deck(deck_id: str, draft: DeckDraft, db: Session = Depends(get_db)):
    return store.update_deck(db, deck_id, draft)


@app.delete("/api/decks/{deck_id}")
def remove_deck(deck_id: str, db: Session = Depends(get_db)):
    return store.delete_deck(db, deck_id)


@app.post("/api/decks/{deck_id}/cards")
def adjust_deck(deck_id: str, body: DeckAdjustIn, db: Session = Depends(get_db)):
    return store.adjust_deck_card(db, deck_id, body.cardId, body.delta)


@app.post("/api/game/setup")
def start_setup(body: SetupIn, db: Session = Depends(get_db)):
    return store.start_setup(db, body.deckId)


@app.post("/api/game/hand")
def add_to_hand(body: CardIdIn, db: Session = Depends(get_db)):
    return store.add_to_hand(db, body.cardId)


@app.delete("/api/game/hand/{instance_id}")
def remove_from_hand(instance_id: str, db: Session = Depends(get_db)):
    return store.remove_from_hand(db, instance_id)


@app.post("/api/game/begin")
def begin_match(db: Session = Depends(get_db)):
    return store.begin_match(db)


@app.post("/api/game/play")
def play_card(body: InstanceIn, db: Session = Depends(get_db)):
    return store.play_card(db, body.instanceId)


@app.post("/api/game/discard")
def discard_card(body: InstanceIn, db: Session = Depends(get_db)):
    return store.discard_card(db, body.instanceId)


@app.post("/api/game/restart")
def restart_match(db: Session = Depends(get_db)):
    return store.restart_match(db)


@app.post("/api/game/end")
def end_match(db: Session = Depends(get_db)):
    return store.end_match(db)


@app.get("/api/media/{filename}")
def read_media(filename: str):
    return media_response(filename)

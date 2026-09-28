from typing import Literal

from pydantic import BaseModel, Field

ManaColor = Literal["W", "U", "B", "R", "G"]
CardCategory = Literal["creature", "spell", "land", "other"]
GamePhase = Literal["setup", "active"]


class CollectionDraft(BaseModel):
    name: str
    code: str = ""
    description: str = ""
    coverImage: str | None = None


class CardDraft(BaseModel):
    name: str
    collectionId: str
    number: str
    typeLine: str = ""
    category: CardCategory = "other"
    manaCost: str = ""
    colors: list[ManaColor] = Field(default_factory=list)
    quantity: int = 1
    text: str = ""
    image: str | None = None


class DeckEntryIn(BaseModel):
    cardId: str
    quantity: int


class DeckDraft(BaseModel):
    name: str
    entries: list[DeckEntryIn] = Field(default_factory=list)


class DeckAdjustIn(BaseModel):
    cardId: str
    delta: int


class SetupIn(BaseModel):
    deckId: str


class CardIdIn(BaseModel):
    cardId: str


class InstanceIn(BaseModel):
    instanceId: str

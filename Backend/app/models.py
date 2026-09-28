from sqlalchemy import ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Collection(Base):
    __tablename__ = "collections"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    code: Mapped[str] = mapped_column(String(16), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    cover_file: Mapped[str | None] = mapped_column(String(260), nullable=True)
    created_at: Mapped[str] = mapped_column(String(40))

    cards: Mapped[list["Card"]] = relationship(back_populates="collection")


class Card(Base):
    __tablename__ = "cards"
    __table_args__ = (UniqueConstraint("collection_id", "number", name="uq_card_number"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    collection_id: Mapped[str] = mapped_column(ForeignKey("collections.id"), index=True)
    number: Mapped[str] = mapped_column(String(16))
    type_line: Mapped[str] = mapped_column(String(200), default="")
    category: Mapped[str] = mapped_column(String(24), default="other")
    mana_cost: Mapped[str] = mapped_column(String(40), default="")
    colors: Mapped[str] = mapped_column(String(20), default="")
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    text: Mapped[str] = mapped_column(Text, default="")
    image_file: Mapped[str | None] = mapped_column(String(260), nullable=True)
    created_at: Mapped[str] = mapped_column(String(40))

    collection: Mapped[Collection] = relationship(back_populates="cards")


class Deck(Base):
    __tablename__ = "decks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    last_used_at: Mapped[str | None] = mapped_column(String(40), nullable=True)
    created_at: Mapped[str] = mapped_column(String(40))

    entries: Mapped[list["DeckEntry"]] = relationship(back_populates="deck", cascade="all, delete-orphan")


class DeckEntry(Base):
    __tablename__ = "deck_entries"

    deck_id: Mapped[str] = mapped_column(ForeignKey("decks.id"), primary_key=True)
    card_id: Mapped[str] = mapped_column(ForeignKey("cards.id"), primary_key=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    deck: Mapped[Deck] = relationship(back_populates="entries")


class Game(Base):
    __tablename__ = "games"

    id: Mapped[str] = mapped_column(String(16), primary_key=True, default="current")
    deck_id: Mapped[str] = mapped_column(ForeignKey("decks.id"))
    phase: Mapped[str] = mapped_column(String(16), default="setup")
    started_at: Mapped[str] = mapped_column(String(40))

    instances: Mapped[list["GameInstance"]] = relationship(
        back_populates="game",
        cascade="all, delete-orphan",
    )


class GameInstance(Base):
    __tablename__ = "game_instances"

    instance_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    game_id: Mapped[str] = mapped_column(ForeignKey("games.id"), default="current")
    card_id: Mapped[str] = mapped_column(ForeignKey("cards.id"))
    zone: Mapped[str] = mapped_column(String(16), default="hand")
    position: Mapped[int] = mapped_column(Integer, default=0)

    game: Mapped[Game] = relationship(back_populates="instances")

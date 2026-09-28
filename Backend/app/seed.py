from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Card, Collection, Deck, DeckEntry

CREATED = "2026-08-01T12:00:00.000Z"

COLLECTIONS = [
    {"id": "col-avatar", "name": "Avatar", "code": "TLA", "description": "Minha coleção de Avatar."},
    {"id": "col-terra", "name": "Terra Média", "code": "LTR", "description": "Cartas da jornada pela Terra Média."},
    {"id": "col-vingadores", "name": "Vingadores", "code": "AVN", "description": "Heróis reunidos para o combate."},
    {"id": "col-ff", "name": "Final Fantasy", "code": "FIN", "description": "Cristais, chocobos e limites."},
]

CARDS = [
    {"id": "card-aang", "name": "Aang, O Último Mestre do Ar", "collectionId": "col-avatar", "number": "1", "typeLine": "Criatura Lendária — Humano Avatar", "category": "creature", "manaCost": "2WU", "colors": "WU", "quantity": 4, "text": "Voar.\n\nQuando Aang entrar no campo de batalha, você pode colocar uma ficha de Aliado 1/1 branca no campo de batalha."},
    {"id": "card-sokka", "name": "Sokka, Estrategista", "collectionId": "col-avatar", "number": "14", "typeLine": "Criatura — Humano Guerreiro", "category": "creature", "manaCost": "1W", "colors": "W", "quantity": 4, "text": "Quando Sokka entrar no campo de batalha, compre uma carta se você controlar uma criatura azul ou vermelha."},
    {"id": "card-toph", "name": "Toph, Mestra da Terra", "collectionId": "col-avatar", "number": "27", "typeLine": "Criatura Lendária — Humano Guerreiro", "category": "creature", "manaCost": "2GG", "colors": "G", "quantity": 4, "text": "Alcance.\n\nToph não pode ser alvo de mágicas ou habilidades que seus oponentes controlam."},
    {"id": "card-aang-avatar", "name": "Aang, Estado Avatar", "collectionId": "col-avatar", "number": "52", "typeLine": "Criatura Lendária — Avatar", "category": "creature", "manaCost": "3WURG", "colors": "WURG", "quantity": 2, "text": "Voar, vigilância, ímpeto e alcance.\n\nNo início do combate, coloque um marcador +1/+1 em cada criatura que você controla."},
    {"id": "card-zuko", "name": "Zuko, Príncipe Exilado", "collectionId": "col-avatar", "number": "83", "typeLine": "Criatura Lendária — Humano Guerreiro", "category": "creature", "manaCost": "2RR", "colors": "R", "quantity": 4, "text": "Ímpeto.\n\nSempre que Zuko causar dano de combate a um jogador, exile o card do topo do grimório dele. Você pode conjurar aquele card neste turno."},
    {"id": "card-katara", "name": "Katara, Mestra da Água", "collectionId": "col-avatar", "number": "127", "typeLine": "Criatura Lendária — Humano Mago", "category": "creature", "manaCost": "2UU", "colors": "U", "quantity": 2, "text": "Quando Katara entrar no campo de batalha, vire até uma criatura alvo que um oponente controla.\n\nSempre que você conjurar sua segunda mágica em um turno, compre uma carta."},
    {"id": "card-appa", "name": "Appa, Bisão Voador", "collectionId": "col-avatar", "number": "148", "typeLine": "Criatura — Bisão Aliado", "category": "creature", "manaCost": "4WW", "colors": "W", "quantity": 2, "text": "Voar.\n\nSempre que Appa atacar, coloque uma ficha de Aliado 1/1 branca com voar no campo de batalha atacando."},
    {"id": "card-iroh", "name": "Iroh, Dragão do Oeste", "collectionId": "col-avatar", "number": "203", "typeLine": "Criatura Lendária — Humano Mago", "category": "creature", "manaCost": "3R", "colors": "R", "quantity": 2, "text": "Quando Iroh entrar no campo de batalha, cause 2 pontos de dano a qualquer alvo.\n\nNo início da sua etapa final, você ganha 2 pontos de vida."},
    {"id": "card-dobra-agua", "name": "Dobra de Água", "collectionId": "col-avatar", "number": "210", "typeLine": "Mágica Instantânea", "category": "spell", "manaCost": "U", "colors": "U", "quantity": 4, "text": "Retorne a carta alvo que não seja um terreno para a mão do dono. Compre uma carta."},
    {"id": "card-dobra-fogo", "name": "Dobra de Fogo", "collectionId": "col-avatar", "number": "211", "typeLine": "Mágica Instantânea", "category": "spell", "manaCost": "R", "colors": "R", "quantity": 4, "text": "Dobra de Fogo causa 3 pontos de dano a qualquer alvo."},
    {"id": "card-ilha", "name": "Ilha", "collectionId": "col-avatar", "number": "220", "typeLine": "Terreno Básico — Ilha", "category": "land", "manaCost": "", "colors": "U", "quantity": 4, "text": "({T}: adicione {U}.)"},
    {"id": "card-montanha", "name": "Montanha", "collectionId": "col-avatar", "number": "221", "typeLine": "Terreno Básico — Montanha", "category": "land", "manaCost": "", "colors": "R", "quantity": 3, "text": "({T}: adicione {R}.)"},
    {"id": "card-planicie", "name": "Planície", "collectionId": "col-avatar", "number": "222", "typeLine": "Terreno Básico — Planície", "category": "land", "manaCost": "", "colors": "W", "quantity": 3, "text": "({T}: adicione {W}.)"},
    {"id": "card-anel", "name": "O Um Anel", "collectionId": "col-terra", "number": "1", "typeLine": "Artefato Lendário", "category": "other", "manaCost": "4", "colors": "", "quantity": 1, "text": "No início do seu mantenimento, compre uma carta e perca 1 ponto de vida.\n\nVocê pode lançar mágicas como se elas tivessem ímpeto."},
    {"id": "card-gandalf", "name": "Gandalf, o Cinzento", "collectionId": "col-terra", "number": "14", "typeLine": "Criatura Lendária — Avatar Mago", "category": "creature", "manaCost": "3UU", "colors": "U", "quantity": 3, "text": "Sempre que você conjurar uma mágica instantânea ou um feitiço, compre uma carta."},
    {"id": "card-frodo", "name": "Frodo, Portador do Anel", "collectionId": "col-terra", "number": "27", "typeLine": "Criatura Lendária — Halfling", "category": "creature", "manaCost": "1B", "colors": "B", "quantity": 4, "text": "Frodo não pode ser bloqueado.\n\nSempre que Frodo causar dano de combate a um jogador, cada oponente perde 1 ponto de vida e você ganha 1 ponto de vida."},
    {"id": "card-sam", "name": "Sam, Jardineiro Fiel", "collectionId": "col-terra", "number": "52", "typeLine": "Criatura — Halfling", "category": "creature", "manaCost": "1G", "colors": "G", "quantity": 4, "text": "Quando Sam entrar no campo de batalha, coloque um marcador +1/+1 em outra criatura alvo que você controla."},
    {"id": "card-aragorn", "name": "Aragorn, Herdeiro de Isildur", "collectionId": "col-terra", "number": "83", "typeLine": "Criatura Lendária — Humano Guerreiro", "category": "creature", "manaCost": "2BG", "colors": "BG", "quantity": 3, "text": "Vigilância.\n\nOutras criaturas que você controla recebem +1/+1 e têm vigilância."},
    {"id": "card-legolas", "name": "Legolas, Príncipe da Floresta", "collectionId": "col-terra", "number": "127", "typeLine": "Criatura Lendária — Elfo Arqueiro", "category": "creature", "manaCost": "2G", "colors": "G", "quantity": 3, "text": "Alcance.\n\nSempre que Legolas atacar, cause 1 ponto de dano a cada criatura que esteja bloqueando."},
    {"id": "card-lothlorien", "name": "Floresta de Lothlórien", "collectionId": "col-terra", "number": "148", "typeLine": "Terreno Lendário", "category": "land", "manaCost": "", "colors": "G", "quantity": 8, "text": "{T}: adicione {G}.\n\n{T}, pague 1 ponto de vida: adicione {G}{G}. Ative somente se você controla um elfo."},
    {"id": "card-mordor", "name": "Montanha Sombria", "collectionId": "col-terra", "number": "203", "typeLine": "Terreno", "category": "land", "manaCost": "", "colors": "B", "quantity": 6, "text": "{T}: adicione {B}.\n\nMontanha Sombria entra no campo de batalha virada."},
    {"id": "card-sussurro", "name": "Sussurro do Anel", "collectionId": "col-terra", "number": "210", "typeLine": "Mágica Instantânea", "category": "spell", "manaCost": "B", "colors": "B", "quantity": 2, "text": "Destrua a criatura alvo que foi bloqueada neste turno. Compre uma carta."},
    {"id": "card-floresta", "name": "Floresta", "collectionId": "col-terra", "number": "220", "typeLine": "Terreno Básico — Floresta", "category": "land", "manaCost": "", "colors": "G", "quantity": 4, "text": "({T}: adicione {G}.)"},
    {"id": "card-capitao", "name": "Capitão América", "collectionId": "col-vingadores", "number": "14", "typeLine": "Criatura Lendária — Humano Soldado", "category": "creature", "manaCost": "2WW", "colors": "W", "quantity": 4, "text": "Vigilância.\n\nSempre que o Capitão América atacar, outra criatura alvo que você controla ganha indestrutível até o final do turno."},
    {"id": "card-aranha", "name": "Homem-Aranha", "collectionId": "col-vingadores", "number": "27", "typeLine": "Criatura — Humano Herói", "category": "creature", "manaCost": "1RW", "colors": "RW", "quantity": 4, "text": "Toque-rápido.\n\nHomem-Aranha pode bloquear uma criatura adicional a cada combate."},
    {"id": "card-ferro", "name": "Homem de Ferro", "collectionId": "col-vingadores", "number": "52", "typeLine": "Criatura Artefato Lendária — Humano", "category": "creature", "manaCost": "3RW", "colors": "RW", "quantity": 3, "text": "Voar.\n\n{T}: Homem de Ferro causa 2 pontos de dano a qualquer alvo."},
    {"id": "card-thor", "name": "Thor, Deus do Trovão", "collectionId": "col-vingadores", "number": "83", "typeLine": "Criatura Lendária — Deus Guerreiro", "category": "creature", "manaCost": "3RR", "colors": "R", "quantity": 3, "text": "Ímpeto.\n\nQuando Thor entrar no campo de batalha, ele causa 3 pontos de dano divididos como você desejar entre até dois alvos."},
    {"id": "card-viuva", "name": "Viúva Negra", "collectionId": "col-vingadores", "number": "127", "typeLine": "Criatura — Humano Assassino", "category": "creature", "manaCost": "1UB", "colors": "UB", "quantity": 2, "text": "Amedrontar.\n\nQuando Viúva Negra entrar no campo de batalha, olhe a mão do oponente alvo. Você pode escolher uma carta que não seja terreno de lá. Aquele jogador descarta aquela carta."},
    {"id": "card-hulk", "name": "Hulk", "collectionId": "col-vingadores", "number": "148", "typeLine": "Criatura — Humano Berserker", "category": "creature", "manaCost": "4GG", "colors": "G", "quantity": 3, "text": "Atropelar.\n\nHulk entra no campo de batalha com quatro marcadores +1/+1."},
    {"id": "card-escudo", "name": "Escudo do Capitão", "collectionId": "col-vingadores", "number": "203", "typeLine": "Artefato — Equipamento", "category": "spell", "manaCost": "2W", "colors": "W", "quantity": 4, "text": "A criatura equipada recebe +2/+2 e tem vigilância.\n\nEquipar {2}."},
    {"id": "card-repulsor", "name": "Raio Repulsor", "collectionId": "col-vingadores", "number": "210", "typeLine": "Mágica Instantânea", "category": "spell", "manaCost": "1R", "colors": "R", "quantity": 4, "text": "Raio Repulsor causa 2 pontos de dano a qualquer alvo. Se você controla um artefato, cause 4 pontos de dano em vez disso."},
    {"id": "card-planicie-avn", "name": "Planície", "collectionId": "col-vingadores", "number": "220", "typeLine": "Terreno Básico — Planície", "category": "land", "manaCost": "", "colors": "W", "quantity": 2, "text": "({T}: adicione {W}.)"},
    {"id": "card-montanha-avn", "name": "Montanha", "collectionId": "col-vingadores", "number": "222", "typeLine": "Terreno Básico — Montanha", "category": "land", "manaCost": "", "colors": "R", "quantity": 2, "text": "({T}: adicione {R}.)"},
    {"id": "card-cristal", "name": "Cristal de Fogo", "collectionId": "col-ff", "number": "1", "typeLine": "Artefato", "category": "other", "manaCost": "2R", "colors": "R", "quantity": 2, "text": "{T}: adicione {R}.\n\n{T}, sacrifique Cristal de Fogo: cause 2 pontos de dano a qualquer alvo."},
    {"id": "card-tifa", "name": "Tifa, Lutadora", "collectionId": "col-ff", "number": "14", "typeLine": "Criatura — Humano Guerreiro", "category": "creature", "manaCost": "1RG", "colors": "RG", "quantity": 3, "text": "Atropelar.\n\nSempre que Tifa atacar sozinha, ela recebe +2/+2 até o final do turno."},
    {"id": "card-cloud", "name": "Cloud, Mercenário", "collectionId": "col-ff", "number": "27", "typeLine": "Criatura Lendária — Humano Soldado", "category": "creature", "manaCost": "2RW", "colors": "RW", "quantity": 4, "text": "Investida dupla.\n\nQuando Cloud atacar, equipe-o com um equipamento alvo que você controla."},
    {"id": "card-sephiroth", "name": "Sephiroth, Anjo", "collectionId": "col-ff", "number": "52", "typeLine": "Criatura Lendária — Avatar Pesadelo", "category": "creature", "manaCost": "3BB", "colors": "B", "quantity": 2, "text": "Voar.\n\nSempre que uma criatura morrer, cada oponente perde 1 ponto de vida e você ganha 1 ponto de vida."},
    {"id": "card-aerith", "name": "Aerith, Florista", "collectionId": "col-ff", "number": "83", "typeLine": "Criatura Lendária — Humano Clérigo", "category": "creature", "manaCost": "1GW", "colors": "GW", "quantity": 3, "text": "Quando Aerith entrar no campo de batalha, você ganha 3 pontos de vida e pode procurar um terreno básico no seu grimório."},
    {"id": "card-limite", "name": "Limite Supremo", "collectionId": "col-ff", "number": "127", "typeLine": "Mágica Feitiço", "category": "spell", "manaCost": "3RR", "colors": "R", "quantity": 4, "text": "Limite Supremo causa 5 pontos de dano a qualquer alvo. Se uma criatura que você controla tiver um equipamento, cause 7 pontos de dano em vez disso."},
    {"id": "card-chocobo", "name": "Chocobo", "collectionId": "col-ff", "number": "148", "typeLine": "Criatura — Ave", "category": "creature", "manaCost": "G", "colors": "G", "quantity": 4, "text": "Atropelar.\n\nChocobo não pode ser bloqueado por criaturas com poder 2 ou menor."},
    {"id": "card-midgar", "name": "Midgar, Cidade Reactor", "collectionId": "col-ff", "number": "203", "typeLine": "Terreno", "category": "land", "manaCost": "", "colors": "B", "quantity": 5, "text": "{T}: adicione {B} ou {R}.\n\nMidgar causa 1 ponto de dano a você."},
]

DECKS = [
    {
        "id": "deck-avatar",
        "name": "Avatar — Domínio dos Elementos",
        "hoursAgo": 2,
        "entries": [
            ("card-aang", 4),
            ("card-sokka", 4),
            ("card-zuko", 4),
            ("card-katara", 4),
            ("card-appa", 4),
            ("card-iroh", 4),
            ("card-dobra-agua", 6),
            ("card-dobra-fogo", 6),
            ("card-ilha", 8),
            ("card-montanha", 8),
            ("card-planicie", 8),
        ],
    },
    {
        "id": "deck-vingadores",
        "name": "Vingadores Unidos",
        "hoursAgo": 26,
        "entries": [
            ("card-capitao", 6),
            ("card-aranha", 6),
            ("card-ferro", 6),
            ("card-thor", 6),
            ("card-escudo", 4),
            ("card-repulsor", 8),
            ("card-planicie-avn", 12),
            ("card-montanha-avn", 12),
        ],
    },
    {
        "id": "deck-terra",
        "name": "Terra Média",
        "hoursAgo": 96,
        "entries": [
            ("card-frodo", 6),
            ("card-sam", 6),
            ("card-aragorn", 6),
            ("card-legolas", 6),
            ("card-sussurro", 12),
            ("card-lothlorien", 8),
            ("card-mordor", 8),
            ("card-floresta", 8),
        ],
    },
]


def seed_if_empty(db: Session) -> None:
    if db.scalar(select(Collection.id).limit(1)):
        return
    now = datetime.now(timezone.utc)
    for item in COLLECTIONS:
        db.add(
            Collection(
                id=item["id"],
                name=item["name"],
                code=item["code"],
                description=item["description"],
                created_at=CREATED,
            )
        )
    for item in CARDS:
        db.add(
            Card(
                id=item["id"],
                name=item["name"],
                collection_id=item["collectionId"],
                number=item["number"],
                type_line=item["typeLine"],
                category=item["category"],
                mana_cost=item["manaCost"],
                colors=item["colors"],
                quantity=item["quantity"],
                text=item["text"],
                created_at=CREATED,
            )
        )
    for item in DECKS:
        last_used = (now - timedelta(hours=item["hoursAgo"])).isoformat().replace("+00:00", "Z")
        db.add(
            Deck(
                id=item["id"],
                name=item["name"],
                created_at=CREATED,
                last_used_at=last_used,
            )
        )
        for card_id, quantity in item["entries"]:
            db.add(DeckEntry(deck_id=item["id"], card_id=card_id, quantity=quantity))
    db.commit()

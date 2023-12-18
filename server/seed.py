#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app, db
from models import User, Deck, Creature, Weakness, Strength, DeckCreature

fake = Faker()

def seed_users():
    for _ in range(5):  # Seed 5 users
        user = User(
            name=fake.name(),
            login=fake.user_name(),
            password=fake.password(),
        )
        db.session.add(user)
    db.session.commit()

def seed_decks():
    users = User.query.all()
    for user in users:
        for _ in range(randint(1, 3)):  # Each user has 1 to 3 decks
            deck = Deck(
                name=fake.word(),
                user=user,
            )
            db.session.add(deck)
    db.session.commit()

def seed_weaknesses():
    for _ in range(3):  # Seed 3 weaknesses
        weakness = Weakness(
            against=fake.word(),
            modificator=randint(1, 5),
        )
        db.session.add(weakness)
    db.session.commit()

def seed_strengths():
    for _ in range(3):  # Seed 3 strengths
        strength = Strength(
            against=fake.word(),
            modificator=randint(1, 5),
        )
        db.session.add(strength)
    db.session.commit()

def seed_creatures():
    decks = Deck.query.all()
    weaknesses = Weakness.query.all()
    strengths = Strength.query.all()

    for deck in decks:
        creature_count = Creature.query.join(DeckCreature).filter(DeckCreature.deck_id == deck.id).count()
        creatures_to_add = max(0, 10 - creature_count)

        for _ in range(creatures_to_add):
            creature = Creature(
                name=fake.word(),
                cost=randint(1, 10),
                attack=randint(1, 10),
                health=randint(1, 10),
                class_=fake.word(),
                weakness=rc(weaknesses),
                strength=rc(strengths),
            )

            db.session.add(creature)
            db.session.commit()  # Commit the creature to generate the ID

            # Manually create a DeckCreature entry for the association
            deck_creature = DeckCreature(deck_id=deck.id, creature_id=creature.id)
            deck_creature.deck = deck  # Set the deck attribute
            deck_creature.creature = creature  # Set the creature attribute
            db.session.add(deck_creature)

    db.session.commit()




if __name__ == '__main__':
    with app.app_context():
        print("Starting seed...")
        seed_users()
        seed_decks()
        seed_weaknesses()
        seed_strengths()
        seed_creatures()
        print("Seed complete!")

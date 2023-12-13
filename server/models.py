from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy

from config import db

# Models go here!
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from config import db

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    login = db.Column(db.String(255), unique=True)
    password = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    decks = db.relationship('Deck', backref='user')

class Deck(db.Model, SerializerMixin):
    __tablename__ = 'decks'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    creatures = db.relationship('Creature', secondary='decks_creatures', backref='decks')

class Creature(db.Model, SerializerMixin):
    __tablename__ = 'creatures'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    cost = db.Column(db.Integer)
    attack = db.Column(db.Integer)
    health = db.Column(db.Integer)
    class_ = db.Column(db.String(255))
    weakness_id = db.Column(db.Integer, db.ForeignKey('weaknesses.id'))
    strength_id = db.Column(db.Integer, db.ForeignKey('strengths.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    deck_creatures = db.relationship('DeckCreature', backref='creature')
    weakness = db.relationship('Weakness', foreign_keys=[weakness_id])
    strength = db.relationship('Strength', foreign_keys=[strength_id])



class Weakness(db.Model, SerializerMixin):
    __tablename__ = 'weaknesses'
    id = db.Column(db.Integer, primary_key=True)
    against = db.Column(db.String(255))
    modificator = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Strength(db.Model, SerializerMixin):
    __tablename__ = 'strengths'
    id = db.Column(db.Integer, primary_key=True)
    against = db.Column(db.String(255))
    modificator = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DeckCreature(db.Model, SerializerMixin):
    __tablename__ = 'decks_creatures'
    deck_id = db.Column(db.Integer, db.ForeignKey('decks.id'), primary_key=True)
    creature_id = db.Column(db.Integer, db.ForeignKey('creatures.id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

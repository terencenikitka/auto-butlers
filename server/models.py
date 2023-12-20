from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy

from config import db, bcrypt

# Models go here!
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from config import db

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String)
    email = db.Column(db.String(255), unique=True)
    _password_hash = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    decks = db.relationship('Deck', backref='user')
    @property
    def password_hash(self):
        return self._password_hash

    @password_hash.setter
    def password_hash(self, plain_text_password):
        byte_object = plain_text_password.encode('utf-8')
        encrypted_password_object = bcrypt.generate_password_hash(byte_object)
        hashed_password_string = encrypted_password_object.decode('utf-8')
        self._password_hash = hashed_password_string

    def authenticate(self, password_string):
        byte_object = password_string.encode('utf-8')
        return bcrypt.check_password_hash(self.password_hash, byte_object)

        
class Deck(db.Model, SerializerMixin):
    __tablename__ = 'decks'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    creatures = db.relationship('Creature', secondary='decks_creatures', backref='decks', overlaps="creatures,decks")

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

    deck_creatures = db.relationship('DeckCreature', backref='creature', overlaps="decks,creature")
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
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    deck_id = db.Column(db.Integer, db.ForeignKey('decks.id'), nullable=False )
    creature_id = db.Column(db.Integer, db.ForeignKey('creatures.id'), nullable=False)
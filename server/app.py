from flask import request, make_response
from flask_restful import Resource
from datetime import datetime
from config import app, db, api
from models import User, Deck, Creature, Weakness, Strength, DeckCreature

class Users(Resource):
    def get(self):
        all_users = User.query.all()
        user_data = [user.to_dict(rules=('-decks',)) for user in all_users]
        return make_response(user_data, 200)

class Creatures(Resource):
    def get(self):
        all_creatures = Creature.query.all()
        creatures_data = [creature.to_dict(rules=('-deck_creatures','-decks')) for creature in all_creatures]
        return make_response(creatures_data, 200)

class DeckCreatures(Resource):
    def get(self):
        all_deck_creatures = DeckCreature.query.all()
        deck_creatures_data = [deck_creature.to_dict(rules=('-creature',)) for deck_creature in all_deck_creatures]
        return make_response(deck_creatures_data, 200)

class Decks(Resource):
    def get(self):
        all_decks = Deck.query.all()
        decks_data = [deck.to_dict(rules=('-creatures','-user',)) for deck in all_decks]
        return make_response(decks_data, 200)

api.add_resource(Users, '/users')
api.add_resource(Creatures, '/creatures')
api.add_resource(DeckCreatures, '/deckcreatures')
api.add_resource(Decks, '/decks')

@app.route('/')
def index():
    return '<h1>Project Server</h1>'

if __name__ == '__main__':
    app.run(port=5555, debug=True)

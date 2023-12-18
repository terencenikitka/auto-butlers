from flask import request, make_response
from flask_restful import Resource
from datetime import datetime
from config import app, db, api
from models import User, Deck, Creature, Weakness, Strength, DeckCreature

class Users(Resource):
    def get(self, user_id=None):
        if user_id:
            user = User.query.get(user_id)
            if not user:
                return make_response({'error': 'User not found'}, 404)
            return make_response(user.to_dict(rules=('-decks',)), 200)
        
        all_users = User.query.all()
        user_data = [user.to_dict(rules=('-decks',)) for user in all_users]
        return make_response(user_data, 200)

class Creatures(Resource):
    def get(self, creature_id=None):
        if creature_id:
            creature = Creature.query.get(creature_id)
            if not creature:
                return make_response({'error': 'Creature not found'}, 404)
            return make_response(creature.to_dict(rules=('-deck_creatures', '-decks')), 200)

        all_creatures = Creature.query.all()
        creatures_data = [creature.to_dict(rules=('-deck_creatures','-decks')) for creature in all_creatures]
        return make_response(creatures_data, 200)

 

class DeckCreatures(Resource):
    def get(self, deck_creature_id=None):
        if deck_creature_id:
            deck_creature = DeckCreature.query.get(deck_creature_id)
            if not deck_creature:
                return make_response({'error': 'DeckCreature not found'}, 404)
            return make_response(deck_creature.to_dict(rules=('-creature',)), 200)

        all_deck_creatures = DeckCreature.query.all()
        deck_creatures_data = [deck_creature.to_dict(rules=('-creature',)) for deck_creature in all_deck_creatures]
        return make_response(deck_creatures_data, 200)

    def delete(self):
        try:
            data = request.get_json()

            if "deck_id" not in data or "creature_id" not in data:
                return make_response({'error': 'Missing required fields'}, 400)

            deck_id = data["deck_id"]
            creature_id = data["creature_id"]

            deck = Deck.query.get(deck_id)
            creature = Creature.query.get(creature_id)

            if not deck or not creature:
                return make_response({'error': 'Deck or Creature not found'}, 404)

            deck_creature = DeckCreature.query.filter_by(deck_id=deck_id, creature_id=creature_id).first()

            if not deck_creature:
                return make_response({'error': 'DeckCreature not found'}, 404)

            db.session.delete(deck_creature)
            db.session.commit()

            return make_response({'message': 'DeckCreature deleted successfully'}, 200)
        except Exception as e:
            print(e)
            return make_response({'error': 'Internal Server Error'}, 500)

    def post(self):
            try:
                data = request.get_json()

                if "deck_id" not in data or "creature_id" not in data:
                    return make_response({'error': 'Missing required fields'}, 400)

                deck_id = data["deck_id"]
                creature_id = data["creature_id"]

                deck = Deck.query.get(deck_id).id
                creature = Creature.query.get(creature_id).id

                if not deck or not creature:
                    return make_response({'error': 'Deck or Creature not found'}, 404)

                new_deck_creature = DeckCreature(deck_id=deck, creature_id=creature)
                db.session.add(new_deck_creature)
                db.session.commit()

                return make_response(new_deck_creature.to_dict(rules=('-creature',)), 201)
            except Exception as e:
                print(e)
                return make_response({'error': 'Internal Server Error'}, 500)   

class Decks(Resource):
    def get(self, deck_id=None):
        if deck_id:
            deck = Deck.query.get(deck_id)
            if not deck:
                return make_response({'error': 'Deck not found'}, 404)
            return make_response(deck.to_dict(rules=('-creatures', '-user')), 200)

        all_decks = Deck.query.all()
        decks_data = [deck.to_dict(rules=('-creatures','-user',)) for deck in all_decks]
        return make_response(decks_data, 200)

    def patch(self, deck_id):
        try:
            data = request.get_json()

            if not data:
                return make_response({'error': 'Missing data for update'}, 400)

         
            deck = Deck.query.get(deck_id)

            if not deck:
                return make_response({'error': 'Deck not found'}, 404)

          
            if 'name' in data:
                deck.name = data['name']

           

           
            db.session.commit()

            return make_response(deck.to_dict(rules=('-creatures', '-user')), 200)
        except Exception as e:
            print(e)
            return make_response({'error': 'Internal Server Error'}, 500)

    def delete(self, deck_id):
        try:
       
            deck = Deck.query.get(deck_id)

            if not deck:
                return make_response({'error': 'Deck not found'}, 404)

     
            db.session.delete(deck)
            db.session.commit()

            return make_response({'message': 'Deck deleted successfully'}, 200)
        except Exception as e:
            print(e)
            return make_response({'error': 'Internal Server Error'}, 500)        

    def post(self):
        try:
            data = request.get_json()

            if "name" not in data:
                return make_response({'error': 'Missing required fields'}, 400)

            deck_name = data["name"]
            user_id = data["user_id"]

            user = User.query.get(user_id)
            if not user:
                return make_response({'error': 'User not found'}, 404)

            new_deck = Deck(name=deck_name, user=user)
            db.session.add(new_deck)
            db.session.commit()

            return make_response(new_deck.to_dict(rules=('-creatures', '-user')), 201)
        except Exception as e:
            print(e)
            return make_response({'error': 'Internal Server Error'}, 500)


api.add_resource(Users, '/users', '/users/<int:user_id>')
api.add_resource(Creatures, '/creatures', '/creatures/<int:creature_id>')
api.add_resource(DeckCreatures, '/deckcreatures', '/deckcreatures/<int:deck_creature_id>')
api.add_resource(Decks, '/decks', '/decks/<int:deck_id>')

@app.route('/')
def index():
    return '<h1>Project Server</h1>'

if __name__ == '__main__':
    app.run(port=5555, debug=True)

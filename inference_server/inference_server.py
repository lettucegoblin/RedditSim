from flask import Flask, jsonify
from inferencing_model import InferencingModel
from flask import request
import time
import random

app = Flask(__name__)
model = InferencingModel()

reserved_spot_id = -1 # -1 means no spot is reserved
reserved_spot_timestamp = -1

def is_reserved_spot_still_valid():
    global reserved_spot_timestamp
    return reserved_spot_timestamp + 2 * 60 > time.time()

@app.route('/reserve_spot', methods=['GET']) # curl http://localhost:5000/reserve_spot
def attempt_reserve_spot():
    global reserved_spot_id, reserved_spot_timestamp
    if model.is_generating():
        return jsonify({'error': 'model is currently generating'})
    if reserved_spot_id != -1 and is_reserved_spot_still_valid():
        return jsonify({'error': 'spot already reserved'})
    reserved_spot_id = random.randint(0, 1000000)
    reserved_spot_timestamp = time.time()
    return jsonify({'spot_id': reserved_spot_id})

optional_post_keys = ['subreddit', 'author', 'media', 'title']
@app.route('/generate_post', methods=['POST']) # curl -X POST -H "Content-Type: application/json" -d '{"genPostObj": {"subreddit": "/r/AskReddit", "author": "pikachu_daddy", "media": "text", "title": "1962 Volkswagen Beetle"}}' http://localhost:5000/generate_post
def generate_post():
    global reserved_spot_id
    if model.is_generating():
        return jsonify({'error': 'model is currently generating'})
    spot_id = request.json.get('spot_id')
    if spot_id != reserved_spot_id or spot_id == -1:
        return jsonify({'error': 'spot_id is not reserved'})
    postObj = request.json.get('postObj') 
    # if postObj is not a dictionary make it an empty dictionary
    if not isinstance(postObj, dict):
        postObj = {}
    # sanitize postObj
    options = {key: postObj[key] for key in postObj if key in optional_post_keys}
    if not model.is_loaded():
        model.load_model()
    new_post = model.generate_post(**options)
    reserved_spot_id = -1
    return jsonify({'postObj': new_post})

required_comment_keys = ['user', 'text']
@app.route('/generate_comments', methods=['POST']) # curl -X POST -H "Content-Type: application/json" -d '{"postObj":{"author":"pikachu_daddy","media":"text","postPrompt":"You are a Reddit post generator.\nUser: \nSubreddit: /r/AskReddit \nAuthor: pikachu_daddy \nMedia: text \nTitle: 1962 Volkswagen Beetle \nWrite the Reddit post.\nAssistant:","subreddit":"/r/AskReddit","text":" \nMy dad bought this car in 1970 for $500 and he still has it today at age 84. He\u2019s had to replace some parts (like the engine) but everything else is original including the paint job! I think my mom wants him to sell it once he can no longer drive, but I hope not because it would be like selling family history.\nEdit: Thank you all so much for your kind words! My parents have been married for over 54 years now and they met back when he was working on his first VW Bug. They both love cars and my dad even worked as an auto mechanic before going into teaching. It\u2019s really amazing that he\u2019s kept this one for so long!","title":"1962 Volkswagen Beetle"}}' http://localhost:5000/generate_comments
def generate_comments():
    global reserved_spot_id
    if model.is_generating():
        return jsonify({'error': 'model is currently generating'})
    postObj = request.json.get('postObj')
    commentPath = request.json.get('commentPath')
    next_user = request.json.get('nextUser')
    if not all(key in postObj for key in optional_post_keys): # check if postObj has all required keys
        return jsonify({'error': 'postObj does not have the correct format'})

    # sanitize commentPath
    commentPath = commentPath if commentPath else []
    # check each comment in commentPath has the correct format
    for comment in commentPath:
        if not all(key in comment for key in required_comment_keys):
            return jsonify({'error': 'commentPath does not have the correct format'})
        # sanitize comment, check if each key is a string and not empty
        for key in required_comment_keys:
            if not isinstance(comment[key], str) or not comment[key] or len(comment[key].strip()) == 0:
                return jsonify({'error': 'commentPath does not have the correct format'})

    # sanitize next_user, enforce that it is a string and not empty
    next_user = next_user if next_user else ''
    if not isinstance(next_user, str) or not next_user or len(next_user.strip()) == 0:
        return jsonify({'error': 'nextUser does not have the correct format'})
    if not model.is_loaded():
        model.load_model()
    comments = model.generate_comments(postObj, commentPath, next_user, 5)
    reserved_spot_id = -1
    return jsonify({'commentPath': comments})

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=43852)

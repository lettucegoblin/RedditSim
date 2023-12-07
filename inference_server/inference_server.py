from flask import Flask, jsonify
from inferencing_model import InferencingModel
from flask import request
import time
import random

TESTING = True
app = Flask(__name__)
model = InferencingModel()

reserved_spot_id = -1 # -1 means no spot is reserved
reserved_spot_timestamp = -1

def calculate_dimensions(aspect_ratio, max_width, max_height):
    # Aspect ratio is defined as width/height
    # So, we start by setting width to max_width and calculate height
    width = max_width
    height = width / aspect_ratio

    # If calculated height is greater than max_height, we need to adjust
    if height > max_height:
        # Set height to max_height and calculate width accordingly
        height = max_height
        width = height * aspect_ratio

    # Return width and height as integers
    return int(width), int(height)

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
    global reserved_spot_id, TESTING
    if model.is_generating():
        return jsonify({'error': 'model is currently generating'})
    spot_id = request.json.get('spot_id')
    if not TESTING and (spot_id != reserved_spot_id or spot_id == -1):
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
    # if new post is image or video, generate image 
    if new_post['media'] == 'image' or new_post['media'] == 'video':
        aspect_ratios = [
            1/1, # square
            4/3, 3/2, 16/9, # horizontal
            3/4, 2/3, 9/16 # vertical
        ]
        aspect_ratio = random.choice(aspect_ratios)
        width, height = calculate_dimensions(aspect_ratio, 512, 512)
        print (width, height)
        new_post['image'] = model.generate_image(new_post, width, height)
    reserved_spot_id = -1
    return jsonify({'postObj': new_post})

# route for generating an image from a post
@app.route('/generate_image', methods=['POST']) # curl -X POST -H "Content-Type: application/json" -d '{"postObj": {"subreddit": "/r/AskReddit", "author": "pikachu_daddy", "media": "text", "title": "1962 Volkswagen Beetle"}}' http://localhost:5000/generate_image
def generate_image():
    global TESTING
    if not TESTING:
        return jsonify({'error': 'not allowed to generate image'})
    postObj = request.json.get('postObj')
    aspect_ratios = [
        1/1, # square
        4/3, 3/2, 16/9, # horizontal
        3/4, 2/3, 9/16 # vertical
    ]
    aspect_ratio = random.choice(aspect_ratios)
    width, height = calculate_dimensions(aspect_ratio, 512, 512)
    print (width, height)
    image = model.generate_image(postObj, width, height)
    return jsonify({'image': image})

required_comment_keys = ['user', 'text']
@app.route('/generate_comments', methods=['POST']) # curl -X POST -H "Content-Type: application/json" -d '{"postObj":{"author":"pikachu_daddy","media":"text","postPrompt":"You are a Reddit post generator.\nUser: \nSubreddit: /r/AskReddit \nAuthor: pikachu_daddy \nMedia: text \nTitle: 1962 Volkswagen Beetle \nWrite the Reddit post.\nAssistant:","subreddit":"/r/AskReddit","text":" \nMy dad bought this car in 1970 for $500 and he still has it today at age 84. He\u2019s had to replace some parts (like the engine) but everything else is original including the paint job! I think my mom wants him to sell it once he can no longer drive, but I hope not because it would be like selling family history.\nEdit: Thank you all so much for your kind words! My parents have been married for over 54 years now and they met back when he was working on his first VW Bug. They both love cars and my dad even worked as an auto mechanic before going into teaching. It\u2019s really amazing that he\u2019s kept this one for so long!","title":"1962 Volkswagen Beetle"}}' http://localhost:5000/generate_comments
def generate_comments():
    global reserved_spot_id
    if model.is_generating():
        return jsonify({'error': 'model is currently generating'})
    postObj = request.json.get('postObj') # required postObj
    commentPath = request.json.get('commentPath') # optional commentPath, default is empty list
    numberOfComments = request.json.get('numberOfComments') # optional numberOfComments, default is 5
    next_user = request.json.get('nextUser') # optional next_user, default is empty string
    if not all(key in postObj for key in optional_post_keys): # check if postObj has all required keys
        return jsonify({'error': 'postObj does not have the correct format'})

    if not isinstance(numberOfComments, int):
        return jsonify({'error': 'numberOfComments does not have the correct format'})

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
    if not model.is_loaded():
        model.load_model()
    comments = model.generate_comments(postObj, commentPath, next_user, numberOfComments)
    reserved_spot_id = -1
    return jsonify({'commentPath': comments})

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=43852)

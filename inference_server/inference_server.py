from flask import Flask, jsonify
from inferencing_model import InferencingModel
from flask import request

app = Flask(__name__)
model = InferencingModel()

optional_post_keys = ['subreddit', 'author', 'media', 'title']
@app.route('/generate_post', methods=['POST']) # curl -X POST -H "Content-Type: application/json" -d '{"genPostObj": {"subreddit": "/r/AskReddit", "author": "pikachu_daddy", "media": "text", "title": "1962 Volkswagen Beetle"}}' http://localhost:5000/generate_post
def generate_post():
    genPostObj = request.json.get('genPostObj')
    # sanitize genPostObj
    options = {key: genPostObj[key] for key in genPostObj if key in optional_post_keys}
    if not model.is_loaded():
        model.load_model()
    new_post = model.generate_post(**options)
    return jsonify({'postObj': new_post})

required_comment_keys = ['user', 'text']
@app.route('/generate_comments', methods=['POST']) # curl -X POST -H "Content-Type: application/json" -d '{"postObj":{"author":"pikachu_daddy","media":"text","postPrompt":"You are a Reddit post generator.\nUser: \nSubreddit: /r/AskReddit \nAuthor: pikachu_daddy \nMedia: text \nTitle: 1962 Volkswagen Beetle \nWrite the Reddit post.\nAssistant:","subreddit":"/r/AskReddit","text":" \nMy dad bought this car in 1970 for $500 and he still has it today at age 84. He\u2019s had to replace some parts (like the engine) but everything else is original including the paint job! I think my mom wants him to sell it once he can no longer drive, but I hope not because it would be like selling family history.\nEdit: Thank you all so much for your kind words! My parents have been married for over 54 years now and they met back when he was working on his first VW Bug. They both love cars and my dad even worked as an auto mechanic before going into teaching. It\u2019s really amazing that he\u2019s kept this one for so long!","title":"1962 Volkswagen Beetle"}}' http://localhost:5000/generate_comments
def generate_comments():
    postObj = request.json.get('postObj')
    commentPath = request.json.get('commentPath')
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

    if not model.is_loaded():
        model.load_model()
    comments = model.generate_comments(postObj, commentPath, 5)
    return jsonify({'commentPath': comments})

if __name__ == '__main__':
    app.run()

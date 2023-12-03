
from string import Template
import string
import random

from exllamav2 import (
    ExLlamaV2,
    ExLlamaV2Config,
    ExLlamaV2Cache,
    ExLlamaV2Tokenizer,
    ExLlamaV2Lora,
)

from exllamav2.generator import (
    ExLlamaV2BaseGenerator,
    ExLlamaV2StreamingGenerator,
    ExLlamaV2Sampler,
)

import time

class InferencingModel:
    def __init__(self, model_directory = "/mnt/Woo/text-generation-webui/models/TheBloke_Wizard-Vicuna-13B-Uncensored-GPTQ", lora_submission_directory = "/mnt/Woo/text-generation-webui/loras/Wizard-Vicuna-13B-Uncensored-GPTQ-reddit-submissions", lora_comment_directory = "/mnt/Woo/text-generation-webui/loras/Wizard-Vicuna-13B-Uncensored-GPTQ-reddit-comments", max_tokens=4096):
        self.loaded = False
        self.isGenerating = False
        self.model_directory = model_directory
        self.config = ExLlamaV2Config()
        self.config.model_dir = self.model_directory
        self.config.prepare()

        self.model = ExLlamaV2(self.config)

        self.max_tokens = max_tokens
        self.lora_submission_directory = lora_submission_directory
        self.lora_comment_directory = lora_comment_directory
        #self.load_model()
        self.initializePosts()

    def initializePosts(self):
        self.POST_TEMPLATE = Template(
        """You are a Reddit post generator.
User: 
Subreddit: $subreddit 
Author: $author 
Media: $media 
Title: $title 
Write the Reddit post.
Assistant:"""
)
        self.VALID_MEDIA = ["image", "video", "text", "article"] # articles are links to external sites
        self.TAGS = {
            "Subreddit": {
                "TAG": "[SUBREDDIT]",
                "CONSTRAINT": lambda x: x.startswith("/r/") and len(x) > len("/r/") + 3 and self.contains_letter(x) and len(x) <= len("/r/") + 21,
                "HELPER": lambda x: f"/r/{self.gen_valid_first_character(include_digits=False)}",
                "MAX_NEW_TOKENS": 24
            },
            "Author": {
                "TAG": "[AUTHOR]",
                "CONSTRAINT": lambda x: len(x) >= 3 and self.contains_letter(x) and len(x) <= 23,
                "HELPER": lambda x: self.gen_valid_first_character(include_digits=True),
                "MAX_NEW_TOKENS": 23
            },
            "Media": {
                "TAG": "[MEDIA]",
                "CONSTRAINT": lambda x: x in self.VALID_MEDIA,
                "HELPER": lambda x: x,
            },
            "Title": {
                "TAG": "[TITLE]",
                "CONSTRAINT": lambda x: len(x) > 0 and self.contains_letter(x) and len(x) <= 300,
                "HELPER": lambda x: x,
                "MAX_NEW_TOKENS": 300
            },
            "EOS": {
                "TAG": "Write the Reddit post.\nAssistant:",
                "CONSTRAINT": lambda x: x,
                "HELPER": lambda x: x,
            },
        }
        self.POST_TAGS_ORDER_OP = [
            self.TAGS["Subreddit"]["TAG"],
            self.TAGS["Author"]["TAG"],
            self.TAGS["Media"]["TAG"],
            self.TAGS["Title"]["TAG"],
            self.TAGS["EOS"]["TAG"],
        ]  # order matters

    def load_model(self):
        print("Loading model: " + self.model_directory)
        self.model.load()
        self.tokenizer = ExLlamaV2Tokenizer(self.config)
        self.cache = ExLlamaV2Cache(self.model, max_seq_len=self.max_tokens)
        self.lora_submission = ExLlamaV2Lora.from_directory(self.model, self.lora_submission_directory)
        self.lora_comment = ExLlamaV2Lora.from_directory(self.model, self.lora_comment_directory)
        self.streaming_generator = ExLlamaV2StreamingGenerator(self.model, self.cache, self.tokenizer)
        self.streaming_generator.warmup()
        self.streaming_generator.set_stop_conditions(["\nUser:", self.tokenizer.eos_token_id])
        self.simple_generator = ExLlamaV2BaseGenerator(self.model, self.cache, self.tokenizer)
        self.settings = ExLlamaV2Sampler.Settings()
        self.settings.temperature = 0.98
        self.settings.top_p = 0.37
        self.settings.token_repetition_penalty = 1.18
        self.loaded = True
        print("Model loaded")

    def unload_model(self):
        self.loaded = False
        self.model.unload()
        self.isGenerating = False

    def generate_with_lora(self, prompt_, lora_, max_new_tokens):
        input_ids = self.tokenizer.encode(prompt_)
        prompt_length = len(input_ids[0])
        total_possible_tokens_left = self.max_tokens - prompt_length - 1
        if max_new_tokens + prompt_length > total_possible_tokens_left:
            # see if we can get away with less
            max_new_tokens = total_possible_tokens_left
            if max_new_tokens < 150:
                raise ValueError("Hit cache limit")

        self.streaming_generator.begin_stream(input_ids, self.settings, loras=lora_)
        generated_tokens = 0
        output = ""
        while True:
            chunk, eos, _ = self.streaming_generator.stream()
            generated_tokens += 1
            output += chunk
            #print(chunk, end="")
            #sys.stdout.flush()
            if eos or generated_tokens == max_new_tokens:
                if not eos:
                    raise ValueError("Ran out of tokens on this prompt", output)
                break
        return output
    def deal_with_cutoff(self, output):
        punctuation = [".", "!", "?", "\"", "'", ";"]
        last_punctuation_index = -1
        for p in punctuation:
            index = output.rfind(p)
            if index > last_punctuation_index:
                last_punctuation_index = index
        if last_punctuation_index != -1:
            output = output[:last_punctuation_index + 1]
        else:
            if len(output) <= 3:
                output = ""
        return output
    def generate_post(self, **options):
        self.isGenerating = True
        default_options = {
            "subreddit": self.TAGS["Subreddit"]["TAG"],
            "author": self.TAGS["Author"]["TAG"],
            "media": self.TAGS["Media"]["TAG"],
            "title": self.TAGS["Title"]["TAG"],
        }
        options = {**default_options, **options}
        prompt_full = self.POST_TEMPLATE.substitute(
            options
        )

        # loop over tags in order
        for tag in self.POST_TAGS_ORDER_OP:
            if tag == self.TAGS["EOS"]["TAG"]:
                # add EOS tag
                #prompt_full = f"{prompt_full}\n{tag}"
                break
            prompt = self.get_up_to_tag(prompt_full, tag)
            if prompt == -1:
                continue  # skip tag if not found
            #print(prompt)
            next_tag_value = ""
            # get tag key from tag value
            for temp_tag_key, tag_obj in self.TAGS.items():
                if tag_obj["TAG"] == tag:
                    tag_key = temp_tag_key
                    next_tag_value = self.POST_TAGS_ORDER_OP[self.POST_TAGS_ORDER_OP.index(tag) + 1]
                    continue
                if tag_obj["TAG"] == next_tag_value:
                    next_tag_key = temp_tag_key
                    break

            # print("Tag: " + tag_key)
            #print(f"""generate from here to: '\\n'""")
            #print()
            self.streaming_generator.set_stop_conditions(
                ["\n", "\nUser:", self.tokenizer.eos_token_id]
            )
            valid_output = False
            while not valid_output:
                helper_starter_char = self.TAGS[tag_key]["HELPER"]("")
                if tag == "[MEDIA]":
                    # random valid media
                    output = random.choice(self.VALID_MEDIA)
                else:
                    try:
                        tokens = 1250
                        if MAX_NEW_TOKENS := self.TAGS[tag_key].get("MAX_NEW_TOKENS"):
                            tokens = MAX_NEW_TOKENS
                        output = self.generate_with_lora(f"{prompt}{helper_starter_char}", self.lora_submission, tokens)
                    except ValueError as e:
                        print(e, e.args[1])
                        # find last punctuation point and cut off there
                        output = self.deal_with_cutoff(e.args[1])
                        
                output = output.strip()
                output = helper_starter_char + output
                options[tag_key.lower()] = output
                #print(f"generated output: {output}")
                valid_output = self.TAGS[tag_key]["CONSTRAINT"](output)
                    
            # replace tag with output
            prompt_full = prompt_full.replace(tag, output)
            #prompt = f"{prompt}{output} \n{next_tag_key}:}"

        #print(prompt_full)
        self.streaming_generator.set_stop_conditions(
            ["\nUser:", self.tokenizer.eos_token_id]
        )
        options["postPrompt"] = prompt_full
        try:
            options["text"] = self.generate_with_lora(prompt_full, self.lora_submission, len(prompt_full) + 500)
        except ValueError as e:
            print(e)
            options["text"] = self.deal_with_cutoff(e.args[1])
        self.isGenerating = False
        return options

    def generate_comments(self, postObj, existingComments = [], next_user = "", num_comments=random.randint(1, 5)):
        self.isGenerating = True
        initialPrompt = f"""You are a Reddit user comment generator. In the conversation you change your Reddit username often to simulate different users.
User: You are on the subreddit {postObj["subreddit"]}.
Post title: {postObj["title"]}
Post media type: {postObj["media"]}
The post submission is about: {postObj["text"]}
The Original Poster(OP) username is: {postObj["author"]}
Your username is made up by you. Generate a comment in the format: USERNAME - COMMENT
Assistant: """

        folowupPrompt = f"""User: Generate a follow up comment in the format: USERNAME - COMMENT
Assistant: """ #  Undercoverotaku - Was looking for the comment pointing this out far too long.
        valid_output = False
        self.streaming_generator.set_stop_conditions(
            ["\nUser:", self.tokenizer.eos_token_id]
        )
        comments = []
        if len(existingComments) > 0:
            for comment in existingComments:
                existingComment = {
                    "user": comment["user"],
                    "text": comment["text"],
                    "formatted": f"""{comment["user"]} - {comment["text"]}"""
                }
                comments.append(existingComment)
                initialPrompt = f"""{initialPrompt}{existingComment["formatted"]}\n{folowupPrompt}"""
        
        if next_user:
            comment_first_char = f"""{next_user} - """
        else:
            comment_first_char = self.gen_valid_first_character(include_digits=False)
        prompt_builder = initialPrompt + comment_first_char
        for i in range(num_comments):
            attempts = 0
            valid_output = False
            broke = False
            while not valid_output:
                try:
                    comment = f"{comment_first_char}{self.generate_with_lora(prompt_builder, self.lora_comment, 350)}"
                except ValueError as e:
                    if "Hit cache limit" in str(e):
                        print("Hit cache limit")
                        broke = True
                        break
                    comment = ""
                comment = comment.strip()
                # length > 0 and contains a - character
                indexOfDash = comment.find("-")
                # Reddit usernames are 3-21 characters long
                # I'm enforcing a minimum of 3 characters for comments
                validDash = indexOfDash != -1 and indexOfDash > 3 and indexOfDash < len(comment) - 4
                if len(comment) > 0 and validDash:
                    valid_output = True
                else:
                    attempts += 1
                    if attempts > 5:
                        broke = True
                        break
            if broke:
                print('broke')
                break
            commentObj = {
                "user": comment[:indexOfDash].strip(),
                "text": comment[indexOfDash + 1:].strip(),
                "formatted": comment
            }
            comments.append(commentObj)
            
            comment_first_char = self.gen_valid_first_character(include_digits=False)
            prompt_builder = f"""{prompt_builder}{commentObj["formatted"]}\n{folowupPrompt}{comment_first_char}"""
        #print(prompt_builder)
        self.isGenerating = False
        return comments
    # Helpers
    def is_loaded(self):
        return self.loaded
    def is_generating(self):
        return self.isGenerating
    def contains_letter(self, s):
        return any(c.isalpha() for c in s)

    def gen_valid_first_character(self, include_digits=True):
        if include_digits and random.random() < 0.5:
            return random.choice(string.digits)
        return random.choice(string.ascii_letters)
    
    def get_up_to_tag_line(self, prompt, tag):
        try:
            sub_index = prompt.index(tag)
        except ValueError:
            print("Error: tag not found")
            return -1

        # get last \n before tag
        last_newline_index = prompt.rfind("\n", 0, sub_index)

        if last_newline_index == -1:
            last_newline_index = 0
        # remove  from last_newline_index to newline_index
        prompt = prompt[:last_newline_index]
        return prompt

    def get_up_to_tag(self, prompt, tag):
        try:
            sub_index = prompt.index(tag)
        except ValueError:
            return -1
        prompt = prompt[:sub_index]
        return prompt

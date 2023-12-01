
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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
    ExLlamaV2Sampler
)

import time

# Initialize model and cache

model_directory = "/mnt/Woo/text-generation-webui/models/TheBloke_Wizard-Vicuna-13B-Uncensored-GPTQ"
config = ExLlamaV2Config()
config.model_dir = model_directory
config.prepare()

model = ExLlamaV2(config)
print("Loading model: " + model_directory)
model.load()

tokenizer = ExLlamaV2Tokenizer(config)

cache = ExLlamaV2Cache(model)

# Load LoRA

lora_directory = "/mnt/Woo/text-generation-webui/loras/Wizard-Vicuna-13B-Uncensored-GPTQ-reddit-submissions"
lora = ExLlamaV2Lora.from_directory(model, lora_directory)

# Initialize generators

streaming_generator = ExLlamaV2StreamingGenerator(model, cache, tokenizer)
streaming_generator.warmup()

streaming_generator.set_stop_conditions(["\nUser:", tokenizer.eos_token_id])

simple_generator = ExLlamaV2BaseGenerator(model, cache, tokenizer)

# Sampling settings

settings = ExLlamaV2Sampler.Settings()
settings.temperature = 0.85
settings.top_k = 50
settings.top_p = 0.8
settings.token_repetition_penalty = 1.1

# Alpaca-style prompt

prompt = "You are a Reddit post generator.\nUser: \nSubreddit: /r/facepalm \nAuthor: thewrongun \nMedia: image \nTitle: Cops pepper sprayed their own Senator without realizing he's an authority figure \nWrite the Reddit post.\nAssistant:"
prompt = "You are a Reddit user comment generator. In the conversation you change your Reddit username often to simulate different users.\nUser: You are on the subreddit /r/facepalm.\nPost title: Cops pepper sprayed their own Senator without realizing he's an authority figure\nPost media type: image\nThe post submission is about: a man is being held by a police officer in front of a crowd\nThe Original Poster(OP) username is: thewrongun\nYour username is made up by you. Generate a comment in the format: USERNAME - COMMENT\nAssistant:"

# Generate with and without LoRA

def generate_with_lora(prompt_, lora_, max_new_tokens, streaming_ = True):

    print(prompt_, end="")
    sys.stdout.flush()

    if streaming_:

        input_ids = tokenizer.encode(prompt_)

        streaming_generator.begin_stream(input_ids, settings, loras = lora_)
        generated_tokens = 0
        while True:
            chunk, eos, _ = streaming_generator.stream()
            generated_tokens += 1
            print (chunk, end = "")
            sys.stdout.flush()
            if eos or generated_tokens == max_new_tokens: break

        print()

    else:

        output = simple_generator.generate_simple(prompt_, settings, max_new_tokens, loras = lora_)

        print (output[len(prompt_):])
        print()


streaming = True

print()
print("--------------------------")
print("No LoRA:")
print()

generate_with_lora(prompt, None, 250, streaming)

print()
print("--------------------------")
print("Yes LoRA:")
print()

generate_with_lora(prompt, lora, 250, streaming)

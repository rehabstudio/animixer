#!/ bin/python3

import os
import itertools

from google.cloud import storage
import numpy as np
import matplotlib.pyplot as plt
from multiprocessing import Pool
from magenta.models.nsynth import utils
from magenta.models.nsynth.wavenet import fastgen
from IPython.display import Audio
from tqdm import tqdm

INPUT_DIR = os.path.join(os.path.dirname(__file__), 'input_data', 'animals')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'output_data')
MAX_PROCESS = 4
MODEL = 'models/model.ckpt-200000'
ASYNC = False


def load_encoding(fname, sample_length=None, sr=16000, ckpt=MODEL):
    audio = utils.load_audio(fname, sample_length=sample_length, sr=sr)
    encoding = fastgen.encode(audio, ckpt, sample_length)
    return audio, encoding


def merge_sounds(audio_list):
    audio_1 = audio_list[0]
    audio_2 = audio_list[1]
    print('Merging sounds "{}" and "{}"'.format(audio_1, audio_2))
    audio_name_1 = audio_1.split('/')[-1].split('.')[0]
    audio_name_2 = audio_2.split('/')[-1].split('.')[0]
    output_name = audio_name_1 + audio_name_2
    output_path = 'output_data/{}.wav'.format(output_name)
    sample_length = 18000
    print("Loading Audio_1")
    aud1, enc1 = load_encoding(audio_1, sample_length)
    print("Loading Audio_2")
    aud2, enc2 = load_encoding(audio_2, sample_length)

    enc_mix = (enc1 + enc2) / 2.0

    print("Synthesizing new audio: {}".format(output_name))
    fastgen.synthesize(enc_mix, checkpoint_path=MODEL, save_paths=[output_path])

    return output_path


def unique_combinations(file_list):
    return [x for x in itertools.combinations(file_list, 2)]


def generate_sounds():
    print('Generating Sounds')
    output_files = []
    filenames = [
        os.path.join(INPUT_DIR, f) for f in os.listdir(INPUT_DIR)
        if os.path.isfile(os.path.join(INPUT_DIR, f)) and
        (f.endswith('.wav') or f.endswith('.mp3')) and
        f.startswith('_') is False ]

    combinations = unique_combinations(filenames)

    print('Generated animal combinations: ')
    for combo in combinations:
        print(combo)

    if ASYNC:
        with Pool(processes=MAX_PROCESS) as p:
            with tqdm(total=len(combinations)) as pbar:
                for i, value in tqdm(
                        enumerate(p.imap_unordered(merge_sounds, combinations))):
                    pbar.update()
                    output_files.append(value)
    else:
        for combo in tqdm(combinations):
            output_files.append(merge_sounds(combo))

    return output_files


def upload_to_cloud():
    client = storage.Client()
    bucket = client.get_bucket('animixer-1d266.appspot.com')
    file_paths = [
        os.path.join(OUTPUT_DIR, f) for f in os.listdir(OUTPUT_DIR)
        if os.path.isfile(os.path.join(OUTPUT_DIR, f)) and
        (f.endswith('.wav') or f.endswith('.mp3')) and
        f.startswith('_') is False ]

    print('Uploading to cloud')
    for sound in tqdm(file_paths):
        file_name = sound.split('/')[-1]
        blob = bucket.blob(file_name)
        blob.upload_from_filename(sound)
        blob.make_public()


if __name__ == '__main__':
    #sound_files = generate_sounds()
    upload_to_cloud()

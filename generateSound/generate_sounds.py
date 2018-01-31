#!/ bin/python3

import os
import itertools
import platform

from google.cloud import storage
import numpy as np
import matplotlib.pyplot as plt
from multiprocessing import Pool
from magenta.models.nsynth import utils
from magenta.models.nsynth.wavenet import fastgen
from IPython.display import Audio
from shutil import copyfile
from tqdm import tqdm

FILE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR = os.path.join(os.path.dirname(__file__), 'input_data', 'animals_processed')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'output_data', 'animals_processed')
MAX_PROCESS = 2
MODEL = 'models/model.ckpt-200000'
ASYNC = False
SEPARATOR = '\\' if platform.system() == 'Windows' else '/' # Replace with os library
SKIP_EXISTING = True


def load_encoding(fname, sample_length=None, sr=16000, ckpt=MODEL):
    audio = utils.load_audio(fname, sample_length=sample_length, sr=sr)
    encoding = fastgen.encode(audio, ckpt, sample_length)
    return audio, encoding


def merge_sounds(audio_list, skip_existing=True):
    audio_1 = audio_list[0]
    audio_2 = audio_list[1]
    audio_name_1 = audio_1.split(SEPARATOR)[-1].split('.')[0]
    audio_name_2 = audio_2.split(SEPARATOR)[-1].split('.')[0]
    output_name = ''.join(sorted([audio_name_1 , audio_name_2]))
    output_path = '{}{}{}.wav'.format(OUTPUT_DIR, SEPARATOR, output_name)

    if(os.path.exists(output_path) and skip_existing):
        print('Skipping sounds "{}" and "{}"'.format(audio_1, audio_2))
        return output_path

    print('Merging sounds "{}" and "{}"'.format(audio_1, audio_2))

    sample_length = 35000
    try:
        print("Loading Audio_1")
        aud1, enc1 = load_encoding(audio_1, sample_length)
        print("Loading Audio_2")
        aud2, enc2 = load_encoding(audio_2, sample_length)

        enc_mix = (enc1 + enc2) / 2.0

        print("Synthesizing new audio: {}".format(output_name))
        fastgen.synthesize(
            enc_mix, checkpoint_path=MODEL, save_paths=[output_path])
    except Exception as e:
        print('Erro skipping combo: {},\nError: {}'.format(
            str(output_name), str(e)))

    return output_path


def unique_combinations(file_list):
    return [x for x in itertools.combinations(file_list, 2)]


def get_audio_files(directory):
    return [
        os.path.join(directory, f) for f in os.listdir(directory)
        if os.path.isfile(os.path.join(directory, f)) and
        (f.endswith('.wav') or f.endswith('.mp3')) and
        f.startswith('_') is False ]


def generate_sounds(skip_existing=True):
    print('Generating Sounds')
    output_files = []
    filenames = get_audio_files(INPUT_DIR)
    combinations = unique_combinations(filenames)

    print('Generated animal combinations: ')
    for combo in combinations:
        print(combo)

    if ASYNC:
        with Pool(processes=MAX_PROCESS) as p:
            with tqdm(total=len(combinations)) as pbar:
                for i, value in tqdm(
                        enumerate(
                            p.imap_unordered(merge_sounds, combinations))):
                    pbar.update()
                    output_files.append(value)
    else:
        for combo in tqdm(combinations):
            output_files.append(merge_sounds(combo, skip_existing))

    return output_files

def add_original(skip_existing=True):
    '''
    Add original sounds to output folder
    '''
    print('Copying original sounds to output dir')
    filenames = get_audio_files(INPUT_DIR)
    for filepath in tqdm(filenames):
        animal_name, ext = filepath.split('/')[-1].split('.')
        filename = animalName + animalName + '.' + ext
        dest_path = os.path.join(FILE_DIR, OUTPUT_DIR, filename)

        if os.path.exists(dest_path) and skip_existing:
            continue

        copyfile(
            os.path.join(FILE_DIR, filename),
            dest_path)


def upload_to_cloud(skip_existing=True):
    client = storage.Client()
    bucket = client.get_bucket('animixer-1d266.appspot.com')
    file_paths = get_audio_files(OUTPUT_DIR)
    blobs = [b.name for b in bucket.list_blobs()]

    print('Uploading to cloud')
    for sound in tqdm(file_paths):
        file_name = sound.split('/')[-1]
        if file_name in blobs and skip_existing:
            continue
        blob = bucket.blob(file_name)
        blob.upload_from_filename(sound)
        blob.make_public()


if __name__ == '__main__':
    skip_existing = SKIP_EXISTING
    generate_sounds(skip_existing)
    add_original(skip_existing)
    upload_to_cloud(skip_existing)

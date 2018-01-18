#!/ bin/python3

import os
from google.cloud import storage
import imageio
from oauth2client.service_account import ServiceAccountCredentials
import requests
from tqdm import tqdm

ROOT_DIR = os.path.join(os.environ['HOME'], 'animixer')

def generate_gifs():
    gif_paths = []
    subdirs = [
        os.path.join(ROOT_DIR, d) for d in os.listdir(ROOT_DIR)
        if os.path.isdir(os.path.join(ROOT_DIR, d))]

    print('Generating Gifs')
    for subdir in tqdm(subdirs):
        subdir_name = subdir.split('/')[-1]
        gif_path = os.path.join(subdir, (subdir_name + '.gif'))

        if(os.path.exists(gif_path)):
            gif_paths.append(gif_path)
            continue

        filenames = [
            os.path.join(subdir, f) for f in os.listdir(subdir)
            if os.path.isfile(os.path.join(subdir, f)) and f.endswith('.tif')]
        images = []
        for filename in sorted(filenames):
            images.append(imageio.imread(filename))
        imageio.mimsave(gif_path, images, fps=25)
        gif_paths.append(gif_path)

    return gif_paths

def storage_file_exists(gcs_file):
    try:
        file = gcs.open(gcs_file,'r')
        file.close()
        status = True
    except:
        status = False
    return status

def upload_to_cloud(file_paths):
    client = storage.Client()
    bucket = client.get_bucket('animixer-1d266.appspot.com')
    blobs = [b.name for b in bucket.list_blobs()]

    print('Uploading to cloud')
    for gif in tqdm(file_paths):
        file_name = gif.split('/')[-1]
        if file_name in blobs:
            continue
        blob = bucket.blob(file_name)
        blob.upload_from_filename(gif)
        blob.make_public()


if __name__ == '__main__':
    gif_paths = generate_gifs()
    upload_to_cloud(gif_paths)

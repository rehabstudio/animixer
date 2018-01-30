#!/ bin/python3

import math
from multiprocessing import Pool
import os
import platform

from google.cloud import storage
import imageio
from oauth2client.service_account import ServiceAccountCredentials
import requests
from tqdm import tqdm

#ROOT_DIR = os.path.join(os.environ['HOME'], 'animixer')
ROOT_DIR = 'D:/Animixes'
SEPARATOR = '\\' if platform.system() == 'Windows' else '/'
MAX_PROCESS = 5
ASYNC = True


def generate_gifs(skip_existing=True):
    gif_paths = []
    subdirs = [
        os.path.join(ROOT_DIR, d) for d in os.listdir(ROOT_DIR)
        if os.path.isdir(os.path.join(ROOT_DIR, d))]

    print('Generating Gifs')
    for subdir in tqdm(subdirs):
        subdir_name = subdir.split(SEPARATOR)[-1]
        gif_path = os.path.join(subdir, (subdir_name + '.gif'))

        if(os.path.exists(gif_path) and skip_existing):
            gif_paths.append(gif_path)
            continue

        filenames = [
            os.path.join(subdir, f) for f in os.listdir(subdir)
            if os.path.isfile(os.path.join(subdir, f)) and f.endswith('.tif')]
        images = []
        for filename in sorted(filenames):
            try:
                images.append(imageio.imread(filename))
            except Exception as e:
                print('Error: filename {} failed, skipping'.format(filename))
                print(str(e))
                continue

        if len(images) == 0:
            print("Missing images for: {}".format(gif_path))
            continue

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


def upload_to_cloud(file_paths, skip_existing=True, position=0):
    #print('Starting Upload to cloud')
    client = storage.Client()
    bucket = client.get_bucket('animixer-1d266.appspot.com')
    #print('Getting list of files from server')
    blobs = [b.name for b in bucket.list_blobs()]

    #print('Uploading {} files to cloud'.format(len(file_paths)))
    for gif in tqdm(file_paths, position=position, desc='Process: {}'.format(position)):
        try:
            file_name = gif.split(SEPARATOR)[-1]
            if file_name in blobs and skip_existing:
                continue
            blob = bucket.blob(file_name)
            blob.upload_from_filename(gif)
            blob.make_public()
        except Exception as e:
            print('Error: unable to upload file: {}'.format(gif))
            print(str(e))
            continue


def batch_args(iterable, n=1, skip_existing=True):
    position = 1
    l = len(iterable)
    for ndx in range(0, l, n):
        yield [iterable[ndx:min(ndx + n, l)], skip_existing, position]
        position += 1


def async_upload(file_paths, batch_size=1000, skip_existing=True):
    num_processes = math.ceil(len(file_paths) / batch_size)
    with Pool(processes=MAX_PROCESS) as p:
        with tqdm(total=num_processes, position=0, desc='Processes Complete:') as pbar:
            for i, _ in tqdm(
                enumerate(
                    p.starmap(
                        upload_to_cloud,
                        batch_args(file_paths, batch_size, skip_existing)))):
                pbar.update()
    print("Async upload of files complete")


if __name__ == '__main__':
    gif_paths = generate_gifs()
    if ASYNC:
        async_upload(gif_paths, skip_existing=False)
    else:
        upload_to_cloud(gif_paths, skip_existing=False)

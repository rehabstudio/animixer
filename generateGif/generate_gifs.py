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

ASYNC = True
CLOUD_BUCKET = 'animixer-1d266.appspot.com'
MAX_PROCESS = 5
ROOT_DIR = os.path.join(os.environ['HOME'], 'animixer')
SEPARATOR = '\\' if platform.system() == 'Windows' else '/'
SKIP_EXISTING = False


def generate_gifs(skip_existing=True):
    """
    Process folders of tif images and generate gifs to same folder, return
    list of gif paths.
    """
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
            images.append(imageio.imread(filename))

        if len(images) == 0:
            print("Missing images for: {}".format(gif_path))
            continue

        imageio.mimsave(gif_path, images, fps=25)
        gif_paths.append(gif_path)

    return gif_paths


def storage_file_exists(gcs_file):
    """
    Return True if google cloud storage file exists
    """
    try:
        file = gcs.open(gcs_file,'r')
        file.close()
        status = True
    except:
        status = False
    return status


def upload_to_cloud(file_paths, skip_existing=True, position=0):
    """
    Upload file paths to cloud bucket defined in globals
    """
    #print('Starting Upload to cloud')
    client = storage.Client()
    bucket = client.get_bucket(CLOUD_BUCKET)
    #print('Getting list of files from server')
    blobs = [b.name for b in bucket.list_blobs()]

    #print('Uploading {} files to cloud'.format(len(file_paths)))
    for gif in tqdm(file_paths, position=position, desc='Process: {}'.format(position)):
        file_name = gif.split(SEPARATOR)[-1]
        if file_name in blobs and skip_existing:
            continue
        blob = bucket.blob(file_name)
        blob.upload_from_filename(gif)
        blob.make_public()


def batch_args(iterable, n=1, skip_existing=True):
    position = 1
    l = len(iterable)
    for ndx in range(0, l, n):
        yield [iterable[ndx:min(ndx + n, l)], skip_existing, position]
        position += 1


def async_upload(file_paths, batch_size=1000, skip_existing=True):
    """
    Launch multiple processes to speed up upload of gifs to GCS
    """
    num_processes = math.ceil(len(file_paths) / batch_size)
    with Pool(processes=MAX_PROCESS) as p:
        with tqdm(total=num_processes, position=0, desc='Processes Complete:') as pbar:
            for i, _ in tqdm(
                enumerate(
                    p.starmap(
                        upload_to_cloud,
                        batch_args(file_paths, batch_size, skip_existing)))):
                pbar.update()
    print "Async upload of files complete"


if __name__ == '__main__':
    gif_paths = generate_gifs()
    if ASYNC:
        async_upload(gif_paths, skip_existing=SKIP_EXISTING)
    else:
        upload_to_cloud(gif_paths, skip_existing=SKIP_EXISTING)

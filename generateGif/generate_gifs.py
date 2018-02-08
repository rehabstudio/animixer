#!/ bin/python3

import itertools
import json
import math
from multiprocessing import Pool
import os
import subprocess
from sys import platform

from google.cloud import storage
import imageio
from oauth2client.service_account import ServiceAccountCredentials
from PIL import Image
import requests
from tqdm import tqdm

if platform == "linux" or platform == "linux2" or platform == "darwin":
    # linux
    # OS X
    ROOT_DIR = os.path.join(os.environ['HOME'], 'animixer')
    SEPARATOR = '/'
    OS = 'unix'

elif platform == "win32":
    # Windows...
    ROOT_DIR = 'D:/Animixes'
    SEPARATOR = '\\'
    OS = 'win'

FILE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_FILE = os.path.join(FILE_DIR, 'ae_project', 'animixer_anim.aep')
PERMUTATIONS_FILE = os.path.join(FILE_DIR, 'ae_project', 'permutations.json')
IMAGE_FOLDER = os.path.join(ROOT_DIR, 'images')
ASYNC = True
CLOUD_BUCKET = 'animixer-1d266.appspot.com'
MAX_PROCESS = 5
SKIP_EXISTING = False


def generate_permuations(number_animals):
    # generate originals
    originals = [[x, x, x] for x in range(number_animals)]
    return originals + list(itertools.permutations(range(number_animals), 3))


def batch(iterable, n=1):
    l = len(iterable)
    for ndx in range(0, l, n):
        yield iterable[ndx:min(ndx + n, l)]


def batch_args(iterable, n=1, skip_existing=True):
    position = 1
    l = len(iterable)
    for ndx in range(0, l, n):
        yield [iterable[ndx:min(ndx + n, l)], skip_existing, position]
        position += 1
        

def generate_tiffs_ae(skip_existing=True):
    """
    generate tiffs for gifs in AE
    """
    # Generate permutations file
    permutations_file = None
    number_animals = 30
    permutations = generate_permuations(number_animals)
    batch_size = 500
    jobs = math.ceil(len(permutations) / batch_size)

    # Batch render animals and restart AE between batches
    for perms in tqdm(batch(permutations, batch_size), total=jobs):
        with open(PERMUTATIONS_FILE, 'w') as fp:
            fp.write(json.dumps(perms))

        if OS == 'unix':
            # Mac call
            ae = subprocess.call(
                'arch -x86_64 osascript ./ASfile.scpt '
                '%s%sanimixer.jsx "renderAnimals(\'%s\', \'%s\', \'%s\')"' % (
                    FILE_DIR, SEPARATOR, PROJECT_FILE, PERMUTATIONS_FILE, IMAGE_FOLDER), shell=True)
        else:
            windows_script = (
                "var scriptPath = '%s' + '/' + '%s';" + 
                "$.evalFile(scriptPath);renderAnimals('%s', '%s', '%s');") % (
                    FILE_DIR.replace('\\', '/'),
                    'animixer.jsx',
                    PROJECT_FILE.replace('\\', '/'),
                    PERMUTATIONS_FILE.replace('\\', '/'),
                    IMAGE_FOLDER.replace('\\', '/'))
            ae = subprocess.call(
                'C:\Program Files\Adobe\Adobe After Effects CC 2018\Support Files\AfterFX.exe ' +
                '-s "%s"' % windows_script)


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
        gif_path = os.path.join(ROOT_DIR, 'gifs', (subdir_name + '.gif'))

        if(os.path.exists(gif_path) and skip_existing):
            gif_paths.append(gif_path)
            continue

        filenames = [
            os.path.join(subdir, f) for f in os.listdir(subdir)
            if os.path.isfile(os.path.join(subdir, f)) and f.endswith('.tif')]
        images = []
        for filename in sorted(filenames):
            try:
                gif_file = imageio.imread(filename)
                images.append(gif_file)
            except Exception as e:
                print('Error: filename {} failed, skipping'.format(filename))
                print(str(e))
                continue

        if len(images) == 0:
            print("Missing images for: {}".format(gif_path))
            continue

        imageio.mimsave(gif_path, images, fps=25) # wrap me
        gif_paths.append(gif_path)

    return gif_paths


def generate_thumbnails(skip_existing=True):
    """
    Generate thumbnails for animals
    """
    thumbnail_paths = []
    subdirs = [
        os.path.join(ROOT_DIR, d) for d in os.listdir(ROOT_DIR)
        if os.path.isdir(os.path.join(ROOT_DIR, d))]

    print('Generating thumbnails')
    for subdir in tqdm(subdirs):
        subdir_name = subdir.split(SEPARATOR)[-1]
        thumbnail_path = os.path.join(ROOT_DIR, 'thumbnails', (subdir_name + '.tif'))

        if(os.path.exists(thumbnail_path) and skip_existing):
            thumbnail_paths.append(thumbnail_path)
            continue

        filenames = [
            os.path.join(subdir, f) for f in os.listdir(subdir)
            if os.path.isfile(os.path.join(subdir, f)) and f.endswith('.tif')]
        try:
            basewidth = 320
            img = Image.open(filenames[0])
            wpercent = (basewidth/float(img.size[0]))
            hsize = int((float(img.size[1])*float(wpercent)))
            img = img.resize((basewidth,hsize), Image.ANTIALIAS)
            img.save(thumbnail_path) 
        except Exception as e:
            print('Error: filename {} failed, skipping'.format(filename))
            print(str(e))
            continue

        thumbnail_paths.append(thumbnail_path)

    return thumbnail_paths

    
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


def upload_to_cloud(file_paths, skip_existing=True, position=0, folder=None):
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
        try:
            file_name = gif.split(SEPARATOR)[-1]
            if file_name in blobs and skip_existing:
                continue
            if folder:
                blob_name = os.path.join(folder, file_name)
            else:
                blob_name = file_name
            blob = bucket.blob(blob_name)
            blob.upload_from_filename(gif)
            blob.make_public()
        except Exception as e:
            print('Error: unable to upload file: {}'.format(gif))
            print(str(e))
            continue


def async_upload(file_paths, batch_size=1000, skip_existing=True, folder=None):
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
                        batch_args(file_paths, batch_size, skip_existing, folder)))):
                pbar.update()
    print("Async upload of files complete")


if __name__ == '__main__':
    generate_tiffs_ae()
    '''
    gif_paths = generate_gifs()
    if ASYNC:
        async_upload(gif_paths, skip_existing=SKIP_EXISTING)
    else:
        upload_to_cloud(gif_paths, skip_existing=SKIP_EXISTING)
    '''

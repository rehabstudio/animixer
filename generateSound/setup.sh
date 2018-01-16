#!/usr/bin/env bash
# Run with "source ./setup.sh"

command_exists () {
    type "$1" &> /dev/null ;
}

# If we have a virtual env active then deactivate
if command_exists deactivate
then
    deactivate
fi

# Simple setup script to install temporary venv into project directory to make cleaning up easier
if [ ! -d ./venv/bin/ ]
then
    python3 -m venv venv
    source ./venv/bin/activate
    pip3 install -r ./requirements.txt
    pip3 install --ignore-installed --upgrade "https://github.com/lakshayg/tensorflow-build/raw/master/tensorflow-1.4.0-cp36-cp36m-macosx_10_12_x86_64.whl"
fi

source ./venv/bin/activate

# Install pretrained model
curl http://download.magenta.tensorflow.org/models/nsynth/wavenet-ckpt.tar | tar -C models -x && mv models/wavenet-ckpt/* models
#curl http://download.magenta.tensorflow.org/models/nsynth/baseline-ckpt.tar | tar -C models -x && mv models/baseline-ckpt/* models

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
fi

source ./venv/bin/activate

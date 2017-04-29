#!/usr/bin/env bash

# the unofficial bash strict mode
set -euo pipefail
IFS=$'\n\t'


#
# Version checks with instructions on how to fix the issue
#

if ! (rustc --version | grep -Eq "^rustc 1.14.0 \(e8a012324 2016-12-16\)$")
then
    echo "This script requires rust version 0.17.0. The best way to install"
    echo "it is with a program called 'rustup' which you can get here:"
    echo "https://rustup.rs/"
    exit 1
fi

if ! (cargo --version | grep -Eq "^cargo 0.15.0-nightly \(298a012 2016-12-20\)$")
then
    echo "This script requires cargo version 0.18.0. The best way to install"
    echo "it is with a program called 'rustup' which you can get here:"
    echo "https://rustup.rs/"
    exit 2
fi

if ! (node --version | grep -Eq "^v6\.10\.0")
then
    echo "This script requires node 6.10.0. The best way to install"
    echo "it on osx and linux is with a program called 'nvm', which can be"
    echo "obtained by following the instructions on its github page here"
    echo "https://github.com/creationix/nvm"
    exit 3
fi

if ! (npm --version | grep -Eq "^3\.10\.10")
then
    echo "This script requires node 6.10.0. The best way to install"
    echo "it on osx and linux is with a program called 'nvm', which can be"
    echo "obtained by following the instructions on its github page here"
    echo "https://github.com/creationix/nvm"
    exit 4
fi

if [[ $(ls safe_launcher | wc -w) == 0 ]] ; then
    echo "It looks like the 'safe_launcher' directory is empty."
    echo "Did you remember to grab the git submodules?"
    exit 5
fi

if [[ $(ls safe_client_libs | wc -w) == 0 ]] ; then
    echo "It looks like the 'safe_client_libs' directory is empty."
    echo "Did you remember to grab the git submodules?"
    exit 6
fi

#
# Now the actual meat of the script
#

pushd safe_client_libs
cargo build --release --features use-mock-routing
popd

BUILD_OUTPUT=$(find safe_client_libs -type f -name 'libsafe_core.*'\
                   | grep -E "libsafe_core\.(so|dylib)"\
                   | grep -v "deps")

echo "Copying build output file: ${BUILD_OUTPUT} into the launcher directory"
cp $BUILD_OUTPUT safe_launcher/app/ffi

pushd safe_launcher
npm install
popd


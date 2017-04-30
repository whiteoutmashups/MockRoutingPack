# MockRoutingPack
All-in-one Repo for SAFE Network Mock Routing!!

This repo comes with everything you need to start playing with SAFE & developing Apps for it :D

It comes with:
 - Modified "Mock-Routing" Launcher v11
 - SAFE Beaker Browser by joshuef
 - SAFE Demo App 0.6.2 for uploading sites / files
 - and ALL 23 SAFE Web Apps for you to upload and try out!
 
 Enjoy!

## Building the Launcher Yourself

If you would prefer to build the launcher yourself, this
repo also contains a script called `build.bash` which will build
the versions of the launcher and client libs pinned in this repo.
In order to use the script, you have to make sure you have downloaded
the submodules. You can do this when you first clone the repo by
doing

    git clone --recursive -j8 git@github.com:wgallo3/MockRoutingPack.git

or if you have already donwloaded the repo and want to just fetch the
submodule content, you can do

    git submodule update --init --recursive

Then you can just type `./build.bash`. The script will prompt to you
to install the right version of rust and node.

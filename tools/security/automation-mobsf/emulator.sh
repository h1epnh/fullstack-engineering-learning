#!/bin/bash

cd ~/Android/Sdk/emulator/

# Start Emulator in cold boot, writable mode and with wipe data.
./emulator -avd mobsf -wipe-data -writable-system -no-snapshot
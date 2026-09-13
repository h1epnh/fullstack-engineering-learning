#!/bin/bash

''' Navigate where your file, which want to upload, is been located. '''

# Pass filename as argument.
file=$1

echo "$(tput setaf 3)IMPORTANT MESSAGE: $(tput setaf 7)To move file in APKs directory, first run the command $(tput setaf 4)python3 -m http.server 8080";

sleep 15;

# Upload/Transfer sample to APKs directory.
wget http://150.140.188.153:8080/"$file" > ~/Automation-MobSF/APKs/"$file";

# Delete sample from the directory, which was previously located.
rm "$file" "$file".1;

sleep 2m;

# Close port 8080.
fuser -k 8080/tcp
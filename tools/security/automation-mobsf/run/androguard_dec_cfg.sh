#!/bin/bash

apk="$1"
md5_sample="$2"

androguard decompile -o ~/Automation-MobSF/reports/"$md5_sample"/AndroguardAnalysis/ -f png -i "$apk"
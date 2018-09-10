#!/bin/bash

./gradlew ${1:-installDevDebug} --stacktrace && adb shell am start -n com.quadsurf.lipchat/host.exp.exponent.MainActivity

#!/bin/bash

# Source all our libraries if the exist and we arent in a prod build
for LIB in ./lib/*.sh; do
  tail -n +2 "$LIB"
done



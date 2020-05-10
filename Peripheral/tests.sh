#!/bin/bash

for f in $(ls py/test_*.py)
do
  echo Running $f tests...
  micropython $f
  if [ $? -ne 0 ]; then
    break
  fi
done
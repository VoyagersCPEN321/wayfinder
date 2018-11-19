#!/bin/bash
mkdir data
cd data
mkdir db
cd ../../
&mongod --dbpath data/db/
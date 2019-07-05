#!/bin/bash

./stop-ganache.sh
yarn ganache-cli --accounts=10 --host=127.0.0.1 --quiet -u 0 -u 1 -u 2 -u 3 &

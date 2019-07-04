#!/bin/bash

./stop-ganache.sh
yarn ganache-cli --accounts=10 --host=127.0.0.1 --quiet &

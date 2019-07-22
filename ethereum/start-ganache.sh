#!/bin/bash

./stop-ganache.sh
yarn ganache-cli --accounts=10 --host=127.0.0.1 --port=9545 --quiet --deterministic &
# TODO: Error: while converting number to string, invalid number value '1.157920892373162e+77', should be a number matching (^-?[0-9.]+).
# yarn ganache-cli --accounts=10 --defaultBalanceEther=115792089237316200000000000000000000000000000000000000000000000000000000000000 --host=127.0.0.1 --quiet --deterministic &
# yarn ganache-cli --accounts=10 --defaultBalanceEther=0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF --host=127.0.0.1 --quiet --deterministic &

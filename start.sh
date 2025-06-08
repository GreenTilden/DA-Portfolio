#!/bin/bash
npm run build
sleep 1
npm run dev -- --host

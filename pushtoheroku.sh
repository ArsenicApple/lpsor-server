#! /bin/bash

read -p "Commit message: " COMMITMESSAGE
git add .
git commit -m COMMITMESSAGE
git push heroku master
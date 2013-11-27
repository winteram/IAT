#! /bin/bash

echo "Would you like to use Textfile(T) or Database(D) to save the results? > "
read character
case $character in
    T ) echo "Setting up Textfile permissions.."
    	python ./tfile.py
        ;;
    D ) echo "Setting up database.."
        echo "You will be prompted for the MySQL password for 'root'"
        source createdb.sh
        ;;
    * ) echo "Not valid"
esac




if [[ $1 == "positions" ]];  
    then node_modules/.bin/babel-node index.js $1; 
elif [[ $1 == "summary" ]]; 
    then node_modules/.bin/babel-node index.js $1; 
else 
    echo "argument: positions|summary" 
fi



if [[ $1 == "stocks" ]];  
    then node_modules/.bin/babel-node index.js stocks; 
elif [[ $1 == "summary" ]]; 
    then node_modules/.bin/babel-node index.js stocks; 
else 
    echo "argument: stocks|summary" 
fi



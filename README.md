# avanza-monitor

Monitor current account information. Should not be used by anyone without
permission to use the avanza API.

should exists a file `config.js` with the export

```
module.exports = {
    username: USERNAME,
    password: PASSWORD,
    inserted: TOTAL_INSERTED_SUM
};
```

run with
```
chmod +x ./run.sh && ./run.sh summary|stocks
```

# avanza-monitor
Monitor the current positions and account summary

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

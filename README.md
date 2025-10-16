# storage.js

### Download
[Latest](//jc3213.github.io/storagedb.js/storagedb.js)

### HTML
```HTML
<script src="https://jc3213.github.io/storagedb.js/storagedb.js"></script>
```

### TamperMonkey
```javascript
// @require https://jc3213.github.io/storagedb.js/storagedb.js
```

## Syntax
```javascript
let storage = new StorageDB(database);
```
- database
    - `string`
    - The name of the database of `indexedDB`
    - You can't set database that has already been opened

## Method
- [open](#open)
    - Async: Promise
- [close](#close)
    - Async: Promise
- [set](#set)
    - Async: Promise
- [has](#has)
- [get](#get)
- [delete](#delete)
    - Async: Promise
- [entries](#entries)
- [keys](#keys)
- [values](#values)
- [forEach](#foreach)
- [clear](#clear)
    - Async: Promise
- [flush](#flush)
    - Async: Promise

### open
```javascript
await storage.open();
```

### close
```javascript
await storage.close();
```

### set
```javascript
await storage.set(key, value);
```
- key
    - `string` or `number`
- value
    - `string`, `number`, `object`, `array`, or `blob`

### has
```javascript
let result = storage.has(key);
```
- result
    - `boolean`

### get
```javascript
let value = storage.get(key);
```

### delete
```javascript
await storage.delete(key);
```

### entries
```javascript
let entries = storage.entires();
```
- entries
    - `array`

### keys
```javascript
let keys = storage.keys();
```
- keys
    - `array`

### values
```javascript
let values = storage.values();
```
- values
    - `array`

### forEach
```javascript
storage.forEach(
    callback: function
);
```
- callback
    - `function`
    - ( item: { key, value } ) => void

### clear
```javascript
await storage.clear();
```

### flush
```javascript
await storage.flush();
```

## Code Sample
```javascript
let db = new StorageDB('test');
await db.open();
console.log(await db.set('aaa', 'bbb')); // 'aaa';
console.log(await db.set('ccc', 'ddd')); // 'ccc';
console.log(db.has('bbb')); // false;
console.log(db.keys()); // ['aaa', 'ccc'];
console.log(db.set('aaa', 'eee')); // 'aaa'; overwrite 'aaa' => 'eee';
console.log(db.values()); // ['eee', 'ddd'];
console.log(await db.delete('aaa')); // undefined; removed 'aaa' => 'eee';
console.log(db.entries()); // [ {key: 'bbb', value: 'ddd'} ];
console.log(await db.clear()); // undefined; clear all items under database 'sample' -> object store 'test'
console.log(db.entries()); // [];
console.log(await db.flush()); // true;
console.log(await indexedDB.databases()); // [];
```

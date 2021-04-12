# to install

## 1. Run `npm install`

## 2. Create a .env file in the root folder with the following ([ref](https://www.npmjs.com/package/dotenv)):

```
DB_HOST=<db host>
DB_USER=<db username>
DB_PASSWORD=<db username password>
DB_NAME=<db name>
DB_PORT=<db port, usually is 3306>
```

## 3. Ensure table is created:

```
CREATE TABLE AdvertisementOptions (
    optionId BIGINT(10) NOT NULL,
    companyId   BIGINT(10) NOT NULL,
    audienceCount INT(10) NOT NULL,
    cost DECIMAL(7,2) NOT NULL,
    PRIMARY KEY(optionId),
    CONSTRAINT UC_AdvertisementOption
    UNIQUE KEY (companyId,audienceCount,cost) );
```

## 4. Run with console logging

   `npm run start:debug`

## 5. View api using swagger UI

   Navigate to `localhost:3000/docs` to view the swagger UI.
   The path is set in app.js: `require('./config/swagger')(app, '/docs')`

## 6. Example on how to retrieve data from API and render in front end using AJAX calls

Navigate to `localhost:3000/test`.

The HTML file is located at `src/views/test.html`.

The route is set in app.js:
`app.get('/test', (req, res) => res.sendFile(path.join(views, 'test.html')));`


### 7. Datatables rendering

For server-side, check out `/server-datatable`

For pure ajax, check out `/datatable`

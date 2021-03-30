# to install

1. Run `npm install`

2. create a .env file in the root folder with the following ([ref](https://www.npmjs.com/package/dotenv)):

```
DB_HOST=<db host>
DB_USER=<db username>
DB_PASSWORD=<db username password>
DB_NAME=<db name>
DB_PORT=<db port, usually is 3306>
```

3. ensure table is created:

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

4. run with console logging `npm run start:debug`

5. view api using swagger UI

Navigate to `localhost:3000/docs` to view the swagger UI.
The path can is set in app.js
`require('./config/swagger')(app, '/docs')`
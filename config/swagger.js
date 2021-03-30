// this is made using this tutorial:
// https://dev.to/kabartolo/how-to-document-an-express-api-with-swagger-ui-and-jsdoc-50do
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

function AddSwagger(app, routePath) {
  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Express API for MySQL demo API',
      version: '1.0.0',
      description:
        'This is a REST API application made with Express. It retrieves data from a MySQL database.',
      license: {
        name: 'Licensed Under MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'SGSEW MySQL backend',
        url: 'https://jsonplaceholder.typicode.com',
      },
    },
    servers: [
      {
        url: 'https://github.com/weirdyang/sgsew-mysql-backend',
        description: 'Development server',
      },
    ],
  };

  const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['./routes/*.js'],
  };
  const swaggerSpec = swaggerJSDoc(options);
  const docPath = routePath || '/docs';
  app.use(docPath, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = AddSwagger;

//v0.14 id = '5tAisM4pvefkDwHeaTj84FYB3JyPqUt8rXBRWgP14SWj'

const Dash = require('dash');
const secrets =require('./secrets.js');

const clientOpts = {
    network: 'evonet',
    wallet: {
      mnemonic: secrets.mnemonic
    }
  };
const client = new Dash.Client(clientOpts);

const registerContract = async function () {
  try {
    const platform = client.platform;
    const identity = await platform.identities.get('c6gnBEvVtyWfJ4vz67HGZHfDssNoMeJWDt82yoi128N');
    
    const contractDocuments = {
      rate: {
        properties: {
          baseCurrency: {
            type: "string"
          },
          price: {
            type: "number"
          },
          quoteCurrency: {
            type: "string"
          },
          retrieved: {
            type: "string",
            maxLength: 30
          },
          source: {
            type: "string",
            maxLength: 20
          },
          symbol: {
            type: "string",
            maxLength: 10
          }  
        },
        additionalProperties: false,
        required: [
          "baseCurrency",
          "price",
          "quoteCurrency",
          "retrieved",
          "source",
          "symbol"
        ],
        "indices": [ 
          {
            "properties": [
              { "source": "asc" }
            ], 
            "unique": false
          },
          {
            "properties": [
              { "symbol": "asc" }
            ], 
            "unique": false
          },
          {
            "properties": [
              { "retrieved": "desc" }
            ], 
            "unique": false
          }
        ]
      }};
    
    const contract = await platform.contracts.create(contractDocuments, identity);
    console.dir({contract});

    // Make sure contract passes validation checks
    const validationResult = await platform.dpp.dataContract.validate(contract);

    if (validationResult.isValid()) {
      console.log("validation passed, broadcasting contract..");
      // Sign and submit the data contract
      await platform.contracts.broadcast(contract, identity);
      console.log('contract id:', contract.getId());
    } else {
      console.error(validationResult) // An array of detailed validation errors
      throw validationResult.errors[0];
    }
    
  } catch (e) {
    console.error('Something went wrong:', e);
  } finally {
    client.disconnect();
  }
}

registerContract();
import "regenerator-runtime/runtime";
import * as nearAPI from "near-api-js";
import getConfig from "./config";
const nearConfig = getConfig("testnet");

async function connect(nearConfig) {
  // Connects to NEAR and provides `near`, `walletAccount` and `contract` objects in `window` scope
  // Initializing connection to the NEAR node.
  window.near = await nearAPI.connect({
    deps: {
      keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore()
    },
    ...nearConfig
  });

  // Needed to access wallet login
  window.walletConnection = new nearAPI.WalletConnection(window.near);

  // Initializing our contract APIs by contract name and configuration.
  window.contract = await new nearAPI.Contract(window.walletConnection.account(), nearConfig.contractName, {
    // View methods are read-only – they don't modify the state, but usually return some value
    viewMethods: ['get_pool'],
    // Change methods can modify the state, but you don't receive the returned value when called
    changeMethods: ['increment', 'decrement', 'reset'],
    // Sender is the account ID to initialize transactions.
    // getAccountId() will return empty string if user is still unauthorized
    sender: window.walletConnection.getAccountId()
  });
}

function updateUI() {

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const poolId = urlParams.get('poolId');
  contract.get_pool({ pool_id: +poolId }).then(pool => {
    document.getElementById("container").innerHTML = JSON.stringify(pool);
    console.log(pool)
  })
}

window.nearInitPromise = connect(nearConfig).then(updateUI);

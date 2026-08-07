import {TEKA_TOKEN} from "./contract";


export async function connectWallet(){


if(!window.ethereum){

alert("Install MetaMask");

return null;

}


const accounts =
await window.ethereum.request({

method:"eth_requestAccounts"

});


return accounts[0];


}





export async function addTokenToMetaMask(){


if(!window.ethereum){

alert("Install MetaMask");

return;

}



try{


const wasAdded =
await window.ethereum.request({

method:"wallet_watchAsset",

params:{


type:"ERC20",


options:{


address:
TEKA_TOKEN.contractAddress,


symbol:
TEKA_TOKEN.symbol,


decimals:
TEKA_TOKEN.decimals,


image:
"https://your-domain.com/logo.png"


}


}


});



if(wasAdded){

alert("TEKA added to MetaMask 🚀");

}


else{

alert("Cancelled");

}



}


catch(error){

console.log(error);

}


}
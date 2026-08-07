import "./TokenInfo.css";
import { useState } from "react";

import { connectWallet } from "../../blockchain/wallet";
import { TEKA_TOKEN } from "../../blockchain/contract";



function TokenInfo(){


const [wallet,setWallet] = useState("");



const contract = TEKA_TOKEN.contractAddress;



async function handleConnect(){


    const address = await connectWallet();


    if(address){

        setWallet(address);

    }


}




function copyAddress(){


    navigator.clipboard.writeText(contract);


    alert("Contract address copied!");

}




return(


<section className="token-info">


    <h2>
        TEKA Token
    </h2>



    <p className="token-desc">

        The official TEKA ecosystem token powering the future of digital innovation.

    </p>




    <div className="token-box">



        <div className="token-item">

            <span>
                Symbol
            </span>

            <h3>
                TEKA
            </h3>

        </div>





        <div className="token-item">

            <span>
                Total Supply
            </span>

            <h3>
                100,000,000 TEKA
            </h3>

        </div>





        <div className="token-item">

            <span>
                Network
            </span>

            <h3>
                Ethereum
            </h3>

        </div>





        <div className="token-item">


            <span>
                Contract
            </span>


            <h3 className="address">

                {contract}

            </h3>


            <button onClick={copyAddress}>

                Copy

            </button>


        </div>



    </div>





    <button 
    className="metamask-btn"
    onClick={handleConnect}
    >

        🦊 Connect Wallet

    </button>




    {

    wallet &&

    <p className="wallet-address">

        Connected:
        {" "}
        {wallet.slice(0,6)}
        ...
        {wallet.slice(-4)}

    </p>

    }




</section>


)


}



export default TokenInfo;
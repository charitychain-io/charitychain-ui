# CharityChain project

Choose an NGO and set a campaign target of 200 € for example.
You must drop half and collect the rest by inviting your entourage to unblock your donation.
If successful, 100% of the funds are donated to the NGO.
If the objective of the campaign is not achieved, everyone is reimbursed.


Project overview
https://medium.com/charitychain/introducing-charitychain-io-3c670204020d



## Running the Dapp locally

You can run the app locally using truffle. 

    git clone https://github.com/charitychain-io/charitychain-ui
    cd charitychain-ui
    npm install -g truffle     // if not already installed
    npm install truffle-default-builder --save
    truffle serve

You'll need to either be running a local ethereum node, or be using an Ethereum browser like Mist or Metamask. Point your Ethereum browser at the Ropsten TestNet.

Access your locally running app at `http://localhost:8080`

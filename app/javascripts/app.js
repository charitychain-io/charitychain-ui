// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import {default as Web3} from 'web3';
import {default as contract} from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import charitychain_artifacts from '../../build/contracts/Charitychain.json'

// charitychain is our usable abstraction, which we'll use through the code below.
var CharityChain = contract(charitychain_artifacts);
var ProgressBar = require('progressbar.js')

var accounts;
var account;

var circle;
var heart;

window.App = {
    start: function () {

        var self = this;

        CharityChain.setProvider(web3.currentProvider);

        web3.eth.getAccounts(function (err, accs) {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }

            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }

            accounts = accs;
            account = accounts[0];
            console.log(accounts);

            self.refreshBalance();
        });

        initProgressBar();
        initHeartBar();
    },

    setStatus: function (message) {
        var status = document.getElementById("status_step_1");
        status.innerHTML = message;
    },

    refreshBalance: function () {
        var self = this;
        var meta;

        web3.eth.getBalance(account, 'latest', function (err, result) {
            if (err != null) {
                console.error("Error while retrieving the balance for address[" + account + "]: " + err);
            }

            var balance = Number(web3.fromWei(result, "ether"));
            var balance_element = document.getElementById("balance");
            balance_element.innerHTML = balance;
            var acount_element = document.getElementById("acount");
            acount_element.innerHTML = account;

        });
    },
    createNewCharityChainContract: function () {

        initUI();

        this.setStatus("Initiating transaction... (please wait)");

        var self = this;
        var receiver = document.getElementById("receiver").value;
        var duration = document.getElementById("duration").value;
        var amount = document.getElementById("amount").value;

        CharityChain.new(receiver, duration, {
            from: account,
            gas: 4712388,
            value: web3.toWei(amount, 'ether')
        }).then(function (instance) {

            self.setStatus("New instance of charityChain contract created...(please wait)");
            web3.eth.getBalance(instance.address, 'latest', function (err, result) {
                if (err != null) {
                    console.error("Error while retrieving the balance for address[" + address + "]: " + err);
                }
                var balance = Number(web3.fromWei(result, "ether"));
                console.debug("Balance for new contract[" + account + "]=" + balance);
                self.setStatus("Your Charitychain contract is available on address[" + instance.address + "]");
                
                refreshContractInformation(instance.address);
                
            });

        }).catch(function (err) {
            console.log(err);
        });
    },
    readContract: function () {
        var contract_adress = document.getElementById("contract_address").value;


        refreshContractInformation(contract_adress);
    },
    contribute: function () {
        var contract_address = document.getElementById("contract_to_contribute_address").value;
        var contribute_amount = document.getElementById("contribute_amount").value;

        console.log("adress is "+contract_address);

        CharityChain.at(contract_address).then(function(instance) {

            instance.contribute({
                from: account,
                gas: 4712388,
                value: web3.toWei(contribute_amount, 'ether')
            }).then(function(result) {

                refreshContractInformation(contract_address);

                for (var i = 0; i < result.logs.length; i++) {
                    var log = result.logs[i];

                    if (log.event == "CampaignSuccessed") {

                        console.log("CampaignSuccessed!!!");
                        showSuccess();
                        break;
                    }
                    else if(log.event == "CampaignCanceled") {
                        console.log("CampaignCanceled!!!");
                        showFail();
                    }
                    else {

                    }
                }
            }).catch(function (err) {
                console.log(err);
            });

        });
    },
};

function refreshContractInformation(address)
{
    var contract_instance;

    var contract_address = document.getElementById("contract_address");
    contract_address.value = address;


    var contract_to_contribute_address = document.getElementById("contract_to_contribute_address");
    contract_to_contribute_address.value = address;

    CharityChain.at(address).then(function(instance) {
        contract_instance = instance;
        return instance.campaignGoal.call({from: account});
    }).then(function(goal) {

        var campaign_goal = document.getElementById("campaign_goal");
        campaign_goal.innerHTML = web3.fromWei(goal, "ether");
        return contract_instance.campaignStopDate.call({from: account});

    }).then(function(stopDate) {

        var formatedStodDate = new Date(stopDate*1000);
        var campaign_duration = document.getElementById("campaign_duration");
        campaign_duration.innerHTML = formatedStodDate.toUTCString();
        return contract_instance.beneficiary.call({from: account});

    }).then(function(beneficiary) {
        console.log(contract_instance);
        console.log(beneficiary);
        var campaign_ngo = document.getElementById("campaign_ngo");
        campaign_ngo.innerHTML = beneficiary;

        web3.eth.getBalance(address, 'latest', function (err, result) {
            if (err != null) {
                console.error("Error while retrieving the balance for address[" + account + "]: " + err);
            }
            var campaign_balance = document.getElementById("campaign_balance");
            campaign_balance.innerHTML = web3.fromWei(result, "ether");
            console.log("result is "+campaign_balance.innerText);
            console.log("campaign_goal is "+document.getElementById("campaign_goal").innerText);

            var percent = campaign_balance.innerText/document.getElementById("campaign_goal").innerText;

            circle.animate(percent);
            circle.setText((percent*100).toFixed()+"%");
        });


    }).catch(function(e) {
        // There was an error! Handle it.
    })
};

function initUI()
{
    document.getElementById('success').style.display = 'none';
    document.getElementById('fail').style.display = 'none';
}

function showSuccess()
{
    document.getElementById('success').style.display = 'block';
    heart.set(0);
    heart.animate(1.0);  // Number from 0.0 to 1.0
};

function showFail()
{
    document.getElementById('fail').style.display = 'block';
};


function initHeartBar() {
    heart = new ProgressBar.Path('#heart-path', {
        easing: 'easeInOut',
        duration: 1400
    });
    heart.set(0);
};
function initProgressBar() {



    circle = new ProgressBar.Circle('#progress', {
        color: '#df7366',
        duration: 1000,
        easing: 'easeInOut',
        strokeWidth: 3,
        trailWidth: 1,
        text: {
            // Initial value for text.
            // Default: null
            value: "",

            // Class name for text element.
            // Default: 'progressbar-text'
            className: 'progressbar__label',

            style: {
                // Text color.
                // Default: same as stroke color (options.color)
                color: '#df7366',
                position: 'absolute',
                left: '50%',
                top: '50%',
                padding: 0,
                margin: 0,
                // You can specify styles which will be browser prefixed
                transform: {
                    prefix: true,
                    value: 'translate(-50%, -50%)'
                }
            }
        }
    });


};

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    App.start();
});
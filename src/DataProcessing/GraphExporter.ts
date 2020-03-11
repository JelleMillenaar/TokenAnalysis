import { AddressManager } from "../Address/AddressManager";
import { Address } from "../Address/Address";
import { BundleManager } from "../Bundle/BundleManager";
import { Bundle } from "../Bundle/Bundle";
import { Transaction } from "../Transactions/Transaction";
import { TransactionManager } from "../Transactions/TransactionManager";
const fs = require('fs');

function valueLabel(value : number) : string {
    let negative = (value<0);
    value = Math.abs(value);
    let label;
    if(value < 1000) {
       label = value + " i";
    } else if (value < 1000000) {
        label = Math.floor(value/1000) + "." + Math.floor((value%1000)/10) + " Ki";
    } else if (value < 1000000000) {
        label = Math.floor(value/1000000) + "." + Math.floor((value%1000000)/10000) + " Mi";
    } else {// if (value < 1000000000000) {
        label = Math.floor(value/1000000000) + "." + Math.floor((value%1000000000)/10000000) + " Gi";
    }
    if(negative) {
        label = "-" + label;
    }
    return label;
}

function timestampLabel(timestamp : number) : string {
    let date = new Date(timestamp * 1000);
    return date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function colorLabel(renderColor : string|undefined) : string {
    let colorString = "";
    if(renderColor) {
        colorString = ", style=filled, color=\"" + renderColor + "\"";
    } 
    return colorString;
}

export class GraphExporter {
    private addresses : Map<string, Address>;
    private bundles : Map<string, Bundle>;
    private edges : Map<string, Transaction>;
    private name : string;

    constructor(name : string, inputColor : string = "#eda151", renderColor : string = "#4bf2b5") {
        this.name = name;
        this.addresses = new Map<string,Address>();
        this.bundles = new Map<string, Bundle>();
        this.edges = new Map<string, Transaction>();
    }

    public AddAll() {
        //Store all
        this.addresses = AddressManager.GetInstance().GetAddresses();
        this.bundles = BundleManager.GetInstance().GetBundles();
        this.calculateEdges();
    }

    public AddAddressSubGraph(addr : string) {
        let addressesToCheck : string[] = [addr];

        //Create a List of all nodes (Addresses & Bundles)
        while(addressesToCheck.length) {
            const currentAddresses = [...addressesToCheck];
            addressesToCheck = [];

            //Loop over the addresses
            for(let i=0; i < currentAddresses.length; i++) {
                let inMemAddr = AddressManager.GetInstance().GetAddressItem(currentAddresses[i]);
                if(inMemAddr) {
                    inMemAddr = <Address>inMemAddr;
                    this.addresses.set(currentAddresses[i], inMemAddr);
                    //Loop over the Bundles
                    let outBundles = inMemAddr.GetOutBundles();
                    for(let k=0; k < outBundles.length; k++) {
                        let outBundle = BundleManager.GetInstance().GetBundleItem(outBundles[k]);
                        //Prevent adding unknowns and duplicates
                        if(outBundle && !this.bundles.has(outBundles[k])) {
                            this.bundles.set(outBundles[k], outBundle);
                            addressesToCheck = addressesToCheck.concat(outBundle.GetOutAddresses());
                        }
                    }
                }
            }
            //Remove addresses we already processed and duplicates
            addressesToCheck = addressesToCheck.filter((addr, index) => {
                return !this.addresses.has(addr) && addressesToCheck.indexOf(addr) === index;
            });
        }

        this.calculateEdges();
    }

    private calculateEdges() {
        //Create a list of edges
        const transactions = TransactionManager.GetInstance().GetTransactions();
        transactions.forEach((value : Transaction, key : string) => {
            //Check if the nodes are included
            let inputHash = value.GetInput();
            let outputHash = value.GetOutput();
            if((this.addresses.has(inputHash) || this.bundles.has(inputHash)) && (this.addresses.has(outputHash) || this.bundles.has(outputHash))) {
                this.edges.set(key, value);
            }
        });
    }

    public ExportToDOT() {
        //Initialize the data
        console.log("Started writing to file.gv");
        let fileString : string = "";

        //Opening
        fileString = fileString.concat("digraph \"" + this.name + "\" {\n");
        fileString = fileString.concat("rankdir=LR;\n");

        //Render all Starting Addresses



        //Define all addresses without balance
        fileString = fileString.concat("node [shape=box]\n");
        this.addresses.forEach((value : Address, key : string) =>{
            if(value.IsSpent()) {
                fileString = fileString.concat("\"" + key + "\"[label=\"" + key.substr(0,3) + "..." +  key.substr(key.length-3,3) + "\" "+colorLabel(undefined)+"]\n");
            }
        });

        //Render all addresses with balance
        fileString = fileString.concat("node [style=filled, color=\"green\"]\n");
        this.addresses.forEach((value : Address, key : string) =>{
            if(!value.IsSpent()) {
                fileString = fileString.concat("\"" + key + "\"[label=\"" + key.substr(0,3) + "..." + key.substr(key.length-3,3) + "\\n"+ valueLabel(value.GetCurrentValue()) +"\"]\n");
            }
        });

        //Define all bundles
        fileString = fileString.concat("node [shape=ellipse, style=unfilled, color=\"black\"]\n");
        this.bundles.forEach((value : Bundle, key : string) => {
            fileString = fileString.concat("\"" + key + "\"[label=\"" + timestampLabel(value.GetTimestamp()) + "\""+colorLabel(undefined)+"]\n");
        });

        //Add all edges
        this.edges.forEach((value : Transaction, key : string ) => {
            fileString = fileString.concat("\"" + value.GetInput() + "\" -> \"" + value.GetOutput() + "\"");
            fileString = fileString.concat("[label=\""+ valueLabel(value.GetValue()) +"\"];\n")
        });

        //Closing
        fileString = fileString.concat("}");

        //Write to file
        fs.writeFile("DOT/" + this.name + ".gv", fileString, (err : Error) => {
            if(err) console.log("Error writing file: " + this.name + ":" + err);
            else {
                console.log("Succesfully saved " + this.name);
            }
        });
    }

    public ExportToCSV(folder : string) {
        //Initialize
        let fileString = "";

        //Save Transactions
        this.edges.forEach((value : Transaction, key : string) => {
            fileString = fileString.concat("tx;" + key + ";" + value.GetInput() + ';' + value.GetOutput() + ";" + value.GetValue() + ";" + value.GetTag() + "\n");
        });

        //Save Addresses
        this.addresses.forEach((value : Address, key : string) => {
            //Initial Values
            fileString = fileString.concat("addr;" + key + ";" + value.GetTimestamp() + ";" + value.GetCurrentValue());
            
            //Arrays
            fileString = fileString.concat(";" + JSON.stringify(value.GetInTxs()));
            fileString = fileString.concat(";" + JSON.stringify(value.GetOutTxs()));

            //Finish
            fileString = fileString.concat("\n");
        });

        //Save Bundles
        this.bundles.forEach((value : Bundle, key : string) => {
            //Initial Values
            fileString = fileString.concat("bundle;" + key + ";" + value.GetTimestamp());

            //Arrays
            fileString = fileString.concat(";" + JSON.stringify(value.GetInTxs()));
            fileString = fileString.concat(";" + JSON.stringify(value.GetOutTxs()));

            //Finish
            fileString = fileString.concat("\n");
        });

        //Store to File
        fs.writeFile( folder + "/" + this.name + ".csv", fileString, (err : Error) => {
            if(err) console.log("Error writing file: " + this.name + ":" + err);
            else {
                //console.log("Succesfully saved " + this.name);
            }
        });
    }

    public ExportAllTransactionHashes(folder : string) {
        this.ExportArrayToFile(Array.from(this.edges.keys()), "txhashes", folder);
    }

    public ExportAllBundleHashes(folder : string) {
        this.ExportArrayToFile(Array.from(this.bundles.keys()), "bundlehashes", folder);
    }

    public ExportAllAddressHashes(folder : string) {
        this.ExportArrayToFile(Array.from(this.addresses.keys()), "addrhashes", folder);
    }

    public ExportAllUnspentAddressHashes(folder : string) {
        //Filters addresses that are spent and gets all hashes
        let addresses = Array.from(this.addresses.values()).filter((value : Address) => {
            return !value.IsSpent();
        }).map((value : Address) => { return value.GetAddressHash()});
        this.ExportArrayToFile(addresses, "unspentaddrhashes", folder);
    }

    private ExportArrayToFile(data : string[], itemname : string, folder : string) {
        let fileString = "";
        for(let i=0; i<data.length;i++) {
            fileString = fileString.concat(data[i] + "\n");
        }
        let name = folder + "/" + itemname + "_" + this.name + ".txt";
        fs.writeFile(name , fileString, (err : Error) => {
            if(err) console.log("Error writing file: " + name + ":" + err);
            else {
                console.log("Succesfully saved " + name);
            }
        });
    }

    public GetUnspentValue() : number {
        let unspentValue : number = 0;
        Array.from(this.addresses.values()).filter((value : Address) => {
            return !value.IsSpent();
        }).map((value : Address) => { unspentValue += value.GetCurrentValue()});;
        return unspentValue;
    }
}
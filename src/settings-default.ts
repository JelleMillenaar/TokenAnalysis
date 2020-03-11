export const maxTryCount = 8;
export const maxQueryDepth = 1000;

export const ProviderList = [
    "https://nodes.iota.org:443",
    "http://bare01.mainnet.iota.cafe:14265",
    "http://bare02.mainnet.iota.cafe:14265",
    "http://bare03.mainnet.iota.cafe:14265",
    "http://bare04.mainnet.iota.cafe:14265",
    "http://iri01.mainnet.iota.cafe:14265",
    "http://iri02.mainnet.iota.cafe:14265",
    "http://iri03.mainnet.iota.cafe:14265",
    "http://iri04.mainnet.iota.cafe:14265",
    "http://iri05.mainnet.iota.cafe:14265"
];

const BundlesToSearch : string[] = [
    
];

const AddressesToSearch : string[] = [
    
];

export const command = {
    bundlesToSearch : BundlesToSearch, /* */
    addressesToSearch : AddressesToSearch, /* */
    outputAllTxs : false, /*  */
    outputAllBundles : false, /* */
    outputAllAddresses : false, /* */
    outputAllPositiveAddresses : false, /* */
    name : "PlaceHoldername", /* */
}
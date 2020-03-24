

import { ServiceFactory } from "./Factories/serviceFactory";
import { ApiClient } from './Services/apiClient';
import { domain } from './settings-default';
import { getBundleHashFromTransaction, QueryBundles } from "./DataProcessing/query"
import { IAddress } from "./Models/zmqService/IAddress";
import { ISubscriptions } from "./Models/ISubscriptions";


let subscriptions: ISubscriptions[] = [];


const subscribe: any = async (address: string[]) => {

    ServiceFactory.register("api", () => new ApiClient(domain));
    const apiClient = ServiceFactory.get<ApiClient>("api");

    let previousEvent: string[] = []
    const response = await apiClient.zmqSubscribeAddress(
        {
            address: address
        },
        async (event: string, data: IAddress) => {
            // Process every bundle once
            if (!previousEvent.includes(event)) {
                previousEvent.push(event)

                const bundleHash: string = await getBundleHashFromTransaction(data.transaction.toString())
                const newAdress: string[] = await QueryBundles([bundleHash])

                subscribe(newAdress)

                //Unsubscribe from previous Address
                if (bundleHash) {
                    const subID = subscriptions.find(o => o.event === event)
                    if (subID) {
                        unsubscribe([subID.subscriptionId])
                    }
                }
            }
        });

    if (response.subscriptionIds) {
        for (let i = 0; i < response.subscriptionIds.length; i++) {
            subscriptions.push({ event: address[i], subscriptionId: response.subscriptionIds[i] });
        }
    }

    console.log("subscribed to:", subscriptions)

}

subscribe(['JKBXVEWATDKIEFCUDNPDMHTISUARFHBDRKJTE9XNIUADNLQHIRFNYGWETBNECGQGUIUWYOBCFGBAXBQZ9']);





const unsubscribe: any = async (subscriptionId: string[]) => {
    const apiClient = ServiceFactory.get<ApiClient>("api");
    const response = await apiClient.zmqUnsubscribe(
        {
            subscriptionIds: subscriptionId
        });
    if (response.success) {
        console.log("Successfully unfollowed " + subscriptionId)
    }

}
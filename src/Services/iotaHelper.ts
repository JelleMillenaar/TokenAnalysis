import { composeAPI } from '@iota/core';
import axios from 'axios';
import crypto from 'crypto';
import { fromTrytes } from './trytesHelper';

const provider =  'https://nodes.devnet.iota.org:443'

const iota = composeAPI({ provider });

/**
 * Find transaction objects from the given bundle
 * @param bundle The bundle to process.
 * @returns Array of IOTA transactions
 */
export const findTransactions = async (bundle: any) => {
    try {
        return new Promise((resolve, reject) => {
            iota.findTransactionObjects({ bundles: [bundle] })
                .then(resolve)
                .catch(error => {
                    console.error('findTransactions error', error);
                   // reject(error);
                });
        });
    } catch (error) {
        console.error('findTransactions catch', error);
        return error;
    }
};

export const getPayload = async (bundle: any) => {
    try {
        //Wait for whole bundle 
		await new Promise(resolve => setTimeout(resolve, 2000));
        const rawTransactions = await findTransactions(bundle);
        if (!rawTransactions.length || !rawTransactions[0].signatureMessageFragment) {
            return null;
        }

        const transactions = [];
        const map = new Map();
        for (const transaction of rawTransactions) {
            if (!map.has(transaction.currentIndex)) {
                map.set(transaction.currentIndex, true);
                transactions.push(transaction);
            }
        }

        let message = '';
        transactions
            .sort((a, b) => a.currentIndex - b.currentIndex)
            .forEach(({ signatureMessageFragment }) => {
                message += signatureMessageFragment;
            });
        return JSON.parse(decodeURI(fromTrytes(message)));
    } catch (error) {
        console.error('getPayload catch', error, bundle);
        console.error('getPayload bundle', bundle);
        return error;
    }
};

export const findBundle = async (transaction: string) => {
    try {
        return new Promise((resolve, reject) => {
            iota.getTransactionObjects([transaction])
                .then(resolve)
                .catch(error => {
                    console.error('findTransactions error', error);
                   // reject(error);
                });
        });
    } catch (error) {
        console.error('findTransactions catch', error);
        return error;
    }
};
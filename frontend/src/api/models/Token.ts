/* tslint:disable */
/* eslint-disable */
/**
 * FastAPI
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface Token
 */
export interface Token {
    /**
     * 
     * @type {string}
     * @memberof Token
     */
    accessToken: string;
    /**
     * 
     * @type {string}
     * @memberof Token
     */
    tokenType: string;
}

/**
 * Check if a given object implements the Token interface.
 */
export function instanceOfToken(value: object): value is Token {
    if (!('accessToken' in value) || value['accessToken'] === undefined) return false;
    if (!('tokenType' in value) || value['tokenType'] === undefined) return false;
    return true;
}

export function TokenFromJSON(json: any): Token {
    return TokenFromJSONTyped(json, false);
}

export function TokenFromJSONTyped(json: any, ignoreDiscriminator: boolean): Token {
    if (json == null) {
        return json;
    }
    return {
        
        'accessToken': json['access_token'],
        'tokenType': json['token_type'],
    };
}

export function TokenToJSON(json: any): Token {
    return TokenToJSONTyped(json, false);
}

export function TokenToJSONTyped(value?: Token | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'access_token': value['accessToken'],
        'token_type': value['tokenType'],
    };
}


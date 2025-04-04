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
 * @interface RoleUpdate
 */
export interface RoleUpdate {
    /**
     * 
     * @type {string}
     * @memberof RoleUpdate
     */
    name?: string | null;
    /**
     * 
     * @type {string}
     * @memberof RoleUpdate
     */
    description?: string | null;
}

/**
 * Check if a given object implements the RoleUpdate interface.
 */
export function instanceOfRoleUpdate(value: object): value is RoleUpdate {
    return true;
}

export function RoleUpdateFromJSON(json: any): RoleUpdate {
    return RoleUpdateFromJSONTyped(json, false);
}

export function RoleUpdateFromJSONTyped(json: any, ignoreDiscriminator: boolean): RoleUpdate {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'] == null ? undefined : json['name'],
        'description': json['description'] == null ? undefined : json['description'],
    };
}

export function RoleUpdateToJSON(json: any): RoleUpdate {
    return RoleUpdateToJSONTyped(json, false);
}

export function RoleUpdateToJSONTyped(value?: RoleUpdate | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'name': value['name'],
        'description': value['description'],
    };
}


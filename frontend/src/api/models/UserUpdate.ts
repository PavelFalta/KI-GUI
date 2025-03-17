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
 * @interface UserUpdate
 */
export interface UserUpdate {
    /**
     * 
     * @type {string}
     * @memberof UserUpdate
     */
    username?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UserUpdate
     */
    firstName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UserUpdate
     */
    lastName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UserUpdate
     */
    email?: string | null;
    /**
     * 
     * @type {number}
     * @memberof UserUpdate
     */
    roleId?: number | null;
    /**
     * 
     * @type {boolean}
     * @memberof UserUpdate
     */
    isActive?: boolean | null;
    /**
     * 
     * @type {string}
     * @memberof UserUpdate
     */
    password?: string | null;
}

/**
 * Check if a given object implements the UserUpdate interface.
 */
export function instanceOfUserUpdate(value: object): value is UserUpdate {
    return true;
}

export function UserUpdateFromJSON(json: any): UserUpdate {
    return UserUpdateFromJSONTyped(json, false);
}

export function UserUpdateFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserUpdate {
    if (json == null) {
        return json;
    }
    return {
        
        'username': json['username'] == null ? undefined : json['username'],
        'firstName': json['first_name'] == null ? undefined : json['first_name'],
        'lastName': json['last_name'] == null ? undefined : json['last_name'],
        'email': json['email'] == null ? undefined : json['email'],
        'roleId': json['role_id'] == null ? undefined : json['role_id'],
        'isActive': json['is_active'] == null ? undefined : json['is_active'],
        'password': json['password'] == null ? undefined : json['password'],
    };
}

export function UserUpdateToJSON(json: any): UserUpdate {
    return UserUpdateToJSONTyped(json, false);
}

export function UserUpdateToJSONTyped(value?: UserUpdate | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'username': value['username'],
        'first_name': value['firstName'],
        'last_name': value['lastName'],
        'email': value['email'],
        'role_id': value['roleId'],
        'is_active': value['isActive'],
        'password': value['password'],
    };
}


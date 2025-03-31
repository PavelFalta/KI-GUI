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
 * @interface CategoryResponse
 */
export interface CategoryResponse {
    /**
     * 
     * @type {string}
     * @memberof CategoryResponse
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CategoryResponse
     */
    description?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof CategoryResponse
     */
    isActive?: boolean;
    /**
     * 
     * @type {number}
     * @memberof CategoryResponse
     */
    categoryId: number;
}

/**
 * Check if a given object implements the CategoryResponse interface.
 */
export function instanceOfCategoryResponse(value: object): value is CategoryResponse {
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('categoryId' in value) || value['categoryId'] === undefined) return false;
    return true;
}

export function CategoryResponseFromJSON(json: any): CategoryResponse {
    return CategoryResponseFromJSONTyped(json, false);
}

export function CategoryResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): CategoryResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'],
        'description': json['description'] == null ? undefined : json['description'],
        'isActive': json['is_active'] == null ? undefined : json['is_active'],
        'categoryId': json['category_id'],
    };
}

export function CategoryResponseToJSON(json: any): CategoryResponse {
    return CategoryResponseToJSONTyped(json, false);
}

export function CategoryResponseToJSONTyped(value?: CategoryResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'name': value['name'],
        'description': value['description'],
        'is_active': value['isActive'],
        'category_id': value['categoryId'],
    };
}


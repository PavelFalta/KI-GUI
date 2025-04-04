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
 * @interface TaskCreate
 */
export interface TaskCreate {
    /**
     * 
     * @type {string}
     * @memberof TaskCreate
     */
    title?: string;
    /**
     * 
     * @type {string}
     * @memberof TaskCreate
     */
    description?: string | null;
    /**
     * 
     * @type {number}
     * @memberof TaskCreate
     */
    courseId: number;
    /**
     * 
     * @type {boolean}
     * @memberof TaskCreate
     */
    isActive?: boolean;
}

/**
 * Check if a given object implements the TaskCreate interface.
 */
export function instanceOfTaskCreate(value: object): value is TaskCreate {
    if (!('courseId' in value) || value['courseId'] === undefined) return false;
    return true;
}

export function TaskCreateFromJSON(json: any): TaskCreate {
    return TaskCreateFromJSONTyped(json, false);
}

export function TaskCreateFromJSONTyped(json: any, ignoreDiscriminator: boolean): TaskCreate {
    if (json == null) {
        return json;
    }
    return {
        
        'title': json['title'] == null ? undefined : json['title'],
        'description': json['description'] == null ? undefined : json['description'],
        'courseId': json['course_id'],
        'isActive': json['is_active'] == null ? undefined : json['is_active'],
    };
}

export function TaskCreateToJSON(json: any): TaskCreate {
    return TaskCreateToJSONTyped(json, false);
}

export function TaskCreateToJSONTyped(value?: TaskCreate | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'title': value['title'],
        'description': value['description'],
        'course_id': value['courseId'],
        'is_active': value['isActive'],
    };
}


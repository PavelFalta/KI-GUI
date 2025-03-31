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
 * @interface TaskUpdate
 */
export interface TaskUpdate {
    /**
     * 
     * @type {string}
     * @memberof TaskUpdate
     */
    title?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TaskUpdate
     */
    description?: string | null;
    /**
     * 
     * @type {number}
     * @memberof TaskUpdate
     */
    courseId?: number | null;
    /**
     * 
     * @type {boolean}
     * @memberof TaskUpdate
     */
    isActive?: boolean | null;
}

/**
 * Check if a given object implements the TaskUpdate interface.
 */
export function instanceOfTaskUpdate(value: object): value is TaskUpdate {
    return true;
}

export function TaskUpdateFromJSON(json: any): TaskUpdate {
    return TaskUpdateFromJSONTyped(json, false);
}

export function TaskUpdateFromJSONTyped(json: any, ignoreDiscriminator: boolean): TaskUpdate {
    if (json == null) {
        return json;
    }
    return {
        
        'title': json['title'] == null ? undefined : json['title'],
        'description': json['description'] == null ? undefined : json['description'],
        'courseId': json['course_id'] == null ? undefined : json['course_id'],
        'isActive': json['is_active'] == null ? undefined : json['is_active'],
    };
}

export function TaskUpdateToJSON(json: any): TaskUpdate {
    return TaskUpdateToJSONTyped(json, false);
}

export function TaskUpdateToJSONTyped(value?: TaskUpdate | null, ignoreDiscriminator: boolean = false): any {
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


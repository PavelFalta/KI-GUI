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
 * @interface CourseUpdate
 */
export interface CourseUpdate {
    /**
     * 
     * @type {string}
     * @memberof CourseUpdate
     */
    title?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CourseUpdate
     */
    description?: string | null;
    /**
     * 
     * @type {number}
     * @memberof CourseUpdate
     */
    categoryId?: number | null;
    /**
     * 
     * @type {number}
     * @memberof CourseUpdate
     */
    teacherId?: number | null;
    /**
     * 
     * @type {number}
     * @memberof CourseUpdate
     */
    deadlineInDays?: number | null;
    /**
     * 
     * @type {boolean}
     * @memberof CourseUpdate
     */
    isActive?: boolean | null;
}

/**
 * Check if a given object implements the CourseUpdate interface.
 */
export function instanceOfCourseUpdate(value: object): value is CourseUpdate {
    return true;
}

export function CourseUpdateFromJSON(json: any): CourseUpdate {
    return CourseUpdateFromJSONTyped(json, false);
}

export function CourseUpdateFromJSONTyped(json: any, ignoreDiscriminator: boolean): CourseUpdate {
    if (json == null) {
        return json;
    }
    return {
        
        'title': json['title'] == null ? undefined : json['title'],
        'description': json['description'] == null ? undefined : json['description'],
        'categoryId': json['category_id'] == null ? undefined : json['category_id'],
        'teacherId': json['teacher_id'] == null ? undefined : json['teacher_id'],
        'deadlineInDays': json['deadline_in_days'] == null ? undefined : json['deadline_in_days'],
        'isActive': json['is_active'] == null ? undefined : json['is_active'],
    };
}

export function CourseUpdateToJSON(json: any): CourseUpdate {
    return CourseUpdateToJSONTyped(json, false);
}

export function CourseUpdateToJSONTyped(value?: CourseUpdate | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'title': value['title'],
        'description': value['description'],
        'category_id': value['categoryId'],
        'teacher_id': value['teacherId'],
        'deadline_in_days': value['deadlineInDays'],
        'is_active': value['isActive'],
    };
}


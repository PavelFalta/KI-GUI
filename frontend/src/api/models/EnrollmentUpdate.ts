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
 * @interface EnrollmentUpdate
 */
export interface EnrollmentUpdate {
    /**
     * 
     * @type {number}
     * @memberof EnrollmentUpdate
     */
    studentId?: number | null;
    /**
     * 
     * @type {number}
     * @memberof EnrollmentUpdate
     */
    courseId?: number | null;
    /**
     * 
     * @type {number}
     * @memberof EnrollmentUpdate
     */
    assignerId?: number | null;
    /**
     * 
     * @type {Date}
     * @memberof EnrollmentUpdate
     */
    completedAt?: Date | null;
    /**
     * 
     * @type {Date}
     * @memberof EnrollmentUpdate
     */
    deadline?: Date | null;
    /**
     * 
     * @type {boolean}
     * @memberof EnrollmentUpdate
     */
    isActive?: boolean | null;
}

/**
 * Check if a given object implements the EnrollmentUpdate interface.
 */
export function instanceOfEnrollmentUpdate(value: object): value is EnrollmentUpdate {
    return true;
}

export function EnrollmentUpdateFromJSON(json: any): EnrollmentUpdate {
    return EnrollmentUpdateFromJSONTyped(json, false);
}

export function EnrollmentUpdateFromJSONTyped(json: any, ignoreDiscriminator: boolean): EnrollmentUpdate {
    if (json == null) {
        return json;
    }
    return {
        
        'studentId': json['student_id'] == null ? undefined : json['student_id'],
        'courseId': json['course_id'] == null ? undefined : json['course_id'],
        'assignerId': json['assigner_id'] == null ? undefined : json['assigner_id'],
        'completedAt': json['completed_at'] == null ? undefined : (new Date(json['completed_at'])),
        'deadline': json['deadline'] == null ? undefined : (new Date(json['deadline'])),
        'isActive': json['is_active'] == null ? undefined : json['is_active'],
    };
}

export function EnrollmentUpdateToJSON(json: any): EnrollmentUpdate {
    return EnrollmentUpdateToJSONTyped(json, false);
}

export function EnrollmentUpdateToJSONTyped(value?: EnrollmentUpdate | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'student_id': value['studentId'],
        'course_id': value['courseId'],
        'assigner_id': value['assignerId'],
        'completed_at': value['completedAt'] == null ? undefined : ((value['completedAt'] as any).toISOString()),
        'deadline': value['deadline'] == null ? undefined : ((value['deadline'] as any).toISOString().substring(0,10)),
        'is_active': value['isActive'],
    };
}


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
import type { TaskCompletionResponse } from './TaskCompletionResponse';
import {
    TaskCompletionResponseFromJSON,
    TaskCompletionResponseFromJSONTyped,
    TaskCompletionResponseToJSON,
    TaskCompletionResponseToJSONTyped,
} from './TaskCompletionResponse';

/**
 * 
 * @export
 * @interface EnrollmentResponseTasks
 */
export interface EnrollmentResponseTasks {
    /**
     * 
     * @type {number}
     * @memberof EnrollmentResponseTasks
     */
    studentId: number;
    /**
     * 
     * @type {number}
     * @memberof EnrollmentResponseTasks
     */
    courseId: number;
    /**
     * 
     * @type {number}
     * @memberof EnrollmentResponseTasks
     */
    assignerId: number;
    /**
     * 
     * @type {Date}
     * @memberof EnrollmentResponseTasks
     */
    completedAt?: Date | null;
    /**
     * 
     * @type {Date}
     * @memberof EnrollmentResponseTasks
     */
    enrolledAt?: Date;
    /**
     * 
     * @type {Date}
     * @memberof EnrollmentResponseTasks
     */
    deadline?: Date | null;
    /**
     * 
     * @type {boolean}
     * @memberof EnrollmentResponseTasks
     */
    isActive?: boolean;
    /**
     * 
     * @type {number}
     * @memberof EnrollmentResponseTasks
     */
    enrollmentId: number;
    /**
     * 
     * @type {Array<TaskCompletionResponse>}
     * @memberof EnrollmentResponseTasks
     */
    taskCompletions?: Array<TaskCompletionResponse>;
    /**
     * 
     * @type {number}
     * @memberof EnrollmentResponseTasks
     */
    completedTasks?: number;
    /**
     * 
     * @type {number}
     * @memberof EnrollmentResponseTasks
     */
    totalTasks?: number;
}

/**
 * Check if a given object implements the EnrollmentResponseTasks interface.
 */
export function instanceOfEnrollmentResponseTasks(value: object): value is EnrollmentResponseTasks {
    if (!('studentId' in value) || value['studentId'] === undefined) return false;
    if (!('courseId' in value) || value['courseId'] === undefined) return false;
    if (!('assignerId' in value) || value['assignerId'] === undefined) return false;
    if (!('enrollmentId' in value) || value['enrollmentId'] === undefined) return false;
    return true;
}

export function EnrollmentResponseTasksFromJSON(json: any): EnrollmentResponseTasks {
    return EnrollmentResponseTasksFromJSONTyped(json, false);
}

export function EnrollmentResponseTasksFromJSONTyped(json: any, ignoreDiscriminator: boolean): EnrollmentResponseTasks {
    if (json == null) {
        return json;
    }
    return {
        
        'studentId': json['student_id'],
        'courseId': json['course_id'],
        'assignerId': json['assigner_id'],
        'completedAt': json['completed_at'] == null ? undefined : (new Date(json['completed_at'])),
        'enrolledAt': json['enrolled_at'] == null ? undefined : (new Date(json['enrolled_at'])),
        'deadline': json['deadline'] == null ? undefined : (new Date(json['deadline'])),
        'isActive': json['is_active'] == null ? undefined : json['is_active'],
        'enrollmentId': json['enrollment_id'],
        'taskCompletions': json['task_completions'] == null ? undefined : ((json['task_completions'] as Array<any>).map(TaskCompletionResponseFromJSON)),
        'completedTasks': json['completed_tasks'] == null ? undefined : json['completed_tasks'],
        'totalTasks': json['total_tasks'] == null ? undefined : json['total_tasks'],
    };
}

export function EnrollmentResponseTasksToJSON(json: any): EnrollmentResponseTasks {
    return EnrollmentResponseTasksToJSONTyped(json, false);
}

export function EnrollmentResponseTasksToJSONTyped(value?: EnrollmentResponseTasks | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'student_id': value['studentId'],
        'course_id': value['courseId'],
        'assigner_id': value['assignerId'],
        'completed_at': value['completedAt'] == null ? undefined : ((value['completedAt'] as any).toISOString()),
        'enrolled_at': value['enrolledAt'] == null ? undefined : ((value['enrolledAt']).toISOString().substring(0,10)),
        'deadline': value['deadline'] == null ? undefined : ((value['deadline'] as any).toISOString().substring(0,10)),
        'is_active': value['isActive'],
        'enrollment_id': value['enrollmentId'],
        'task_completions': value['taskCompletions'] == null ? undefined : ((value['taskCompletions'] as Array<any>).map(TaskCompletionResponseToJSON)),
        'completed_tasks': value['completedTasks'],
        'total_tasks': value['totalTasks'],
    };
}


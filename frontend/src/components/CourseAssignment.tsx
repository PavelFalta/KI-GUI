import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCourses } from '../hooks/useCourses';
import { useStudents } from '../hooks/useStudents';
import { useEnrollments } from '../hooks/useEnrollments';
import { useAuth } from '../context/AuthContext';
import { CourseResponse, EnrollmentCreate } from '../api/models';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CourseAssignment: React.FC = () => {
  const location = useLocation();
  const { courses, loading: loadingCourses } = useCourses();
  const { students, loading: loadingStudents } = useStudents();
  const { 
    enrollments, 
    loading: loadingEnrollments, 
    error, 
    fetchEnrollments, 
    createEnrollment, 
    deleteEnrollment
  } = useEnrollments();
  const { user } = useAuth();
  
  // State for search and selection
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [showStudentResults, setShowStudentResults] = useState(false);
  const [showCourseResults, setShowCourseResults] = useState(false);
  
  // Refs for search inputs
  const studentSearchRef = useRef<HTMLInputElement>(null);
  const courseSearchRef = useRef<HTMLInputElement>(null);
  
  // Check for pre-selected student from navigation state
  useEffect(() => {
    try {
      if (location.state && 
          typeof location.state === 'object' && 
          'preSelectedStudentId' in location.state) {
        setSelectedStudent(location.state.preSelectedStudentId);
        const student = students.find(s => s.userId === location.state.preSelectedStudentId);
        if (student) {
          setStudentSearchQuery(`${student.firstName} ${student.lastName}`);
        }
      }
    } catch (error) {
      console.error("Error processing navigation state:", error);
    }
  }, [location.state, students]);
  
  // Fetch enrollments on component mount
  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);
  
  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) {
      return students.filter(student => student.isActive !== false && student.userId !== user?.userId);
    }
    
    const query = studentSearchQuery.toLowerCase().trim();
    return students.filter(student => {
      return (
        student.isActive !== false &&
        student.userId !== user?.userId &&
        (
          `${student.firstName} ${student.lastName}`.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          (student.username && student.username.toLowerCase().includes(query))
        )
      );
    });
  }, [students, studentSearchQuery, user]);

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    if (!courseSearchQuery.trim()) {
      return courses.filter(course => course.isActive !== false);
    }
    
    const query = courseSearchQuery.toLowerCase().trim();
    return courses.filter(course => {
      return (
        course.isActive !== false &&
        (
          course.title.toLowerCase().includes(query) ||
          (course.description && course.description.toLowerCase().includes(query))
        )
      );
    });
  }, [courses, courseSearchQuery]);

  // Handle enrollment creation
  const handleCreateEnrollment = async () => {
    if (!selectedCourse || !selectedStudent || !user) return;
    
    try {
      const enrollmentData: EnrollmentCreate = {
        courseId: selectedCourse,
        studentId: selectedStudent,
        assignerId: user.userId,
        isActive: true
      };
      
      await createEnrollment(enrollmentData);
      
      // Reset form
      setSelectedCourse(null);
      setSelectedStudent(null);
      setCourseSearchQuery('');
      setStudentSearchQuery('');
    } catch (err) {
      console.error('Error assigning course:', err);
    }
  };
  
  // Handle enrollment deletion
  const handleDeleteEnrollment = async (enrollmentId: number) => {
    if (window.confirm('Are you sure you want to remove this course assignment?')) {
      try {
        await deleteEnrollment(enrollmentId);
      } catch (err) {
        console.error('Error deleting enrollment:', err);
      }
    }
  };
  
  // Get course by ID
  const getCourseById = (courseId: number): CourseResponse | undefined => {
    return courses.find(course => course.courseId === courseId);
  };
  
  // Get student name by ID
  const getStudentNameById = (studentId: number): string => {
    const student = students.find(s => s.userId === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };
  
  const loading = loadingCourses || loadingStudents || loadingEnrollments;
  
  // Filter enrollments by current user as assigner and only active enrollments
  const assignedCourses = enrollments.filter(
    enrollment => enrollment.assignerId === user?.userId && enrollment.isActive !== false
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Course Assignment</h1>
      <p className="text-lg text-gray-700 mb-6">Assign courses to students</p>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Assignment Creation Form */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Create New Assignment</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Student Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
            <div className="relative">
              <input
                ref={studentSearchRef}
                type="text"
                value={studentSearchQuery}
                onChange={(e) => {
                  setStudentSearchQuery(e.target.value);
                  setShowStudentResults(true);
                }}
                onFocus={() => setShowStudentResults(true)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search for a student..."
              />
              {showStudentResults && studentSearchQuery && (
                <div className="absolute max-h-60 w-full mt-1 bg-white rounded-lg shadow-lg overflow-auto z-10">
                  {filteredStudents.map(student => (
                    <div
                      key={student.userId}
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${
                        selectedStudent === student.userId ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedStudent(student.userId);
                        setStudentSearchQuery(`${student.firstName} ${student.lastName}`);
                        setShowStudentResults(false);
                        courseSearchRef.current?.focus();
                      }}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                          <div className="text-sm text-gray-500">@{student.username}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Course Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
            <div className="relative">
              <input
                ref={courseSearchRef}
                type="text"
                value={courseSearchQuery}
                onChange={(e) => {
                  setCourseSearchQuery(e.target.value);
                  setShowCourseResults(true);
                }}
                onFocus={() => setShowCourseResults(true)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search for a course..."
              />
              {showCourseResults && courseSearchQuery && (
                <div className="absolute max-h-60 w-full mt-1 bg-white rounded-lg shadow-lg overflow-auto z-10">
                  {filteredCourses.map(course => (
                    <div
                      key={course.courseId}
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${
                        selectedCourse === course.courseId ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedCourse(course.courseId);
                        setCourseSearchQuery(course.title);
                        setShowCourseResults(false);
                      }}
                    >
                      <div className="font-medium text-gray-900">{course.title}</div>
                      {course.description && (
                        <div className="text-sm text-gray-500">{course.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              onClick={handleCreateEnrollment}
              disabled={!selectedStudent || !selectedCourse}
              className={`px-4 py-2 rounded-lg ${
                !selectedStudent || !selectedCourse
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Create Assignment
            </button>
          </div>
        </div>
      </div>

      {/* Existing Assignments */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Current Assignments</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {assignedCourses.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No assignments found. Create a new assignment to get started.
            </div>
          ) : (
            assignedCourses.map(enrollment => (
              <div key={enrollment.enrollmentId} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {getCourseById(enrollment.courseId)?.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Assigned to: {getStudentNameById(enrollment.studentId)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEnrollment(enrollment.enrollmentId)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseAssignment; 
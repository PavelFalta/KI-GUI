import React, { useState, useEffect, ChangeEvent } from 'react';
import { useCourses } from '../hooks/useCourses';
import { useStudents } from '../hooks/useStudents';
import { useEnrollments } from '../hooks/useEnrollments';
import { useAuth } from '../context/AuthContext';
import { CourseResponse, EnrollmentCreate } from '../api/models';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useLocation } from 'react-router-dom';

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
  
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  
  // Check for pre-selected student from navigation state
  useEffect(() => {
    try {
      if (location.state && 
          typeof location.state === 'object' && 
          'preSelectedStudentId' in location.state) {
        setSelectedStudent(location.state.preSelectedStudentId);
      }
    } catch (error) {
      console.error("Error processing navigation state:", error);
    }
  }, [location.state]);
  
  // Fetch enrollments on component mount
  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse || !selectedStudent || !user) {
      return;
    }
    
    try {
      const enrollmentData: EnrollmentCreate = {
        courseId: selectedCourse,
        studentId: selectedStudent,
        assignerId: user.userId,
        isActive: true // Always set to active
      };
      
      await createEnrollment(enrollmentData);
      
      // Reset form fields
      setSelectedCourse(null);
      setSelectedStudent(null);
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
  
  // Get active courses for dropdown
  const activeCourses = courses.filter(course => course.isActive !== false);
  
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
      <p className="text-lg text-gray-700 mb-8">Assign courses to students</p>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Assign Course to Student</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select 
                  value={selectedCourse || ''}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCourse(e.target.value ? parseInt(e.target.value) : null)}
                  className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a course</option>
                  {activeCourses.map(course => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select 
                  value={selectedStudent || ''}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedStudent(e.target.value ? parseInt(e.target.value) : null)}
                  className="py-2 px-3 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a student</option>
                  {students
                    .filter(student => student.userId !== user?.userId)
                    .map(student => (
                      <option key={student.userId} value={student.userId}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="py-2 px-4 bg-blue-600 border border-transparent rounded-lg text-white hover:bg-blue-700 transition-colors"
              >
                Assign Course
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Assigned Courses</h3>
      
      {assignedCourses.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <p className="text-gray-500 mb-2">No assigned courses found</p>
          <p className="text-sm text-gray-400">Assign a course to a student to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignedCourses.map(enrollment => (
                  <tr key={enrollment.enrollmentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCourseById(enrollment.courseId)?.title || 'Unknown Course'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getStudentNameById(enrollment.studentId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteEnrollment(enrollment.enrollmentId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseAssignment; 
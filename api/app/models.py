from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime, timezone


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String(50), nullable=False)
    description = Column(String(100))
    is_active = Column(Boolean, nullable=False)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, nullable=False)
    username = Column(String(50), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(120), nullable=False)
    password = Column(Text, nullable=False)
    contact_number = Column(String(15))
    created_at = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, nullable=False)

    role = relationship("Role", back_populates="users")
    created_courses = relationship(
        "Course", back_populates="creator", foreign_keys="Course.creator_id"
    )
    enrolled_courses = relationship("StudentCourse", back_populates="student")
    assigned_courses = relationship(
        "StudentCourse",
        back_populates="assigner",
        foreign_keys="StudentCourse.assigned_by",
    )
    task_completions = relationship("Completion", back_populates="student")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String(50), nullable=False)
    description = Column(String(100))
    is_active = Column(Boolean, nullable=False)

    courses = relationship("Course", back_populates="category")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, nullable=False)
    title = Column(String(50), nullable=False)
    description = Column(String(100))
    created_at = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, nullable=False)

    category = relationship("Category", back_populates="courses")
    creator = relationship(
        "User", back_populates="created_courses", foreign_keys=[creator_id]
    )
    tasks = relationship("Task", back_populates="course")
    enrolled_students = relationship("StudentCourse", back_populates="course")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, nullable=False)
    parent_id = Column(Integer, ForeignKey("tasks.id"))
    title = Column(String(50), nullable=False)
    description = Column(String(100))
    course_id = Column(Integer, ForeignKey("courses.id"))
    is_active = Column(Boolean, nullable=False)

    parent = relationship("Task", remote_side=[id], backref="subtasks")
    course = relationship("Course", back_populates="tasks")
    completions = relationship("Completion", back_populates="task")


class StudentCourse(Base):
    __tablename__ = "students_courses"

    id = Column(Integer, primary_key=True, nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    enrollment_date = Column(
        DateTime, nullable=False, default=datetime.now(timezone.utc)
    )
    feedback = Column(Text)
    deadline = Column(DateTime)
    is_active = Column(Boolean, nullable=False)

    student = relationship(
        "User", foreign_keys=[student_id], back_populates="enrolled_courses"
    )
    course = relationship("Course", back_populates="enrolled_students")
    assigner = relationship(
        "User", foreign_keys=[assigned_by], back_populates="assigned_courses"
    )


class Completion(Base):
    __tablename__ = "completions"

    id = Column(Integer, primary_key=True, nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    completed_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, nullable=False)

    task = relationship("Task", back_populates="completions")
    student = relationship("User", back_populates="task_completions")

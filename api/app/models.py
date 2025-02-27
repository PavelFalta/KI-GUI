from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class Status(Base):
    __tablename__ = "statuses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(100), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    tasks = relationship("Task", back_populates="status")


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(100), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)

    role = relationship("Role", back_populates="users")
    tasks_created = relationship("Task", back_populates="creator")
    assigned_tasks = relationship(
        "StudentTask", foreign_keys="StudentTask.student_id", back_populates="student"
    )
    assigned_by_tasks = relationship(
        "StudentTask", foreign_keys="StudentTask.assigned_by", back_populates="assigner"
    )


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(50), unique=True, nullable=False)
    description = Column(String(100), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    status_id = Column(Integer, ForeignKey("statuses.id"), nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    status = relationship("Status", back_populates="tasks")
    creator = relationship("User", back_populates="tasks_created")
    students = relationship("StudentTask", back_populates="task")


class CompletionStatus(Base):
    __tablename__ = "completion_statuses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(100), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    student_tasks = relationship("StudentTask", back_populates="completion_status")


class StudentTask(Base):
    __tablename__ = "students_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    enrollment_date = Column(DateTime, nullable=False, default=datetime.now)
    completion_status_id = Column(
        Integer, ForeignKey("completion_statuses.id"), nullable=False, default=1
    )
    completed_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    student = relationship(
        "User", foreign_keys=[student_id], back_populates="assigned_tasks"
    )
    task = relationship("Task", back_populates="students")
    assigner = relationship(
        "User", foreign_keys=[assigned_by], back_populates="assigned_by_tasks"
    )
    completion_status = relationship("CompletionStatus", back_populates="student_tasks")

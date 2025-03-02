from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class Status(Base):
    __tablename__ = "statuses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(100), nullable=True)

    tasks = relationship("Task", back_populates="status")
    student_tasks = relationship("StudentTask", back_populates="status")


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
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(Text, nullable=False)
    contact_number = Column(String(15), nullable=True)  # Unique?
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)

    role = relationship("Role", back_populates="users")
    tasks_created = relationship("Task", back_populates="creator")
    assigned_tasks = relationship(
        "StudentTask", foreign_keys="[StudentTask.student_id]", back_populates="student"
    )
    assigned_by_tasks = relationship(
        "StudentTask", foreign_keys="[StudentTask.assigned_by]", back_populates="assigner"
    )


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(50), unique=True, nullable=False)
    description = Column(String(100), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    status_id = Column(Integer, ForeignKey("statuses.id"), nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    status = relationship("Status", back_populates="tasks")
    creator = relationship("User", back_populates="tasks_created")
    student_tasks = relationship("StudentTask", back_populates="task")
    category = relationship("Category", back_populates="task")


class StudentTask(Base):
    __tablename__ = "students_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    status_id = Column(Integer, ForeignKey("statuses.id"), nullable=True)
    enrollment_date = Column(DateTime, nullable=False, default=datetime.now)
    completed_at = Column(DateTime, nullable=True)
    feedback = Column(Text, nullable=True)
    deadline = Column(DateTime, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    student = relationship("User", foreign_keys=[student_id], back_populates="assigned_tasks")
    task = relationship("Task", back_populates="student_tasks")
    assigner = relationship("User", foreign_keys=[assigned_by], back_populates="assigned_by_tasks")
    status = relationship("Status", back_populates="student_tasks")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(100), nullable=True)

    task = relationship("Task", back_populates="category")
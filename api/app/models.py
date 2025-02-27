from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from app.database import Base
from datetime import datetime


class Statuses(Base):
    __tablename__ = "statuses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(100), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    

class Roles(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(100), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)


class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    fk_role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)


class Tasks(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(50), unique=True, nullable=False)
    description = Column(String(100), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now())
    fk_status_id = Column(Integer, ForeignKey("statuses.id"), nullable=False)
    fk_creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)


class CompletionStatuses(Base):
    __tablename__ = "completion_statuses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(
        String(50), unique=True, nullable=False
    )  # "in_progress", "completed", "failed"
    description = Column(String(100), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)


class StudentTasks(Base):
    __tablename__ = "student_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tasks_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    enrollment_date = Column(DateTime, nullable=False, default=datetime.now)
    completion_status_id = Column(
        Integer, ForeignKey("completion_statuses.id"), nullable=False, default=1
    )
    completed_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)



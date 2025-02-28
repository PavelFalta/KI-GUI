# Databázové modely

## Status

| Název       | Typ        | Omezení                         |
|------------|-----------|---------------------------------|
| id         | Integer   | primární klíč, auto-increment  |
| name       | String(50) | unikátní, not null             |
| description | String(100) | nullable                     |

**Vztahy:**  

- `tasks` – relace k modelu **Task** (`back_populates="status"`)  
- `student_tasks` – relace k modelu **StudentTask** (`back_populates="status"`)  

---

## Role

| Název       | Typ        | Omezení                         |
|------------|-----------|---------------------------------|
| id         | Integer   | primární klíč, auto-increment  |
| name       | String(50) | unikátní, not null             |
| description | String(100) | nullable                     |
| is_active  | Boolean   | default=True, not null         |

**Vztahy:**  

- `users` – relace k modelu **User** (`back_populates="role"`)  

---

## User

| Název       | Typ        | Omezení                                      |
|------------|-----------|------------------------------------------------|
| id         | Integer   | primární klíč, auto-increment                 |
| username   | String(50) | unikátní, not null                            |
| email      | String(120) | unikátní, not null                           |
| password   | Text       | not null                                      |
| created_at | DateTime  | default=datetime.now, not null                |
| fk_role    | Integer   | ForeignKey("roles.id"), not null              |
| is_active  | Boolean   | default=True, not null                        |

**Vztahy:**  

- `role` – relace k **Role** (`back_populates="users"`)  
- `tasks_created` – relace k **Task** (`back_populates="creator"`)  
- `assigned_tasks` – relace k **StudentTask** (`back_populates="student"`)  
- `assigned_by_tasks` – relace k **StudentTask** (`back_populates="assigner"`)  

---

## Task

| Název       | Typ        | Omezení                                      |
|------------|-----------|------------------------------------------------|
| id         | Integer   | primární klíč, auto-increment                 |
| title      | String(50) | unikátní, not null                            |
| description | String(100) | nullable                                    |
| created_at | DateTime  | default=datetime.now, not null                |
| fk_status  | Integer   | ForeignKey("statuses.id"), not null           |
| fk_creator | Integer   | ForeignKey("users.id"), nullable              |
| is_active  | Boolean   | default=True, not null                        |

**Vztahy:**  

- `status` – relace k **Status** (`back_populates="tasks"`)  
- `creator` – relace k **User** (`back_populates="tasks_created"`)  
- `students` – relace k **StudentTask** (`back_populates="task"`)  

---

## StudentTask

| Název       | Typ        | Omezení                                      |
|------------|-----------|------------------------------------------------|
| id         | Integer   | primární klíč, auto-increment                 |
| fk_student | Integer   | ForeignKey("users.id"), not null              |
| fk_task    | Integer   | ForeignKey("tasks.id"), not null              |
| assigned_by | Integer  | ForeignKey("users.id"), not null              |
| enrollment_date | DateTime | default=datetime.now, not null            |
| completed_at | DateTime | nullable                                      |
| is_active  | Boolean   | default=True, not null                        |

**Vztahy:**  

- `student` – relace k **User** (`back_populates="assigned_tasks"`)  
- `task` – relace k **Task** (`back_populates="students"`)  
- `assigner` – relace k **User** (`back_populates="assigned_by_tasks"`)  
- `status` – relace k **Status** (`back_populates="student_tasks"`)  

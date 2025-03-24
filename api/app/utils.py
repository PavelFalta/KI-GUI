from fastapi import HTTPException


def validate_int(number: int) -> int:
    try:
        # SQLite integer limit for IDs (64-bit signed integer max)
        SQLITE_MAX_INT = 9223372036854775807
        
        # Convert to int to ensure it's a valid integer
        number_int = int(number)
        
        # For IDs: check if positive and within range
        if number_int <= 0:
            raise ValueError("ID must be a positive number")
        
        if number_int > SQLITE_MAX_INT:
            raise ValueError("ID exceeds maximum allowed value")
        
        return number_int
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid ID") from e

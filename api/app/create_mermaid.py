from app import models


def sqlalchemy_to_mermaid(metadata_obj, title="Database Schema"):
    """
    Convert SQLAlchemy metadata to Mermaid entity-relationship diagram.

    Args:
        metadata_obj: SQLAlchemy MetaData object with tables loaded
        title: Title for the diagram

    Returns:
        String containing Mermaid ER diagram code
    """
    # Initialize Mermaid code
    mermaid_code = ["erDiagram"]

    # Process each table
    for table_name, table in metadata_obj.tables.items():
        # Get primary keys
        pk_columns = [col.name for col in table.primary_key.columns]

        # Process columns
        columns = []
        for column in table.columns:
            # Format: name type [PK/FK]
            col_type = str(column.type)
            attributes = []

            if column.name in pk_columns:
                attributes.append("PK")

            if column.foreign_keys:
                attributes.append("FK")

            if not column.nullable:
                attributes.append("NOT NULL")

            attr_str = f" {{{', '.join(attributes)}}}" if attributes else ""
            columns.append(f"    {column.name} {col_type}{attr_str}")

        # Add table to diagram
        mermaid_code.append(f"{table_name} {{")
        mermaid_code.extend(columns)
        mermaid_code.append("}")

        # Process relationships
        for column in table.columns:
            for fk in column.foreign_keys:
                target_table = fk.column.table.name
                relationship = f"{table_name} |..|| {target_table} : references"
                mermaid_code.append(relationship)

    return "\n".join(mermaid_code)


mermaid = sqlalchemy_to_mermaid(models.Base.metadata)
print(mermaid)

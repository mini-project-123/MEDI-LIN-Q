# Generated migration to add appointment_date and appointment_time fields

from django.db import migrations, models


def migrate_datetime_to_date_time(apps, schema_editor):
    """Convert appointment_datetime to appointment_date and appointment_time"""
    # Use raw SQL for PostgreSQL
    with schema_editor.connection.cursor() as cursor:
        # Extract date from datetime
        cursor.execute("""
            UPDATE api_appointment 
            SET appointment_date = DATE("appointment_datetime")
            WHERE "appointment_datetime" IS NOT NULL
        """)
        # Extract time from datetime
        cursor.execute("""
            UPDATE api_appointment 
            SET appointment_time = "appointment_datetime"::time
            WHERE "appointment_datetime" IS NOT NULL
        """)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_hospital_created_at_hospital_id_and_more'),
    ]

    operations = [
        # Add the new fields first
        migrations.AddField(
            model_name='appointment',
            name='appointment_date',
            field=models.DateField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='appointment',
            name='appointment_time',
            field=models.TimeField(null=True, blank=True),
        ),
        
        # Migrate data from appointment_datetime
        migrations.RunPython(
            code=migrate_datetime_to_date_time,
            reverse_code=migrations.RunPython.noop,
        ),
    ]

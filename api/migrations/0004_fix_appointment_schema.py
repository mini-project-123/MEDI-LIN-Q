# Comprehensive migration to fix database schema

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_add_appointment_date_and_time'),
    ]

    operations = [
        # Ensure all missing fields exist on Appointment
        migrations.AddField(
            model_name='appointment',
            name='appointment_type',
            field=models.CharField(
                choices=[('consultation', 'Consultation'), ('follow_up', 'Follow-up'), ('procedure', 'Procedure')],
                default='consultation',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='appointment',
            name='token_number',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        # Ensure status field exists and has correct choices
        migrations.AlterField(
            model_name='appointment',
            name='status',
            field=models.CharField(
                choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('completed', 'Completed'), ('cancelled', 'Cancelled')],
                default='pending',
                max_length=10
            ),
        ),
    ]

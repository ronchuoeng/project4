# Generated by Django 4.1.2 on 2022-12-22 05:56

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0003_comment'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='likelist',
            field=models.ManyToManyField(blank=True, null=True, related_name='likers', to=settings.AUTH_USER_MODEL),
        ),
        migrations.DeleteModel(
            name='Comment',
        ),
    ]
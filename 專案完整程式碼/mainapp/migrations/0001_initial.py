# Generated by Django 2.1.2 on 2019-09-11 06:51

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Post1',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('componentNo', models.CharField(max_length=200)),
                ('componentName', models.CharField(max_length=200)),
            ],
        ),
    ]

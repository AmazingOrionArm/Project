# Generated by Django 2.1.2 on 2019-09-11 07:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainapp', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Component',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('componentNo', models.CharField(max_length=200)),
                ('componentName', models.CharField(max_length=200)),
                ('Quantity', models.IntegerField(default=0)),
            ],
        ),
        migrations.DeleteModel(
            name='Post1',
        ),
    ]

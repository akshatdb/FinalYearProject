# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-01-10 15:40
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Feedback',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('u_name', models.CharField(max_length=50)),
                ('u_email', models.CharField(max_length=80)),
                ('u_body', models.CharField(max_length=400)),
                ('sub_date', models.DateTimeField(verbose_name='date published')),
            ],
        ),
        migrations.CreateModel(
            name='Images',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('im_name', models.CharField(max_length=50)),
                ('im_path', models.CharField(max_length=200)),
                ('sub_date', models.DateTimeField(verbose_name='date published')),
            ],
        ),
    ]

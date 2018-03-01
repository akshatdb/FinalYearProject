# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

from django.utils import timezone

class Image(models.Model):
    image = models.ImageField("Uploaded Image")
    title = models.CharField(max_length=50, default=timezone.now())
    req_type = models.CharField(max_length=1)
    sub_date = models.DateTimeField(auto_now_add=True)
    def __str__(self):
   		return self.title


class Feedback(models.Model):
    u_name = models.CharField(max_length=50)
    u_email = models.EmailField()
    u_body = models.TextField()
    sub_date = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.u_name



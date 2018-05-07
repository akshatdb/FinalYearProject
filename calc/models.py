# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

from django.utils import timezone

def image_upload_path(instance, filename):
    return settings.MEDIA_ROOT + '/images/'
def charimage_upload_path(instance, filename):
    return settings.MEDIA_ROOT + '/chars/'
class Image(models.Model):
    image = models.ImageField("Uploaded Image",upload_to=image_upload_path)
    title = models.CharField(max_length=50, default=timezone.now())
    req_type = models.CharField(max_length=1)
    sub_date = models.DateTimeField(auto_now_add=True)
    def __str__(self):
   		return self.title

class Charimage(models.Model):
    charimage = models.ImageField("Uploaded Image",upload_to=charimage_upload_path)
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



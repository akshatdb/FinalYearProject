# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from .models import Feedback, Image

from django.contrib import admin

# Register your models here.
admin.site.site_header = 'MathOCR'
admin.site.site_title = "MathOCR"
admin.site.index_title = "Admininstration Home"
admin.site.register(Image)
admin.site.register(Feedback)

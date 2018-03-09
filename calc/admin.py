# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from .models import Feedback, Image

from django.contrib import admin


class ImageAdmin(admin.ModelAdmin):
	fields = ('image', )
	readonly_fields = ('image', )

# Register your models here.
admin.site.site_header = 'MathOCR'
admin.site.site_title = "MathOCR"
admin.site.index_title = "Admininstration Home"
admin.site.register(Image, ImageAdmin)
admin.site.register(Feedback)

from __future__ import unicode_literals

from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.urls import reverse
from django.views import generic
from django.utils import timezone
from django.contrib import messages
import json
import re
import base64
from rest_framework.decorators import api_view,authentication_classes,permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from convnet.basiccal import find_basic
from convnet.lineareq import find_linear, learn_model
from convnet.apilineareq import api_find_linear, api_learn_model, char_test
from convnet.ocr import check_img, learn_img
from .models import Feedback, Image
from .forms import ImageForm, FeedbackForm

def index(request):
    form = FeedbackForm()
    if request.META['HTTP_USER_AGENT'].find('Android')==-1 and request.META['HTTP_USER_AGENT'].find('iPhone')==-1:
        return render(request, 'calc/uploadview.html', {'form': form})
    else:
        return render(request, 'calc/camview.html', {'form': form})

def campage(request):
    form = FeedbackForm()
    return render(request, 'calc/camview.html', {'form' : form})
def uppage(request):
    form = FeedbackForm()
    return render(request, 'calc/uploadview.html', {'form' : form})
def skpage(request):
    form = FeedbackForm()
    return render(request, 'calc/sketchview.html', {'form' : form})
def feedback(request):
	if request.method == 'POST':
		sdate = timezone.now()
		form = FeedbackForm(request.POST)
		if form.is_valid():
			form.save()
			messages.success(request,'Feedback submitted')
		else:
			messages.error(request,'Something went wrong')
	return HttpResponseRedirect(reverse('calc:index'))

def result(request):
    return render(request, 'calc/result.html')

def process(request):
    if request.method == 'POST':
        form = ImageForm(request.POST, request.FILES)
        process_type =int(request.POST.get('req_type',''))
        if form.is_valid():
        	data = form.save()
        	if process_type == 0:
        		msg = find_linear(str(data.image)) 
        	elif process_type == 1:
        		msg = check_img(str(data.image))
        	else:
        		msg = find_basic(str(data.image))
    return JsonResponse(msg)

#REST API 
@api_view(['POST'])
@authentication_classes((TokenAuthentication, ))
@permission_classes((AllowAny, ))
def processapi(request):
    if request.method == 'POST':
        form = ImageForm(request.POST, request.FILES)
        process_type =int(request.POST.get('req_type',''))
        if form.is_valid():
            data = form.save()
            if process_type == 0:
                msg = api_find_linear(str(data.image)) 
            elif process_type == 1:
                msg = api_find_linear(str(data.image))
            else:
                msg = process_type
    return JsonResponse(msg)
@api_view(['POST'])
@authentication_classes((TokenAuthentication, ))
@permission_classes((AllowAny, ))
def charapi(request):
    if request.method == 'POST':
        form = CharImageForm(request.POST, request.FILES)
        process_type =int(request.POST.get('req_type',''))
        if form.is_valid():
            data = form.save()
            msg = char_test(str(data.image)) 
    return JsonResponse({'ans':msg})
def learn(request):
    data = json.loads(request.body)
    lenc = data['length']
    process_type =data['req_type']
    for i in range(lenc):
        x = data[str(i)]['x']
        y = data[str(i)]['y']
        w = data[str(i)]['w']
        h = data[str(i)]['h']
        imgurl = data[str(i)]['iname']
        val = data[str(i)]['val']
        if process_type == 0:
            learn_model(imgurl,float(x),float(y),float(w),float(h),val)
        elif process_type == 1:
            msg = learn_img(imgurl,float(x),float(y),float(w),float(h),val)
    return HttpResponse('ok');

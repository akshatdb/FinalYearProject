from __future__ import unicode_literals

from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.urls import reverse
from django.views import generic
from django.utils import timezone
from django.contrib import messages
import json

from .basiccal import findbasic
from .lineareq import findlinear, learn_model
from .models import Feedback, Image
from .forms import ImageForm, FeedbackForm

def index(request):
	form = FeedbackForm()
	return render(request, 'calc/index.html', {'form': form})


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
        		msg = findlinear(str(data.image)) 
        	elif process_type == 1:
        		msg = findlinear(str(data.image))
        	else:
        		msg = process_type
    return JsonResponse(msg)

def learn(request):
    data = json.loads(request.body)
    lenc = data['length']
    for i in range(lenc):
        x = data[str(i)]['x']
        y = data[str(i)]['y']
        w = data[str(i)]['w']
        h = data[str(i)]['h']
        imgurl = data[str(i)]['iname']
        val = data[str(i)]['val']
        msg = learn_model(imgurl,float(x),float(y),float(w),float(h),val)
    return HttpResponse('ok');

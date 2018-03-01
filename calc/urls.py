from django.conf.urls import url

from . import views

app_name = 'calc'
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^feedback/$', views.feedback	, name='feedback'),
    url(r'^process/$', views.process	, name='process'),
    url(r'^processapi/$', views.processapi	, name='processapi'),
    url(r'^learn/$', views.learn	, name='learn'),
    url(r'^result/$', views.result	, name='result'),
]

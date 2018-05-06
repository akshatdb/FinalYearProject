from django.conf.urls import url

from . import views
from django.conf import settings
from django.conf.urls.static import static

app_name = 'calc'
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^campage/$', views.campage	, name='campage'),
    url(r'^uppage/$', views.uppage	, name='uppage'),
    url(r'^skpage/$', views.skpage	, name='skpage'),
    url(r'^feedback/$', views.feedback	, name='feedback'),
    url(r'^process/$', views.process	, name='process'),
    url(r'^processapi/$', views.processapi	, name='processapi'),
    url(r'^learn/$', views.learn	, name='learn'),
    url(r'^result/$', views.result	, name='result'),
] 
urlpatterns +=  static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Component)  
admin.site.register(InvRecord)
admin.site.register(Schedule)
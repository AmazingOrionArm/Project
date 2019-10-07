from django.db import models
from datetime import datetime  

# Create your models here.


class Component(models.Model):
	"""docstring for Post1"""
	componentNo=models.CharField(max_length=4)
	componentName=models.CharField(max_length=200)
	quantity=models.IntegerField(default=0)
	
	
	def __str__(self):
		return self.componentNo
	

class InvRecord(models.Model):
	recordDate=models.CharField(max_length=200)
	recordComponentNo=models.CharField(max_length=4, default="000")
	recordChange=models.IntegerField(default=0)


class Schedule(models.Model):
	startTime = models.CharField(max_length=100)
	finishTime = models.CharField(max_length=100)
	station = models.CharField(max_length=10)
	job = models.CharField(max_length=10)
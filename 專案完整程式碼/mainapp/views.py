
from django.shortcuts import render
from .models import *
import os
from datetime import datetime  
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import threading
from socket import *
import time
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import jobshopscheduling as jss
import json
import statistics
import random
import math
# Create your views here.
# Pi與MES連線已進行資料交換
def connection():
	host = ''
	port = 11000
	ADDR = (host, port)
	BUFSIZ = 1024

	tcpSocket = socket(AF_INET, SOCK_STREAM)
	tcpSocket.bind(ADDR)
	#set the max number of tcp connection
	tcpSocket.listen(5)
	while True:
		print('waiting for connection...')
		clientSocket, clientAddr = tcpSocket.accept()
		print('conneted form: %s' %clientAddr[0])
		
		while True:
			try:
				global status
				predata = clientSocket.recv(BUFSIZ).decode('utf-8')
				if(predata==''):
					errortext = 'Empty Command'
					clientSocket.send(errortext.encode('utf-8'))
					break
                    
				data = predata.split(',')
                								
			except IOError as e:
				print(e)
				clientSocket.close()
				break
			if not predata:
				break
			returnData = data[0] + ', I received your data'
			clientSocket.send(returnData.encode('utf-8'))
			
			#---work---
			if(data[0] == "station"):
				for i in range(1, len(data)):
					if(data[i] == "0"):
						stationStatusList[i-1] = "Idle"
					elif(data[i] == "1"):
						stationStatusList[i-1] = "Working"
					elif(data[i] == "-1"):
						stationStatusList[i-1] = "-"
					else:
						stationStatusList[i-1] = "Error"
			elif(data[0] == "quality"):
				sampleMean = statistics.mean(list(map(float, data[1:])))
				sampleRange = abs(max(list(map(float, data[1:]))) - min(list(map(float, data[1:]))))
				global sampleMeanList, sampleRangeList
				sampleMeanList.append(sampleMean)
				sampleRangeList.append(sampleRange)

				if(len(sampleMeanList) > 25):		
					#管制圖資訊計算			
					X_doubleBar = statistics.mean(sampleMeanList)
					R_bar = statistics.mean(sampleRangeList)

					global spcXUCL, spcXCL, spcXLCL, spcRUCL, spcRCL, spcRLCL
					spcXUCL = X_doubleBar + 0.729 * R_bar
					spcXCL = X_doubleBar
					spcXLCL = X_doubleBar - 0.729 * R_bar

					spcRUCL = 2.282 * R_bar
					spcRCL = R_bar
					spcRLCL = 0 * R_bar		

					global spcChartStatus
					spcChartStatus = True

					#製程能力指標計算
					spcCa = (X_doubleBar - 100) / ((105 - 95) / 2 )
					spcCp = (105 - 95) / (6 * statistics.stdev(sampleRangeList))
					spcCpk = (1 - abs(spcCa)) * Cp

					sampleMeanList = []
					sampleRangeList = []
			#---
			print(sampleMeanList)
		clientSocket.close()
	tcpSocket.close()
#---

#---List---
stationStatusList = ["-", "-", "-", "-"]
sampleMeanList = []
sampleRangeList = []
spcChartStatus = False
spcXUCL = 0
spcXCL = 0
spcXLCL = 0
spcRUCL = 0
spcRCL = 0
spcRLCL = 0
#---
#---Initial Program---
t = threading.Thread(target=connection)
t.start()

#---

status='-'
def ViewBase(request):
    return render(request, 'base.html')


def ViewSchedule(request):
    return render(request, 'Schedule.html')


#---生產監控---
def ViewMonitor(request):  
	return render(request, 'Monitor.html')
#---


def ViewQuality(request):
	return render(request, 'Quality.html')


def ViewEquipment(request):
    return render(request, 'Equipment.html')


def ViewInventory(request):
	return render(request,'Inventory.html')


@csrf_exempt
def ajaxStationStatus(request): #提供機台狀況查詢服務
    returnData = {
        "1":{
            "status":stationStatusList[0],
        },
        "2":{
            "status":stationStatusList[1],
        },
        "3":{
            "status":stationStatusList[2],
        },
        "4":{
            "status":stationStatusList[3],
        },
    }
    return JsonResponse(returnData)


@csrf_exempt
def ajaxInventoryList(request):
	Inventory_List=Component.objects.all().order_by("componentNo")
	returnData = {
		"001":{
			"componentNo":"",
			"componentName":"",
			"componentQuantity":"",
		},
		"002":{
			"componentNo":"",
			"componentName":"",
			"componentQuantity":"",
		},
		"003":{
			"componentNo":"",
			"componentName":"",
			"componentQuantity":"",
		},
		"004":{
			"componentNo":"",
			"componentName":"",
			"componentQuantity":"",
		},
	}
	j = 0
	for i in Inventory_List:
		j+=1
		returnData["00" + str(j)]["componentNo"] = i.componentNo
		returnData["00" + str(j)]["componentName"] = i.componentName
		returnData["00" + str(j)]["componentQuantity"] = i.quantity
	
	return JsonResponse(returnData)


@csrf_exempt
def ajaxInventoryRec(request):
	Inventory_Rec=InvRecord.objects.all().order_by("recordDate")

	returnData = {}
	index = 0
	for i in Inventory_Rec:
		
		if(index == 0):
			returnData.update({
				i.recordDate:{
					str(i.recordComponentNo):i.recordChange
				}
			})
			#print("0")
		else:
			returnData[i.recordDate].update({
				str(i.recordComponentNo):i.recordChange
			})
			#print("1")

		#Component.objects.count()
		
		if((index % 3 == 0) and index != 0):
			index=0
		else:
			index+=1
	return JsonResponse(returnData)



def get_query(self):
	return self.Component.objects.all()


def ViewStatistics(request):
    return render(request, 'Statistics.html')


#全時運作
tempList = [50, 50, 50, 50]
def startInventoryStarter(request):
	InvRecord.objects.all().delete()

	startInvThread = threading.Timer(2, startInventory)
	startInvThread.start()

	return JsonResponse({"status":"ok"})

inventoryMsg = {}
inventoryMsgIndex = 0
tempTime = [0, 0, 0, 0]
def startInventory():
	global inventoryMsg, inventoryMsgIndex, tempTime
	Inventory_List=Component.objects.all().order_by("componentNo")

	ss = 1.65 * pow(3, 0.5) * 2
	Q = pow((2 * 30 * 2550) / (100 * 0.25), 0.5)

	for i in range(4):
		if(tempList[i] <= ss + 3 * 10):
			if(tempTime[i] == 0):
				inventoryMsg.update({
					str(inventoryMsgIndex):"物料 " + str(Inventory_List[i].componentNo) + " 已達訂購點，已通知補貨",
				})
				inventoryMsgIndex += 1
			tempTime[i] += 1
			if(tempTime[i] == 3):				
				tempList[i] += Q
				tempTime[i] = 0
			else:
				tempList[i] -= round(random.normalvariate(10, 2))
		else:
			tempList[i] -= round(random.normalvariate(10, 2))

	currentTime = time.strftime("%Y-%m-%d %H:%M:%S",time.localtime())
	
	j = 0
	for i in Inventory_List:
		InvRecord.objects.create(recordDate = currentTime, recordComponentNo = i.componentNo, recordChange = tempList[j])
		Component.objects.filter(componentNo = i.componentNo).update(quantity = tempList[j])
		j+=1

	startInvThread = threading.Timer(2, startInventory)
	startInvThread.start()

@csrf_exempt
def ajaxInventoryMsg(requset):
	global inventoryMsg
	print(inventoryMsg)
	return JsonResponse(inventoryMsg, safe=False)

#排程
mainScheduler = jss.Scheduler()
def Scheduling(request):
	mainScheduler["processTimeTable"] = "ProcessingTime.csv"
	mainScheduler["machinesSequenceTable"] = "MachinesSequence.csv"
	mainScheduler.Run()

	predata = mainScheduler.OutputSchedule()

	Schedule.objects.all().delete()
	print(len(predata))
	for i in range(len(predata)):
		Schedule.objects.create(startTime = predata[i]["Start"], finishTime = predata[i]["Finish"], station = predata[i]["Task"], job = predata[i]["Resource"])
	
	return JsonResponse({"Schedule":"ok"})
	

@csrf_exempt
def ajaxStationSchedule(request):
	predata = Schedule.objects.all().order_by("startTime")

	returnData = {}
	j = 0
	for i in predata:
		returnData.update({
			str(j):{
				"start":i.startTime,
				"finish":i.finishTime,
				"station":i.station,
				"job":i.job,
			},
		})

		j+=1

	return JsonResponse(returnData, safe = False)

@csrf_exempt
def ajaxStationScheduleChart(request):	

	return JsonResponse({"div":mainScheduler.GenerateGanttChart()}, safe=False)

@csrf_exempt
def ajaxSPCData(request):	
	'''
	if(spcChartStatus == False):
		return JsonResponse({"status":"no enough data"})
	else:
		global spcXUCL, spcXCL, spcXLCL, spcRUCL, spcRCL, spcRLCL
		global sampleMeanList, sampleRangeList
		returnData = {
			"UCL_X": spcXUCL,
			"CL_X": spcXCL,
			"LCL_X": spcXLCL,
			"UCL_R": spcRUCL,
			"CL_R": spcRCL,
			"LCL_R": spcRLCL,
			"x":sampleMeanList,
			"r":sampleRangeList,
		}

		return JsonResponse(returnData)
	'''
	xx = [9.95,10.06,9.98,9.96,10.01,9.89,9.99,10,10.1,9.98,9.99,10.12,10,10.1,10.03,9.95,9.98,9.85,10.01,10.02,9.89,9.95,10.01,10,9.95,9.93]
	yy = [0.16,0.33,0.26,0.25,0.26,0.29,0.31,0.29,0.18,0.19,0.17,0.26,0.21,0.22,0.3,0.21,0.26,0.24,0.23,0.22,0.21,0.18,0.23,0.2,0.25,0.29]
	X_doubleBar = statistics.mean(xx)
	R_bar = statistics.mean(yy)
	
	returnData = {
		"UCL_X": X_doubleBar + 0.729 * R_bar,
		"CL_X": X_doubleBar,
		"LCL_X": X_doubleBar - 0.729 * R_bar,
		"UCL_R": 2.282 * R_bar,
		"CL_R": R_bar,
		"LCL_R": 0 * R_bar,
		"x":xx,
		"r":yy,
		#製程能力指標計算
		"spcCa": (X_doubleBar - 10) / ((10.25 - 9.75) / 2 ),
		"spcCp": (10.25 - 9.75) / (6 * statistics.stdev(xx)),
		"spcCpk": (1 - abs((X_doubleBar - 10) / ((10.25 - 9.75) / 2 ))) * (10.25 - 9.75) / (6 * statistics.stdev(xx)),
	}

	return JsonResponse(returnData)
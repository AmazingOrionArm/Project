$(document).ready(function()
{
  
    setInterval("startRequestInventroyList()",2000);
    setInterval("startRequestInventoryRec()",2000);
    setInterval("startRequestInventoryMsg", 2000);
    setInterval("startRequestStationStatus()",2000);
    setInterval("queryStationSchedule()",5000);
    //setInterval("querySPCData()",5000);
    
    $("#getChartBtn").click(function(){
        queryStationScheduleChart();
    });
    $("#apple").click(function(){
        querySPCData();
    });
});

var stationStatusTimePlotIndex = 0;
var stationStatusTimePlotAxis = [];
var stationStatusTimePlotData = {};
var initial = true;
function startRequestStationStatus(){
    $.ajax({
        data: "", // get the form data
        type: "POST", // GET or POST
        url: "queryStationStatus", // the file to call
        success: function(data){
            stationStatusTimePlotIndex += 1;
            stationStatusTimePlotAxis.push(stationStatusTimePlotIndex);

            if(initial)
            {
                for(var i=1; i<= Object.keys(data).length; i++)
                {
                    stationStatusTimePlotData[i] = [];
                }                
            }
            initial = false;
            for(var i=1; i<= Object.keys(data).length; i++)
            {
                //$("#stationStatus" + i).text(data[i]["status"]);
                /*
                if(data[i]["status"] == "Working")
                {
                    stationStatusTimePlotData[i].push(1);
                }
                else
                {
                    stationStatusTimePlotData[i].push(0);
                }                
                */
                if(Math.random() >= 0.5)
                {
                    stationStatusTimePlotData[i].push(1);
                    $("#stationStatus" + i).text("Working");
                }
                else
                {
                    stationStatusTimePlotData[i].push(0);
                    $("#stationStatus" + i).text("Idle");
                }
            }
            
            for(var i=1; i<= Object.keys(data).length; i++)
            {
                numOfWorking = stationStatusTimePlotData[i].filter(function(x){return x == 1}).length;
                numOfNotWorking = stationStatusTimePlotData[i].filter(function(x){return x == 0}).length;
                $("#stationUtilization" + i).text(((numOfWorking / (numOfWorking + numOfNotWorking)).toFixed(2) * 100).toString() + "%");
            }
            
            $("#station1TimePlot").empty();
            console.log(stationStatusTimePlotData[1]);
            var trace1 = {
                x: stationStatusTimePlotAxis,
                y: stationStatusTimePlotData[1],
                type: "scatter",
            }
            var trace2 = {
                x: stationStatusTimePlotAxis,
                y: stationStatusTimePlotData[2],
                type: "scatter",
            }
            var trace3 = {
                x: stationStatusTimePlotAxis,
                y: stationStatusTimePlotData[3],
                type: "scatter",
            }
            var trace4 = {
                x: stationStatusTimePlotAxis,
                y: stationStatusTimePlotData[4],
                type: "scatter",
            }

            var layout = {
                height: 250,
                width: 600,
                yaxis: {
                    range: [-0.1, 1.1]
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
            }
            var plotData1 = [trace1];
            var plotData2 = [trace2];
            var plotData3 = [trace3];
            var plotData4 = [trace4];
            Plotly.newPlot('station1TimePlot', plotData1, layout, {displayModeBar: false});
            Plotly.newPlot('station2TimePlot', plotData2, layout, {displayModeBar: false});
            Plotly.newPlot('station3TimePlot', plotData3, layout, {displayModeBar: false});
            Plotly.newPlot('station4TimePlot', plotData4, layout, {displayModeBar: false});
        },
        error: function(){

        },
    })
    return false;
};

function startRequestInventroyList(){
    $.ajax({
        data: "", // get the form data
        type: "POST", // GET or POST
        url: "queryInventoryList", // the file to call
        success: function(data){
            for(var i=1; i<= Object.keys(data).length; i++)
            {
                $("#invListNo" + i).text(data["00" + i]["componentNo"]);
                $("#invListName" + i).text(data["00" + i]["componentName"]);
                $("#invListQuantity" + i).text(data["00" + i]["componentQuantity"]);
            }
        },
        error: function(){

        },
    })
    return false;
};

function startRequestInventoryMsg()
{
    $.ajax({
        data: "", // get the form data
        type: "POST", // GET or POST
        url: "queryInventoryMsg", // the file to call
        success: function(data){
            for(var i=0; i<= Object.keys(data).length; i++)
            {
                $("#inventoryMassageBox").text("apple");
                console.log("apple");
            }
        },
        error: function(){

        },
    })
    return false;
}

timeSeq=[];// x-axis
compoent1=[];// y-axis1
compoent2=[];// y-axis2
compoent3=[];// y-axis3
compoent4=[];// y-axis4
function startRequestInventoryRec(){
    $.ajax({
        data: "", // get the form data
        type: "POST", // GET or POST
        url: "queryInventoryRec", // the file to call
        success: function(returnList)
        {            
            $("#invTimeChart1").empty();
            $("#invTimeChart2").empty();
            $("#invTimeChart3").empty();
            $("#invTimeChart4").empty();
            //要清除
            timeSeq = [];
            compoent1 = [];
            compoent2 = [];
            compoent3 = [];
            compoent4 = [];
            ref1 = [];
            ref2 = [];
            ref3 = [];
            ref4 = [];

            jQuery.each(returnList, function(i, componentList)
            {
                timeSeq.push(i);
                jQuery.each(componentList, function(j, quantity)
                {
                    if(j == "001")
                    {
                        compoent1.push(quantity);
                        ref1.push(Math.ceil(1.65 * Math.sqrt(3) * 2));
                    }
                    else if(j == "002")
                    {
                        compoent2.push(quantity);
                        ref2.push(Math.ceil(1.65 * Math.sqrt(3) * 2));
                    }
                    else if(j == "003")
                    {
                        compoent3.push(quantity);
                        ref3.push(Math.ceil(1.65 * Math.sqrt(3) * 2));
                    }
                    else if(j == "004")
                    {
                        compoent4.push(quantity);
                        ref4.push(Math.ceil(1.65 * Math.sqrt(3) * 2));
                    }
                });
            });

            //套件內容
            var options1 = {
                chart: {
                    animations: {
                        enabled: false,
                        animateGradually: {
                            enabled: false,
                            delay: 0
                        },
                        dynamicAnimation: {
                            enabled: false,
                        },
                    },
                    height: $(window).height()*0.21,
                    width: $(window).width()*0.4,
                    type: 'line',
                    zoom: {
                        enabled: false
                    },
                    toolbar: {
                        show: false
                    },
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'straight',
					width: 2,
                },
                series: [{
                    name: "目前庫存",
                    data: compoent1,
                },{
                    name: "安全庫存",
                    data: ref1,
                }],
                grid: {
                    row: {
                        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                        opacity: 0.5
                    },
                },
                xaxis: {
                    categories: timeSeq,
                    floating: false,
                    labels: {
                        show: false,
                    },
                }
            }
            var options2 = {
                chart: {
                    animations: {
                        enabled: false,
                        animateGradually: {
                            enabled: false,
                            delay: 0
                        },
                        dynamicAnimation: {
                            enabled: false,
                        },
                    },
                    height: $(window).height()*0.21,
                    width: $(window).width()*0.4,
                    type: 'line',
                    zoom: {
                        enabled: false
                    },
                    toolbar: {
                        show: false
                    },
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'straight',
					width: 2,
                },
                series: [{
                    name: "目前庫存",
                    data: compoent2,
                },{
                    name: "安全庫存",
                    data: ref2,
                }],
                grid: {
                    row: {
                        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                        opacity: 0.5
                    },
                },
                xaxis: {
                    categories: timeSeq,
                    floating: false,
                    labels: {
                        show: false,
                    },
                }
            }
            var options3 = {
                chart: {
                    animations: {
                        enabled: false,
                        animateGradually: {
                            enabled: false,
                            delay: 0
                        },
                        dynamicAnimation: {
                            enabled: false,
                        },
                    },
                    height: $(window).height()*0.21,
                    width: $(window).width()*0.4,
                    type: 'line',
                    zoom: {
                        enabled: false
                    },
                    toolbar: {
                        show: false
                    },
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'straight',
					width: 2,
                },
                series: [{
                    name: "目前庫存",
                    data: compoent3,
                },{
                    name: "安全庫存",
                    data: ref3,
                }],
                grid: {
                    row: {
                        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                        opacity: 0.5
                    },
                },
                xaxis: {
                    categories: timeSeq,
                    floating: false,
                    labels: {
                        show: false,
                    },
                }
            }
            var options4 = {
                chart: {
                    animations: {
                        enabled: false,
                        animateGradually: {
                            enabled: false,
                            delay: 0
                        },
                        dynamicAnimation: {
                            enabled: false,
                        },
                    },
                    height: $(window).height()*0.21,
                    width: $(window).width()*0.4,
                    type: 'line',
                    zoom: {
                        enabled: false
                    },
                    toolbar: {
                        show: false
                    },
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'straight',
					width: 2,
                },
                series: [{
                    name: "目前庫存",
                    data: compoent4,
                },{
                    name: "安全庫存",
                    data: ref4,
                }],
                grid: {
                    row: {
                        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                        opacity: 0.5
                    },
                },
                xaxis: {
                    categories: timeSeq,
                    floating: false,
                    labels: {
                        show: false,
                    },
                }
            }
          
            var chart1 = new ApexCharts(
                document.querySelector("#invTimeChart1"),
                options1
            );
            var chart2 = new ApexCharts(
                document.querySelector("#invTimeChart2"),
                options2
            );
            var chart3 = new ApexCharts(
                document.querySelector("#invTimeChart3"),
                options3
            );
            var chart4 = new ApexCharts(
                document.querySelector("#invTimeChart4"),
                options4
            );
          
            chart1.render();
            chart2.render();
            chart3.render();
            chart4.render();
        },
        error: function(){

        },
    })
    return false;
};


function queryStationSchedule(){
    $.ajax({
        data: "", // get the form data
        type: "POST", // GET or POST
        url: "queryStationSchedule", // the file to call
        success: function(data){
            $(".stationScheduleTable").empty();
            for(var i = 0; i <= Object.keys(data).length; i++)
            {
                $("#stationScheduleTable" + data[i]["station"].slice(-1)).append(
                    "<tr><td>" + data[i]["start"] + "</td><td>" + data[i]["finish"] + "</td><td>" + data[i]["job"] + "</td><tr>"
                );
            }
        },
        error: function(){
            console.log("==");
        },
    })
    return false;
};


function queryStationScheduleChart(){
    $.ajax({
        data: "", // get the form data
        type: "POST", // GET or POST
        url: "getStationScheduleChart", // the file to call
        success: function(data){
            $("#schedulePlotDiv").append(data["div"]);
        },
        error: function(){
            console.log("==");
        },
    })
    return false;
};


function querySPCData()
{
    $.ajax({
        data: "", // get the form data
        type: "POST", // GET or POST
        url: "querySPCData", // the file to call
        success: function(returnData){
            $("#Xbar_div").empty();
            var xa = []
            for(var i = 0; i <= Object.keys(returnData["x"]).length; i++)
            {
                xa.push(i + 1);
            }

            var DataX = {
                type: 'scatter',
                x: xa,
                y: returnData["x"],
                mode: 'lines+markers',
                name: 'Data',
                showlegend: true,
                hoverinfo: 'all',
                line: {
                  color: 'blue',
                  width: 2
                },
                marker: {
                  color: 'blue',
                  size: 8,
                  symbol: 'circle'
                }
              }
              
              var UCLXdata = new Array(25)
              UCLXdata.fill(returnData["UCL_X"])
              var UCL = {
                type: 'scatter',
                x: xa,
                y: UCLXdata,
                mode: 'lines',
                name: 'UCL',
                showlegend: true,
                line: {
                  color: 'red',
                  width: 2,
                  dash: 'dash'
                }
              }              
              var CLXdata = new Array(25)
              CLXdata.fill(returnData["CL_X"])
              var Centre = {
                type: 'scatter',
                x: xa,
                y: CLXdata,
                mode: 'lines',
                name: 'Centre',
                showlegend: true,
                line: {
                  color: 'grey',
                  width: 2
                }
              }
              var LCLXdata = new Array(25)
              LCLXdata.fill(returnData["LCL_X"])
              var LCL = {
                type: 'scatter',
                x: xa,
                y: LCLXdata,
                mode: 'lines',
                name: 'LCL',
                showlegend: true,
                line: {
                  color: 'red',
                  width: 2,
                  dash: 'dash'
                }
              }
              
              var data = [DataX,UCL,Centre,LCL]
              
              // layout
              var layout = {
                width: 800,
                height: 300,
                title: 'X_bar 管制圖',
                xaxis: {
                  domain: [0, 1], // 0 to 70% of width
                  zeroline: false
                },
                yaxis: {
                  range: [9.5, 10.5],
                  zeroline: false
                },
                xaxis2: {
                  domain: [0.8, 1] // 70 to 100% of width
                },
                yaxis2: {
                  anchor: 'x2',
                  showticklabels: false
                }
              }
              
              Plotly.plot('Xbar_div', data,layout);


              var DataR = {
                type: 'scatter',
                x: xa,
                y: returnData["r"],
                mode: 'lines+markers',
                name: 'Data',
                showlegend: true,
                hoverinfo: 'all',
                line: {
                  color: 'blue',
                  width: 2
                },
                marker: {
                  color: 'blue',
                  size: 8,
                  symbol: 'circle'
                }
              }
              
              var UCLRdata = new Array(25)
              UCLRdata.fill(returnData["UCL_R"])
              var UCLR = {
                type: 'scatter',
                x: xa,
                y: UCLRdata,
                mode: 'lines',
                name: 'UCL',
                showlegend: true,
                line: {
                  color: 'red',
                  width: 2,
                  dash: 'dash'
                }
              }              
              var CLRdata = new Array(25)
              CLRdata.fill(returnData["CL_R"])
              var CentreR = {
                type: 'scatter',
                x: xa,
                y: CLRdata,
                mode: 'lines',
                name: 'Centre',
                showlegend: true,
                line: {
                  color: 'grey',
                  width: 2
                }
              }
              var LCLRdata = new Array(25)
              LCLRdata.fill(returnData["LCL_R"])
              var LCLR = {
                type: 'scatter',
                x: xa,
                y: LCLRdata,
                mode: 'lines',
                name: 'LCL',
                showlegend: true,
                line: {
                  color: 'red',
                  width: 2,
                  dash: 'dash'
                }
              }
              
              var data = [DataR,UCLR,CentreR,LCLR]
              
              // layout
              var layout = {
                width: 800,
                height: 300,
                title: 'R 管制圖',
                xaxis: {
                  domain: [0, 1], // 0 to 70% of width
                  zeroline: false
                },
                yaxis: {
                  range: [-0.1, 0.8],
                  zeroline: false
                },
                xaxis2: {
                  domain: [0.8, 1] // 70 to 100% of width
                },
                yaxis2: {
                  anchor: 'x2',
                  showticklabels: false
                }
              }
              
              Plotly.plot('R_div', data,layout);

              // ca, cp, cpk
              if(Object.keys(returnData["x"]).length >= 25)
              {
                $("#caText").text("Ca : \t" + returnData["spcCa"].toFixed(3));
                $("#cpText").text("Cp : \t" + returnData["spcCp"].toFixed(3));
                $("#cpkText").text("Cpk : \t" + returnData["spcCpk"].toFixed(3));
                if(returnData["spcCpk"] >= 1.67)
                {
                    $("#cpkGrade").text("製程能力指標等級：A+");
                }
                else if(returnData["spcCpk"] < 1.67 && returnData["spcCpk"] >= 1.33)
                {
                    $("#cpkGrade").text("製程能力指標等級：A");
                }
                else if(returnData["spcCpk"] < 1.33 && returnData["spcCpk"] >= 1)
                {
                    $("#cpkGrade").text("製程能力指標等級：B");
                }
                else if(returnData["spcCpk"] < 1 && returnData["spcCpk"] >= 0.67)
                {
                    $("#cpkGrade").text("製程能力指標等級：C");
                }
                else if(returnData["spcCpk"] < 0.67)
                {
                    $("#cpkGrade").text("製程能力指標等級：D");
                }
              }
        },
        error: function(){
            console.log("==");
        },
    })
    return false;
}
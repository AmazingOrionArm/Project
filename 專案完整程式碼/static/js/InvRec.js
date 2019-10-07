$(document).ready(function()
{
    setInterval("startRequestInventroyRec()",2000);




});


function startRequestInventoryRec(){
    $.ajax({
        data: "", // get the form data
        type: "POST", // GET or POST
        url: "queryInventoryRec", // the file to call
        success: function(data){
            for(var i=1; i<= Object.keys(data).length; i++)
            {
      //Record
                $("#recordDate" + i).text(data["00" + i]["recordDate"]);
                $("#recordComponentNo" + i).text(data["00" + i]["recordComponentNo"]);
                $("#recordChange" + i).text(data["00" + i]["recordChange"]);


            }
        },
        error: function(){


        },
    })
    return false;
};






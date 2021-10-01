$(window).on('load', function () {
    $('#loading').hide();
})    
function performOCR(){
    loadFun();
    var files = document.getElementById("image_file").files
    var formData = new FormData();
    var endPoint = '/extract-text';
    if(files.length == 1){
        formData.append('image',files[0])
    }
    else{
        for(var i = 0; i < files.length; i++){
            formData.append('image' + i.toString(), files[i])
        }
        endPoint = '/bulk-extract-text'
    }
    
    axios({
        method: 'post',
        url: endPoint,
        data: formData,  
    }).then(function(response){
        $(window).on('load', function () {
            $('#loading').hide();
        }) 
        
        if(endPoint == '/extract-text'){
            swal("Converted Text", response.data.text);
            stopLoadfun()
        }
        else{
            swal("Request Received", "Converted files will start showing up at the bottom soon!");
            getConvertedFiles(response.data.task_id, response.data.num_files)
        }
    });
}

function stopLoadfun(){
    var load = document.getElementById("loader")
    load.style.display= 'none'

}

function loadFun(){
    var load = document.getElementById("loader")
    load.style.display = 'block'
}

function getConvertedFiles(taskId, numFiles){
    var count = 0;
    var dict = {}
    loadFun()
    var checker = setInterval(function(){
        $.ajax({
            type: 'GET',
            url: '/bulk-output/' + taskId,
            contentType: false,
            cache: false,
            processData: false,
            success: function(data){
                wrapper = document.getElementById("bulk_result")
                for (var key in data.output) {
                    if(dict[key]!=true){
                        var element = document.createElement("button");
                        stopLoadfun()
                        element.setAttribute("class", "btn btn-primary")
                        element.setAttribute("info", data.output[key])
                        element.setAttribute("id", key)
                        element.setAttribute("onclick", "displayText(this.id)")
                        element.innerHTML = key
                        wrapper.appendChild(element)
                        count=count+1;
                        dict[key]=true
                    }
                    else{
                        stopChecker()
                    }
                }
                if(Object.keys(data.output).length >= numFiles) {
                    stopChecker()
                }
            }
        });
    }, 3000);

    function stopChecker(){
        clearInterval(checker)
    }
}

function displayText(id){
    swal("Converted Text", document.getElementById(id).getAttribute("info"))
}

// <!-- USING AJAX METHOD -->

// function performOCR(){
//     var files = document.getElementById("image_file").files
//     var formData = new FormData();
//     var endPoint = '/extract-text';
//     if(files.length == 1){
//         formData.append('image',files[0])
//     }
//     else{
//         for(var i = 0; i < files.length; i++){
//             formData.append('image' + i.toString(), files[i])
//         }
//         endPoint = '/bulk-extract-text'
//     }

//     var object = {};
//     formData.forEach((value, key) => object[key] = value);
//     var json = JSON.stringify(object)

//     $.ajax({
//         type: 'POST',
//         url: endPoint,
//         data: formData,
//         contentType: false,
//         cache: false,
//         processData: false,
//         success: function(data){
//             if(endPoint == '/extract-text'){
//                 swal("Converted Text", data.text);
//             }
//             else{
//                 swal("Request Received", "Converted files will start showing up at the bottom soon!");
//                 getConvertedFiles(data.task_id, data.num_files)
//             }
//         }
//     });
// }
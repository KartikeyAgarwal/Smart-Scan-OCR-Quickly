// loader which is displayed till the website loads at the start
$(window).on('load', function () {
    $('#loading').hide();
})    

// performs OCR on the uploaded files
// connects with the backend using the Axios method
function performOCR(){
    console.log("performing OCR.....!")
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
    console.log(endPoint)
    axios({
        method: 'post',
        url: endPoint,
        data: formData,  
    }).then(function(response){
        $(window).on('load', function () {
            $('#loading').hide();
        }) 
        
        if(endPoint == '/extract-text'){
            console.log(endPoint)
            console.log(response.data.text)
            swal({
                title:"Converted Text!",
                text: response.data.text,
                icon: "success",
                buttons: {
                    download: {
                        text: "Download",
                        value: "download",
                    },
                    ok: {
                        text: "OK",
                        value: "ok",
                    }
                }
            })
            .then((value) => {
                switch(value) {
                    case "download":
                        console.log(response.data)
                        downloadText(response.data.file_name, response.data.text)
                        break;
                    case "ok":
                        break;
                }
            });

            stopLoadfun()
        }
        else{
            console.log(endPoint)
            swal("Request Received", "Converted files will start showing up at the bottom soon!");
            getConvertedFiles(response.data.task_id, response.data.num_files)
        }
    });
}

// function to download the text of the file in the PDF format
function downloadText(file_name, file_text){
    console.log("here")
    console.log(file_name)
    console.log(file_text)
    axios({
        method: 'post',
        url: '/download',
        data: {
            "text": file_text,
            "file_name": file_name,
        }
    })
    .then(function(response){
        console.log(response)
        if(response.data.status == true){
            swal({
                title:"Download Done!",
                icon: "success",
            })
        }
        else{
            swal({
                title: "Error downloading..!",
                text: "Please check the file again !!",
                icon: "error",
            })
        }    
    })
}

// stops loader
function stopLoadfun(){
    var load = document.getElementById("loader")
    load.style.display= 'none'

}

// displays loader during loading
function loadFun(){
    var load = document.getElementById("loader")
    load.style.display = 'block'
}

// function to display the OCR performed multiple files in the grid 
// which can be invoked to provide different functions to user
function getConvertedFiles(taskId, numFiles){
    var count = 0;
    var dict = {}
    loadFun()
    text=""
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
                        console.log(key, data.output[key])
                        element.setAttribute("id", key)
                        text = data.output[key]
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

// displays text of the files in the popup box
function displayText(file_name_id){
    file_text = document.getElementById(file_name_id).getAttribute("info")
    console.log(file_text)
    swal({
        title:"Converted Text!",
        text: file_text,
        icon: "success",
        buttons: {
            download: {
                text: "Download",
                value: "download",
            },
            ok: {
                text: "OK",
                value: "ok",
            }
        }
    })
    .then((value) => {
        switch(value) {
            case "download":
                console.log("download")
                console.log(file_text)
                downloadText(file_name_id, file_text)
                break;
            case "ok":
                break;
        }
    });
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
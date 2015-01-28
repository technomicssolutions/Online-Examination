function ExamController($scope, $element, $http, $timeout, share, $location)
{

    $scope.init = function(csrf_token)
    {
        $scope.popup = '';
        $scope.csrf_token = csrf_token;
        $scope.error_flag = false;
        $scope.edit_marks = false;
        $scope.display_marks = false;
        $scope.exam = {
            'exam': '',
            'total_mark': '',
            'no_subjects':'',
            'id' :'',
            'subjects': ''               
        }
        $scope.subjects = [];
        get_course_list($scope, $http);
        var date_pick = new Picker.Date($$('#start_date'), {
            timePicker: false,
            positionOffset: {x: 5, y: 0},
            pickerClass: 'datepicker_bootstrap',
            useFadeInOut: !Browser.ie,
            format:'%d/%m/%Y',
        });

        var date_pick = new Picker.Date($$('#end_date'), {
            timePicker: false,
            positionOffset: {x: 5, y: 0},
            pickerClass: 'datepicker_bootstrap',
            useFadeInOut: !Browser.ie,
            format:'%d/%m/%Y',
        });
        $scope.visible_list = [];
    }
    $scope.attach_subject_datepicker = function(){
        for(var i=0;i<$scope.subjects.length;i++){
            var date_pick = new Picker.Date($$('#subject_date_'+i), {
                timePicker: false,
                positionOffset: {x: 5, y: 0},
                pickerClass: 'datepicker_bootstrap',
                useFadeInOut: !Browser.ie,
                format:'%d/%m/%Y',
            });
        }
    }
    $scope.calculate_total_marks = function(){
        var total = 0;
        for(var i=0; i<$scope.subjects.length; i++) {
            total = total + parseFloat($scope.subjects[i].total_mark);
        }
        $scope.exam_total = total;
    }

    $scope.hide_popup_windows = function(){
        $('#add_exam_schedule_details')[0].setStyle('display', 'none'); 
    }

    // $scope.add_new_exam_schedule = function() {
    //     $scope.start_date = $$('#start_date')[0].get('value');
    //     $scope.end_date = $$('#end_date')[0].get('value');
    //     $scope.hide_popup_windows();
    //     $('#add_exam_schedule_details')[0].setStyle('display', 'block');
    //     $scope.popup = new DialogueModelWindow({

    //         'dialogue_popup_width': '68%',
    //         'message_padding': '0px',
    //         'left': '28%',
    //         'top': '182px',
    //         'height': 'auto',
    //         'content_div': '#add_exam_schedule_details'
    //     });

    //     var height = $(document).height();
    //     $scope.popup.set_overlay_height(height);
    //     $scope.popup.show_content();
    // }

    $scope.add_subjects = function(){
        var subjects = $scope.no_subjects;
        var diff = $scope.no_subjects - $scope.subjects.length;
        if (diff > 0) {
            for (i=0; i <diff; i++){
                $scope.subjects.push({
                    'subject_name': '',
                    'duration': '', 
                    'duration_parameter': '',
                    'total_mark': '',
                    'pass_mark': '',
                                 
                });
            }
        } else {
            diff = $scope.subjects.length - $scope.no_subjects;
            for (i=diff; i >0; i--){
                last_index = $scope.subjects.indexOf($scope.subjects[$scope.subjects.length - 1]);
                $scope.subjects.splice(last_index, 1);
            }
        }
    }
    $scope.validate_exam_schedule = function() {

        $scope.validation_error = '';
        $scope.start_date = $$('#start_date')[0].get('value');
        $scope.end_date = $$('#end_date')[0].get('value');
        if($scope.course == '' || $scope.course == undefined) {
            $scope.validation_error = "Please Select a course " ;
            return false;
        }else if($scope.start_date == '' || $scope.start_date == undefined) {
            $scope.validation_error = "Please Select a start date" ;
            return false;
        }else if($scope.end_date == '' || $scope.end_date == undefined) {
            $scope.validation_error = "Please Select a end date" ;
            return false;
        }else if($scope.no_subjects == '' || $scope.no_subjects == undefined || !Number($scope.no_subjects)) {
            $scope.validation_error = "Please Enter no of subjects" ;
            return false;
        }else if($scope.no_subjects.length > 0){
            for(var i=0;i<$scope.no_subjects.length;i++){
                if($scope.subjects[i].subject_name == '' || $scope.subjects[i].subject_name == undefined) {
                    $scope.validation_error = "Please Enter  subject name" ;
                    return false;
                }else if($scope.subjects[i].duration == '' || $scope.subjects[i].duration == undefined) {
                    $scope.validation_error = "Please Enter duration" ;
                    return false;
                }else if($scope.subjects[i].duration_parameter == '' || $scope.subjects[i].duration_parameter == undefined) {
                    $scope.validation_error = "Please Enter hours or minutes" ;
                    return false;
                }else if($scope.subjects[i].total_mark == '' || $scope.subjects[i].total_mark == undefined || !Number($scope.subjects[i].total_mark)) {
                    $scope.validation_error = "Please Enter total marks" ;
                    return false;
                }else if($scope.subjects[i].pass_mark == '' || $scope.subjects[i].pass_mark == undefined || !Number($scope.subjects[i].pass_mark)) {
                    $scope.validation_error = "Please Enter pass mark" ;
                    return false;
                }
            }
        }
        return true;   
    }
    $scope.save_new_exam_schedule = function() {
        // for(var i=0;i<$scope.subjects.length;i++){
        //     $scope.subjects[i].date = $$('#subject_date_'+i)[0].get('value');
        // }
        if($scope.validate_exam_schedule()) {
            $scope.start_date = $$('#start_date')[0].get('value');
            $scope.end_date = $$('#end_date')[0].get('value');
            params = {
                'course': $scope.course,
                'semester': $scope.semester,
                'start_date': $scope.start_date,
                'end_date': $scope.end_date,
                'exam_total': $scope.exam_total,
                'no_subjects': $scope.no_subjects,                   
                'subjects': angular.toJson($scope.subjects),
                "csrfmiddlewaretoken" : $scope.csrf_token
            }
            $http({
                method: 'post',
                url: "/exam/save_new_exam_schedule/",
                data: $.param(params),
                headers: {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                }
            }).success(function(data, status) {
                
                if (data.result == 'error'){
                    $scope.error_flag=true;
                    $scope.message = data.message;
                    
                } else {                                                
                    document.location.href ='/exam/schedule_exam/';                    
                }
            }).error(function(data, success){
                $scope.error_flag=true;
                $scope.message = data.message;
            });
        }
    }
    $scope.display_exam_schedule = function(exam) {
        
        $scope.exam_schedule_id = exam.id;
        $scope.url = '/exam/view_exam_schedule/' + $scope.exam_schedule_id+ '/';
        $http.get($scope.url).success(function(data)
        {
            $scope.exam_schedule = data.exam_schedule[0];
        }).error(function(data, status)
        {
            console.log(data || "Request failed");
        });

        $scope.hide_popup_windows();
        $('#exam_schedule_details_view')[0].setStyle('display', 'block');
        
        $scope.popup = new DialogueModelWindow({                
            'dialogue_popup_width': '90%',
            'message_padding': '0px',
            'left': '28%',
            'top': '182px',
            'height': 'auto',
            'content_div': '#exam_schedule_details_view'
        });
        
        var height = $(document).height();
        $scope.popup.set_overlay_height(height);
        $scope.popup.show_content();
    }
    $scope.get_semester = function(){
        $scope.edit_marks = false;
        $scope.display_marks = false;
        
        var url = '/college/get_semester/?id='+$scope.course;
        $http.get(url).success(function(data) {
            $scope.semesters = data.semesters;
        }).error(function(data, status)
        {
            console.log(data || "Request failed");
        });
    }
    $scope.get_exam_schedules = function() {
        $scope.url = '/exam/schedule_exam/?course='+ $scope.course;
        $http.get($scope.url).success(function(data)
        {
            $scope.exams = data.exams;
            if($scope.exams.length == 0){
                $scope.message = "No exams Scheduled yet";
            } else {
                paginate($scope.exams, $scope);
            }
        }).error(function(data, status)
        {
            console.log(data || "Request failed");
        });
    } 
    $scope.select_page = function(page){
        select_page(page, $scope.exams, $scope);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
    $scope.close_popup = function(){
        $scope.edit_marks = false;
        $scope.display_marks = false;
        $scope.popup.hide_popup();
    }
}

function EditExamController($scope, $element, $http, $timeout, share, $location)
{
    $scope.init = function(csrf_token, exam_schedule_id)
    {
        $scope.csrf_token = csrf_token;
        $scope.error_flag = false;
        $scope.exam_schedule_id = exam_schedule_id;
        $scope.get_exam_schedule_details();
        new Picker.Date($$('#start_date'), {
                timePicker: false,
                positionOffset: {x: 5, y: 0},
                pickerClass: 'datepicker_bootstrap',
                useFadeInOut: !Browser.ie,
                format:'%d/%m/%Y',
        });
        new Picker.Date($$("#end_date"), {
                timePicker: false,
                positionOffset: {x: 5, y: 0},
                pickerClass: 'datepicker_bootstrap',
                useFadeInOut: !Browser.ie,
                format:'%d/%m/%Y',
        });
        $scope.attached_date_picker = false;
    }
    $scope.get_exam_schedule_details = function(){
        $scope.url = '/exam/view_exam_schedule/' + $scope.exam_schedule_id+ '/';
        $http.get($scope.url).success(function(data)
        {
            $scope.exam_schedule = data.exam_schedule[0];
        }).error(function(data, status)
        {
            console.log(data || "Request failed");
        });
    }
    $scope.attach_date_picker = function() {   
        if(!$scope.attached_date_picker)     {
            for(i=0; i<$scope.exam_schedule.subjects.length; i++){
                var id_name = '#';
                id_name = id_name + 'subject_date_'+i;
                new Picker.Date($$(id_name), {
                    timePicker: false,
                    positionOffset: {x: 5, y: 0},
                    pickerClass: 'datepicker_bootstrap',
                    useFadeInOut: !Browser.ie,
                    format:'%d/%m/%Y',
                });
            } 
        }        
    }
    $scope.validate_exam_schedule = function() {
        $scope.validation_error = '';
        if($scope.exam_schedule.exam_name == '' || $scope.exam_schedule.exam_name == undefined) {
            $scope.validation_error = "Please Enter a exam name ";
            return false;
        }else if($scope.exam_schedule.course == '' || $scope.exam_schedule.course == undefined) {
            $scope.validation_error = "Please Select a course ";
            return false;
        }else if($scope.exam_schedule.batch == '' || $scope.exam_schedule.batch == undefined) {
            $scope.validation_error = "Please Select a batch name";
            return false;
        }else if($scope.exam_schedule.start_date == '' || $scope.exam_schedule.start_date == undefined) {
            $scope.validation_error = "Please Select a start date";
            return false;
        }else if($scope.exam_schedule.end_date == '' || $scope.exam_schedule.end_date == undefined) {
            $scope.validation_error = "Please Select a end date";
            return false;
        }else if($scope.exam_schedule.no_subjects == '' || $scope.exam_schedule.no_subjects == undefined || !Number($scope.exam_schedule.no_subjects)) {
            console.log($scope.exam_schedule.no_subjects);
            $scope.validation_error = "Please Enter no of subjects";
            return false;
        }else if($scope.exam_schedule.no_subjects > 0){
            for(var i=0;i<$scope.exam_schedule.subjects.length;i++){
                if($scope.exam_schedule.subjects[i].subject_name == '' || $scope.exam_schedule.subjects[i].subject_name == undefined) {
                    $scope.validation_error = "Please Enter  subject name";
                    return false;
                }else if($scope.subjects[i].duration == '' || $scope.subjects[i].duration == undefined) {
                    $scope.validation_error = "Please Enter duration" ;
                    return false;
                }else if($scope.subjects[i].duration_parameter == '' || $scope.subjects[i].duration_parameter == undefined) {
                    $scope.validation_error = "Please Enter hours or minutes" ;
                    return false;
                }else if($scope.exam_schedule.subjects[i].total_mark == '' || $scope.exam_schedule.subjects[i].total_mark == undefined || !Number($scope.exam_schedule.subjects[i].total_mark)) {
                    $scope.validation_error = "Please Enter total marks" ;
                    return false;
                }else if($scope.exam_schedule.subjects[i].pass_mark == '' || $scope.exam_schedule.subjects[i].pass_mark == undefined || !Number($scope.exam_schedule.subjects[i].pass_mark)) {
                    $scope.validation_error = "Please Enter pass mark" ;
                    return false;
                }else if($scope.exam_schedule.subjects[i].date == '' || $scope.exam_schedule.subjects[i].date == undefined) {
                    $scope.validation_error = "Please Select a subject date" ;
                    return false;
                }
            }
        }
        return true;   
    }
    $scope.save_exam_schedule = function() {
        for(var i=0;i<$scope.exam_schedule.subjects.length;i++){
            $scope.exam_schedule.subjects[i].date = $$('#subject_date_'+i)[0].get('value');
        }
        $scope.exam_schedule.start_date = $$('#start_date')[0].get('value');
        $scope.exam_schedule.end_date = $$('#end_date')[0].get('value');
        if($scope.validate_exam_schedule()) {            
            params = { 
                'exam_name':$scope.exam_schedule.exam_name,
                'course': $scope.exam_schedule.course,
                'batch': $scope.exam_schedule.batch,
                'semester': $scope.exam_schedule.semester,
                'start_date': $scope.exam_schedule.start_date,
                'end_date': $scope.exam_schedule.end_date,
                'exam_total': $scope.exam_schedule.exam_total,
                'no_subjects': $scope.exam_schedule.no_subjects,                   
                'subjects': angular.toJson($scope.exam_schedule.subjects),
                "csrfmiddlewaretoken" : $scope.csrf_token
            }
            $http({
                method: 'post',
                url: "/exam/edit_exam_schedule/"+$scope.exam_schedule_id+"/",
                data: $.param(params),
                headers: {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                }
            }).success(function(data, status) {
                if (data.result == 'error'){
                    $scope.error_flag=true;
                    $scope.message = data.message;
                } else {
                    document.location.href ='/exam/schedule_exam/';
                }
            }).error(function(data, success){
                $scope.error_flag=true;
                $scope.message = data.message;
            });
        }
    }
    $scope.add_subject = function(){
        $scope.exam_schedule.subjects.push({
            "subject_id": "", 
            "subject_name": "", 
            "pass_mark": "", 
            "total_mark": "", 
            "end_time": "", 
            "date": "", 
            "start_time": ""
        })
        $scope.attached_date_picker = false;
        $scope.attach_date_picker();
        $scope.exam_schedule.no_subjects = $scope.exam_schedule.no_subjects + 1;
    }
    $scope.remove_subject = function(subject){
        index = $scope.exam_schedule.subjects.indexOf(subject);
        $scope.exam_schedule.subjects.splice(index, 1);
        $scope.exam_schedule.no_subjects = $scope.exam_schedule.no_subjects - 1;
    }
    $scope.calculate_total_marks = function(){
        var total = 0;
        for(var i=0; i<$scope.exam_schedule.subjects.length; i++) {
            total = total + parseFloat($scope.exam_schedule.subjects[i].total_mark);
        }
        $scope.exam_schedule.exam_total = total;
    }    
}

function QuestionController($scope, $element, $http, $timeout, share, $location)
{
    $scope.init = function(csrf_token)
    {
        
        $scope.csrf_token = csrf_token;
        $scope.error_flag = false;
        $scope.edit_marks = false;
        $scope.display_marks = false;
        $scope.exam_name = '';
        $scope.question_details = {
            'course': '',
            'exam': '',
            'semester': '',
            'questions': [ 
                {
                'question': '',
                'choices': [
                    {
                        'choice': '', 
                        'correct_answer': false,
                    }
                ],
                'mark': '', 
                 }
                
            ],
            'subject': '',
        };
        $scope.subjects = [];
        $scope.visible_list = [];
        get_course_list($scope, $http);
        var date_pick = new Picker.Date($$('#start_date'), {
            timePicker: false,
            positionOffset: {x: 5, y: 0},
            pickerClass: 'datepicker_bootstrap',
            useFadeInOut: !Browser.ie,
            format:'%d/%m/%Y',
        });

        var date_pick = new Picker.Date($$('#end_date'), {
            timePicker: false,
            positionOffset: {x: 5, y: 0},
            pickerClass: 'datepicker_bootstrap',
            useFadeInOut: !Browser.ie,
            format:'%d/%m/%Y',
        });
    }
    $scope.get_semester = function(){
        $scope.edit_marks = false;
        $scope.display_marks = false;
        $scope.exam_name = '';
        $scope.subjects = ''; 
        var url = '/college/get_semester/?id='+$scope.question_details.course;
        $http.get(url).success(function(data) {
            $scope.semesters = '';
            $scope.semesters = data.semesters;
        }).error(function(data, status)
        {
            console.log(data || "Request failed");
        });
    }
    $scope.validate_marks = function() {        
        $scope.validation_error = '';
        $scope.flag = 0;
       
        if($scope.question_details.course == '' || $scope.question_details.course== undefined) {
            $scope.validation_error = "Please select course " ;
            return false;
        }else if($scope.question_details.semester == '' || $scope.question_details.semester== undefined) {
            $scope.validation_error = "Please select semester " ;
            return false;
        } return true;
    }

    $scope.save_questions = function() {
        if($scope.validate_marks()){ 
            for(i=0;i<$scope.question_details.questions.length;i++){
                for(j=0;j<$scope.question_details.questions[i].choices.length;j++){
                    if($scope.question_details.questions[i].choices[j].correct_answer == true){
                        $scope.question_details.questions[i].choices[j].correct_answer = "true";
                    }else{
                        $scope.question_details.questions[i].choices[j].correct_answer = "false";
                    }
                }
            }  
            params = { 
                'question_details': angular.toJson($scope.question_details),
                "csrfmiddlewaretoken" : $scope.csrf_token
            }
            $http({
                method: 'post',
                url: "/exam/save_marks/",
                data: $.param(params),
                headers: {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                }
            }).success(function(data, status) {
                if (data.result == 'error'){
                    $scope.error_flag=true;
                    $scope.message = data.message;
                } else {
                    document.location.href ='/exam/marks/';
                }
            }).error(function(data, success){
                $scope.error_flag=true;
                $scope.message = data.message;
            });
        }  
    }              
    

    $scope.add_questions = function(){
        $scope.question_details.questions.push({
            'question': '',
            'choices': [],
            'mark': '',            
        });
    }
     $scope.add_choices = function(question){
        question.choices.push({
           
            'choice': '', 
            'correct_answer': false,
        });
    }
     

    $scope.get_exams = function(){    
        $scope.validation_error = "";
        $scope.exam_name = '';
        $scope.subjects = '';    
        $scope.url = '/exam/get_exam/'+ $scope.question_details.course+ '/'+ $scope.question_details.semester+ '/';
        $http.get($scope.url).success(function(data)
        {   console.log(data.exams)
            if (data.result == 'ok') {
                $scope.question_details.exam = data.exams.exam;
                $scope.exam_name = data.exams.exam_name;
                $scope.subjects = data.exams.subjects_data;
            } else {
                $scope.validation_error = "No exam in this course";
            }          
        }).error(function(data, status)
        {
            console.log(data || "Request failed");
        });
    } 
   
    $scope.select_page = function(page){
        select_page(page, $scope.students, $scope, 2);
    }
    $scope.range = function(n) {
        return new Array(n);
    }
}
function calculate_endtime($scope, $http, duration_parameter, duration) {
    var today=new Date();
    var h=today.getHours();
    var m=today.getMinutes();
    var s=today.getSeconds();
    
    var end_time_hour = h;
    var end_time_minutes = m;
    if(duration_parameter == 'Hours'){
        end_time_hour = parseFloat(duration) + parseFloat(end_time_hour);
    }
    else {
        end_time_minutes = parseFloat(duration) + parseFloat(end_time_minutes);
    }
    var ampm = end_time_hour >= 12 ? 'pm' : 'am';
    end_time_hour = end_time_hour % 12;
    end_time_hour = end_time_hour ? end_time_hour : 12; // the hour '0' should be '12'
    end_time_minutes = end_time_minutes < 10 ? '0'+end_time_minutes : end_time_minutes;
    $scope.end_time = end_time_hour+":"+end_time_minutes+":"+s +''+ampm;
}

function startTime($scope, $http) {
    var today=new Date();
    var h=today.getHours();
    var m=today.getMinutes();
    var s=today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    var ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    m = m < 10 ? '0'+m : m;
    // document.getElementById('txt').innerHTML = h+":"+m+":"+s+''+ampm;
    $scope.time_left = h+":"+m+":"+s+''+ampm;
    // $('#txt').countdown({until: $scope.time_left, format: 'HMS'});
    // var t = setTimeout(function(){startTime()},500);
}

function checkTime(i) {
    if (i<10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}
function WriteExamController($scope, $element, $http, $timeout, share, $location)
{    
    $scope.init = function(csrf_token)
    {
        
        $scope.csrf_token = csrf_token;
        $scope.is_exam = false;
        $scope.answer = '';
        var url = '/exam/write_exam/';
        $http.get(url).success(function(data) {
            $scope.student = data.student
        }).error(function(data, status)
        {
            console.log(data || "Request failed");
        });
        get_course_list($scope, $http);
        
    }

    $scope.get_semester = function(){
        $scope.edit_marks = false;
        $scope.display_marks = false;
        $scope.exam_name = '';
        $scope.subjects = ''; 
        var url = '/college/get_semester/?id='+$scope.course;
        $http.get(url).success(function(data) {
            $scope.semesters = '';
            $scope.semesters = data.semesters;
        }).error(function(data, status)
        {
            console.log(data || "Request failed");
        });
    }
    $scope.get_exams = function(){    
        $scope.validation_error = "";
        $scope.exam_name = '';
        $scope.subjects = '';    
        $scope.url = '/exam/get_exam/'+ $scope.course+ '/'+ $scope.semester+ '/';
        $http.get($scope.url).success(function(data)
        {   console.log(data.exams)
            if (data.result == 'ok') {
                $scope.exam = data.exams.exam;
                $scope.exam_name = data.exams.exam_name;
                $scope.subjects = data.exams.subjects_data;
                $scope.is_exam = true;
            } else {
                $scope.validation_error = "No exam in this course";
                $scope.is_exam = false;
            }          
        }).error(function(data, status)
        {
            console.log(data || "Request failed");
        });
    } 
    $scope.get_question_paper = function(subject){
        console.log(subject)
        var url = '/exam/get_questions/?subject='+$scope.subject.subject_id+'&exam='+$scope.exam;
        $http.get(url).success(function(data) {
            $scope.questions = '';
            $scope.exam_duration = subject.duration;
            $scope.duration = subject.duration_no;
            $scope.duration_parameter = subject.duration_parameter;
            $scope.questions = data.questions;
            calculate_endtime($scope,$http,$scope.duration_parameter,$scope.duration);
            startTime($scope, $http);
            String.prototype.toHHMMSS = function () {
                var sec_num = parseInt(this, 10); // don't forget the second parm
                var hours = Math.floor(sec_num / 3600);
                var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                var seconds = sec_num - (hours * 3600) - (minutes * 60);

                if (hours < 10) {
                    hours = "0" + hours;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                var time = hours + ':' + minutes + ':' + seconds;
                return time;
            }
            if (($scope.duration_parameter != '') || ($scope.duration_parameter !=undefined) && ($scope.duration_parameter=='Hours'))
                
                var count = String($scope.duration*3600); // it's 00:01:02
            else if(($scope.duration_parameter != '') || ($scope.duration_parameter !=undefined) && ($scope.duration_parameter=='Minutes'))
                var count = String($scope.duration*60)
            var counter = setInterval(timer, 1000);

            function timer() {


                // console.log(count);

                if (parseInt(count) <= 0) {
                    clearInterval(counter);
                    return;
                }
                var temp = count.toHHMMSS();
                count = (parseInt(count) - 1).toString();

                $('#txt').html(temp);
            }
            paginate($scope.questions, $scope);
        }).error(function(data, status)
        {
            console.log(data || "Request failed");
        });
    }
    $scope.select_page = function(page){
        select_page(page, $scope.questions, $scope, 1);
    }
    $scope.range = function(n) {
        return new Array(n);
    }

}